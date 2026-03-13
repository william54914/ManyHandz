"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";
import type { ChoreTemplate } from "@/lib/constants/chore-templates";

/**
 * Reusable mutation for batch-creating chores from preset templates.
 * Creates the necessary chore_categories first, then inserts all chores.
 * Used by both the onboarding flow and the dashboard empty state.
 */
export function useAddPresetChores(memberId: string | null) {
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templates: ChoreTemplate[]) => {
      if (!householdId || !memberId)
        throw new Error("Missing household or member");
      const supabase = createClient();

      // 1. Collect unique category names from selected templates
      const uniqueCategories = [
        ...new Set(templates.map((t) => t.category)),
      ];

      // 2. Check which categories already exist for this household
      const { data: existingCategories } = await supabase
        .from("chore_categories")
        .select("id, name")
        .eq("household_id", householdId);

      const existingNames = new Set(
        (existingCategories || []).map((c) => c.name)
      );

      // 3. Only insert categories that don't already exist
      const newCategories = uniqueCategories.filter(
        (name) => !existingNames.has(name)
      );

      if (newCategories.length > 0) {
        const categoryRows = newCategories.map((name) => {
          const def = DEFAULT_CATEGORIES.find((c) => c.name === name);
          return {
            household_id: householdId,
            name,
            icon: def?.icon ?? "home",
            color: def?.color ?? "#6b7280",
          };
        });

        const { error: catError } = await supabase
          .from("chore_categories")
          .insert(categoryRows);
        if (catError) throw catError;
      }

      // 4. Re-query to get all category IDs (existing + new)
      const { data: allCategories } = await supabase
        .from("chore_categories")
        .select("id, name")
        .eq("household_id", householdId);

      const categoryMap: Record<string, string> = {};
      for (const cat of allCategories || []) {
        categoryMap[cat.name] = cat.id;
      }

      // 5. Batch-insert chores (skip .select() to avoid RLS RETURNING issues)
      const choreRows = templates.map((t) => ({
        household_id: householdId,
        category_id: categoryMap[t.category] || null,
        name: t.name,
        description: t.description,
        difficulty: t.difficulty,
        estimated_minutes: t.estimatedMinutes,
        icon: t.icon,
        checklist: t.checklist.map((label) => ({
          id: crypto.randomUUID(),
          label,
          required: false,
        })),
        created_by: memberId,
      }));

      const { error: choreError } = await supabase
        .from("chores")
        .insert(choreRows);
      if (choreError) throw choreError;

      return { count: choreRows.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      queryClient.invalidateQueries({ queryKey: ["chore_categories"] });
    },
  });
}
