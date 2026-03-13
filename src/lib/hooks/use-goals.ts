"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";
import type {
  Goal,
  GoalContribution,
  GoalContributionSource,
  GoalStatus,
} from "@/lib/supabase/types";

export type GoalWithRelations = Goal & {
  members: Record<string, unknown>;
  goal_contributions: GoalContribution[];
};

export function useGoals() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("goals")
        .select("*, members!member_id(*), goal_contributions(*)")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GoalWithRelations[];
    },
    enabled: !!householdId,
  });

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const createGoal = useMutation({
    mutationFn: async (goal: {
      title: string;
      description?: string;
      icon: string;
      target_points: number;
      monetary_value?: number;
      member_id: string;
      auto_contribute_enabled: boolean;
      auto_contribute_percentage: number;
      created_by: string;
    }) => {
      if (!householdId) throw new Error("No household selected");
      const { data, error } = await supabase
        .from("goals")
        .insert({
          household_id: householdId,
          member_id: goal.member_id,
          title: goal.title,
          description: goal.description || null,
          icon: goal.icon,
          target_points: goal.target_points,
          monetary_value: goal.monetary_value || null,
          auto_contribute_enabled: goal.auto_contribute_enabled,
          auto_contribute_percentage: goal.auto_contribute_percentage,
          status: "active" as GoalStatus,
          created_by: goal.created_by,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created!");
    },
    onError: (e) => toast.error("Failed to create goal: " + e.message),
  });

  const updateGoal = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string | null;
      icon?: string;
      target_points?: number;
      monetary_value?: number | null;
      auto_contribute_enabled?: boolean;
      auto_contribute_percentage?: number;
      status?: GoalStatus;
    }) => {
      const { error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal updated!");
    },
    onError: (e) => toast.error("Failed to update goal: " + e.message),
  });

  const contributeToGoal = useMutation({
    mutationFn: async (params: {
      goalId: string;
      memberId: string;
      points: number;
      source: GoalContributionSource;
      sourceId?: string;
    }) => {
      const { error: contribError } = await supabase
        .from("goal_contributions")
        .insert({
          goal_id: params.goalId,
          member_id: params.memberId,
          points: params.points,
          source: params.source,
          source_id: params.sourceId || null,
        });
      if (contribError) throw contribError;

      // Update current_points on the goal
      const { data: goal } = await supabase
        .from("goals")
        .select("current_points, target_points")
        .eq("id", params.goalId)
        .single();

      if (goal) {
        const newPoints = (goal.current_points || 0) + params.points;
        const isCompleted = newPoints >= goal.target_points;
        await supabase
          .from("goals")
          .update({
            current_points: newPoints,
            ...(isCompleted
              ? {
                  status: "completed" as GoalStatus,
                  completed_at: new Date().toISOString(),
                }
              : {}),
          })
          .eq("id", params.goalId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Points contributed!");
    },
    onError: (e) => toast.error("Failed to contribute: " + e.message),
  });

  const cancelGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goals")
        .update({ status: "canceled" as GoalStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal canceled.");
    },
    onError: (e) => toast.error("Failed to cancel goal: " + e.message),
  });

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    createGoal,
    updateGoal,
    contributeToGoal,
    cancelGoal,
  };
}
