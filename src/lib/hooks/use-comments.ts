"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";
import type { AssignmentComment, Member } from "@/lib/supabase/types";

export interface CommentWithMember extends AssignmentComment {
  member: Member;
}

export function useComments(assignmentId: string | null) {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  // ---- Fetch comments ----
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", assignmentId],
    queryFn: async () => {
      if (!assignmentId || !householdId) return [];
      const { data, error } = await supabase
        .from("assignment_comments")
        .select("*, member:members!member_id(*)")
        .eq("assignment_id", assignmentId)
        .eq("household_id", householdId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as CommentWithMember[];
    },
    enabled: !!assignmentId && !!householdId,
  });

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!assignmentId || !householdId) return;

    const channel = supabase
      .channel(`comments:${assignmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignment_comments",
          filter: `assignment_id=eq.${assignmentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["comments", assignmentId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId, householdId, supabase, queryClient]);

  // ---- Add comment ----
  const addComment = useMutation({
    mutationFn: async (params: { memberId: string; body: string }) => {
      if (!assignmentId || !householdId)
        throw new Error("No assignment selected");
      if (params.body.length > 500)
        throw new Error("Comment exceeds 500 characters");

      const { data, error } = await supabase
        .from("assignment_comments")
        .insert({
          assignment_id: assignmentId,
          household_id: householdId,
          member_id: params.memberId,
          body: params.body.trim(),
        })
        .select("*, member:members!member_id(*)")
        .single();
      if (error) throw error;
      return data as CommentWithMember;
    },
    onMutate: async (params) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: ["comments", assignmentId],
      });
      const previous = queryClient.getQueryData<CommentWithMember[]>([
        "comments",
        assignmentId,
      ]);

      queryClient.setQueryData<CommentWithMember[]>(
        ["comments", assignmentId],
        (old = []) => [
          ...old,
          {
            id: `optimistic-${Date.now()}`,
            assignment_id: assignmentId!,
            household_id: householdId!,
            member_id: params.memberId,
            body: params.body.trim(),
            created_at: new Date().toISOString(),
            member: { display_name: "You", avatar_url: null } as Member,
          },
        ]
      );

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["comments", assignmentId],
          context.previous
        );
      }
      toast.error("Failed to add comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", assignmentId],
      });
    },
  });

  return { comments, isLoading, addComment };
}
