"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { createClient } from "@/lib/supabase/client";
import { modeConfigs, type ModeConfig, type ModePermissions, type ModeFeatures, type ModeUI, type NavTab } from "@/lib/constants/modes";

export function useHouseholdMode() {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: memberData } = useQuery({
    queryKey: ["member-context", activeHouseholdId],
    queryFn: async () => {
      if (!activeHouseholdId) return null;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: member } = await supabase
        .from("members")
        .select("*, households(*)")
        .eq("household_id", activeHouseholdId)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();
      return member;
    },
    enabled: !!activeHouseholdId,
  });

  return useMemo(() => {
    const mode = (memberData?.households as any)?.mode || "family";
    const role = memberData?.role || "roommate";
    const config = modeConfigs[mode] || modeConfigs.family;
    const permissions = config.permissions[role] || config.permissions[config.creatorRole];
    const features = config.features;
    const ui = config.ui;
    const navTabs = config.navTabs[role] || config.navTabs[config.creatorRole];

    return {
      mode,
      role,
      config,
      permissions,
      features,
      ui,
      navTabs,
      memberId: memberData?.id || null,
      memberData,
      isAdmin: permissions?.canEditHouseholdSettings ?? false,
    };
  }, [memberData]);
}
