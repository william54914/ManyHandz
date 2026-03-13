"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";

export function useHouseholds() {
  const supabase = createClient();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);

  const { data: households = [], isLoading } = useQuery({
    queryKey: ["households"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("members")
        .select("household_id, households(*)")
        .eq("user_id", user.id)
        .eq("is_active", true);
      return data?.map((m) => m.households).filter(Boolean) || [];
    },
  });

  const activeHousehold = households.find((h: any) => h?.id === activeHouseholdId) || households[0];

  // Auto-select first household
  if (households.length > 0 && !activeHouseholdId) {
    setActiveHousehold((households[0] as any)?.id);
  }

  return { households, activeHousehold, isLoading, setActiveHousehold };
}
