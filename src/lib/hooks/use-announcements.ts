"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";
import type { Announcement, AnnouncementPriority } from "@/lib/supabase/types";

export type AnnouncementWithAuthor = Announcement & {
  author: Record<string, unknown>;
};

export function useAnnouncements() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("announcements")
        .select("*, author:members!author_id(*)")
        .eq("household_id", householdId)
        .eq("pinned", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Filter out expired announcements
      const now = new Date();
      return ((data || []) as AnnouncementWithAuthor[]).filter(
        (a) => !a.expires_at || new Date(a.expires_at) > now
      );
    },
    enabled: !!householdId,
  });

  const activeAnnouncements = announcements.filter((a) => a.pinned);
  const urgentAnnouncements = announcements.filter((a) => a.priority === "urgent");

  const createAnnouncement = useMutation({
    mutationFn: async (params: {
      title: string;
      body?: string;
      priority: AnnouncementPriority;
      expiresAt?: string;
      authorId: string;
    }) => {
      if (!householdId) throw new Error("No household selected");
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          household_id: householdId,
          author_id: params.authorId,
          title: params.title,
          body: params.body || null,
          priority: params.priority,
          pinned: true,
          expires_at: params.expiresAt || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement posted!");
    },
    onError: (e) => toast.error("Failed to post announcement: " + e.message),
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      body?: string;
      priority?: AnnouncementPriority;
      expires_at?: string | null;
    }) => {
      const { error } = await supabase
        .from("announcements")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement updated!");
    },
    onError: (e) => toast.error("Failed to update announcement: " + e.message),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .update({ pinned: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement removed.");
    },
    onError: (e) => toast.error("Failed to remove announcement: " + e.message),
  });

  return {
    announcements,
    activeAnnouncements,
    urgentAnnouncements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
