"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import type { Member } from "@/lib/supabase/types";

export function useMembers() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("household_id", householdId)
        .eq("is_active", true)
        .order("joined_at");
      return (data || []) as Member[];
    },
    enabled: !!householdId,
  });

  const currentMember = useQuery({
    queryKey: ["current-member", householdId],
    queryFn: async () => {
      if (!householdId) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("household_id", householdId)
        .eq("user_id", user.id)
        .single();
      return data as Member | null;
    },
    enabled: !!householdId,
  });

  return { members, currentMember: currentMember.data, isLoading };
}
