"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";
import type { RotationGroup } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** How many days between each occurrence for a given frequency. */
function frequencyToDays(f: string): number {
  switch (f) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    default:
      return 7;
  }
}

/** How many weeks ahead to pre-generate assignments for each frequency. */
function lookaheadWeeks(f: string): number {
  switch (f) {
    case "daily":
      return 4; // ~28 assignments
    case "weekly":
      return 8; // 8 assignments
    case "biweekly":
      return 12; // 6 assignments
    case "monthly":
      return 16; // ~4 assignments
    default:
      return 8;
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export interface RotationGroupWithChore extends RotationGroup {
  chores: {
    id: string;
    name: string;
    icon: string;
    difficulty: number;
    estimated_minutes: number;
    chore_categories: { id: string; name: string; color: string } | null;
  } | null;
}

export function useRotationGroups() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  const { data: rotationGroups = [], isLoading } = useQuery({
    queryKey: ["rotation-groups", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data } = await supabase
        .from("rotation_groups")
        .select("*, chores(*, chore_categories(*))")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });
      return (data || []) as RotationGroupWithChore[];
    },
    enabled: !!householdId,
  });

  const createRotation = useMutation({
    mutationFn: async (params: {
      chore_id: string;
      member_order: string[];
      rotation_type: "round_robin" | "fixed";
      frequency: "daily" | "weekly" | "biweekly" | "monthly";
      start_date: string;
    }) => {
      // 1. Create the rotation group
      const { data, error } = await supabase
        .from("rotation_groups")
        .insert({
          household_id: householdId!,
          chore_id: params.chore_id,
          member_order: params.member_order,
          rotation_type: params.rotation_type,
          frequency: params.frequency,
          start_date: params.start_date,
          current_index: 0,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;

      // 2. Pre-generate assignments for the next several weeks so the
      //    calendar is populated immediately. The cron job handles any
      //    assignments beyond this lookahead window.
      if (params.member_order.length > 0) {
        const intervalDays = frequencyToDays(params.frequency);
        const weeks = lookaheadWeeks(params.frequency);
        const horizon = addDays(new Date(), weeks * 7);
        const start = new Date(params.start_date + "T00:00:00");

        const assignments: Array<{
          chore_id: string;
          household_id: string;
          assigned_to: string;
          rotation_group_id: string;
          due_date: string;
          status: string;
          checklist_progress: never[];
        }> = [];

        let memberIndex = 0;
        let cursor = new Date(start);

        while (cursor <= horizon) {
          // Determine who gets this occurrence
          let assignee: string;
          if (params.rotation_type === "fixed") {
            assignee = params.member_order[0];
          } else {
            // round_robin: cycle through members in order
            assignee =
              params.member_order[memberIndex % params.member_order.length];
            memberIndex++;
          }

          assignments.push({
            chore_id: params.chore_id,
            household_id: householdId!,
            assigned_to: assignee,
            rotation_group_id: data.id,
            due_date: formatDate(cursor),
            status: "pending",
            checklist_progress: [],
          });

          // Advance to next occurrence
          cursor = addDays(cursor, intervalDays);
        }

        if (assignments.length > 0) {
          const { error: assignErr } = await supabase
            .from("assignments")
            .insert(assignments);
          if (assignErr) {
            console.error("Failed to create assignments:", assignErr);
          }
        }

        // Update current_index so the cron job knows where to pick up
        if (params.rotation_type === "round_robin" && assignments.length > 0) {
          const lastIndex =
            (assignments.length - 1) % params.member_order.length;
          await supabase
            .from("rotation_groups")
            .update({ current_index: lastIndex })
            .eq("id", data.id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rotation-groups"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
      toast.success("Schedule created!");
    },
    onError: (error) => {
      toast.error("Failed to create schedule: " + error.message);
    },
  });

  const updateRotation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      member_order?: string[];
      rotation_type?: "round_robin" | "fixed";
      frequency?: "daily" | "weekly" | "biweekly" | "monthly";
      start_date?: string;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from("rotation_groups")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rotation-groups"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
      toast.success("Schedule updated!");
    },
    onError: (error) => {
      toast.error("Failed to update schedule: " + error.message);
    },
  });

  const deleteRotation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rotation_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rotation-groups"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
      toast.success("Schedule deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete schedule: " + error.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("rotation_groups")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rotation-groups"] });
      toast.success(
        variables.is_active ? "Schedule resumed!" : "Schedule paused!"
      );
    },
    onError: (error) => {
      toast.error("Failed to update schedule: " + error.message);
    },
  });

  return {
    rotationGroups,
    isLoading,
    createRotation,
    updateRotation,
    deleteRotation,
    toggleActive,
  };
}
