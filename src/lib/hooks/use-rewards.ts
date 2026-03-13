"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";
import type { Reward, RewardRedemption, RewardRedemptionStatus } from "@/lib/supabase/types";

export type RewardRedemptionWithReward = RewardRedemption & {
  rewards: Record<string, unknown>;
  members: Record<string, unknown>;
};

export function useRewards() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();

  // ---- Active rewards catalogue ----
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("household_id", householdId)
        .eq("is_active", true)
        .order("points_cost", { ascending: true });
      if (error) throw error;
      return (data || []) as Reward[];
    },
    enabled: !!householdId,
  });

  // ---- Redemption history ----
  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: ["reward-redemptions", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, rewards(*), members!member_id(*)")
        .eq("rewards.household_id", householdId)
        .order("redeemed_at", { ascending: false });
      if (error) throw error;
      return (data || []) as RewardRedemptionWithReward[];
    },
    enabled: !!householdId,
  });

  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  const createReward = useMutation({
    mutationFn: async (reward: {
      name: string;
      description?: string;
      icon: string;
      points_cost: number;
      created_by: string;
    }) => {
      if (!householdId) throw new Error("No household selected");
      const { data, error } = await supabase
        .from("rewards")
        .insert({
          household_id: householdId,
          name: reward.name,
          description: reward.description || null,
          icon: reward.icon,
          points_cost: reward.points_cost,
          is_active: true,
          created_by: reward.created_by,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward created!");
    },
    onError: (e) => toast.error("Failed to create reward: " + e.message),
  });

  const updateReward = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      description?: string | null;
      icon?: string;
      points_cost?: number;
    }) => {
      const { error } = await supabase
        .from("rewards")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward updated!");
    },
    onError: (e) => toast.error("Failed to update reward: " + e.message),
  });

  const deleteReward = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rewards")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward removed.");
    },
    onError: (e) => toast.error("Failed to remove reward: " + e.message),
  });

  const redeemReward = useMutation({
    mutationFn: async (params: {
      rewardId: string;
      memberId: string;
      pointsCost: number;
    }) => {
      // Deduct points from the member first
      const { data: member } = await supabase
        .from("members")
        .select("points_balance")
        .eq("id", params.memberId)
        .single();

      if (!member) throw new Error("Member not found");
      if (member.points_balance < params.pointsCost) {
        throw new Error("Not enough points to redeem this reward");
      }

      const { error: redeemError } = await supabase
        .from("reward_redemptions")
        .insert({
          reward_id: params.rewardId,
          member_id: params.memberId,
          points_spent: params.pointsCost,
          status: "pending" as RewardRedemptionStatus,
        });
      if (redeemError) throw redeemError;

      // Deduct points
      const { error: updateError } = await supabase
        .from("members")
        .update({ points_balance: member.points_balance - params.pointsCost })
        .eq("id", params.memberId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["reward-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Reward redeemed!");
    },
    onError: (e) => toast.error(e.message),
  });

  const approveRedemption = useMutation({
    mutationFn: async ({
      redemptionId,
      approvedBy,
    }: {
      redemptionId: string;
      approvedBy: string;
    }) => {
      const { error } = await supabase
        .from("reward_redemptions")
        .update({
          status: "approved" as RewardRedemptionStatus,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", redemptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-redemptions"] });
      toast.success("Redemption approved!");
    },
    onError: (e) => toast.error("Failed to approve: " + e.message),
  });

  const rejectRedemption = useMutation({
    mutationFn: async ({
      redemptionId,
      memberId,
      pointsRefund,
    }: {
      redemptionId: string;
      memberId: string;
      pointsRefund: number;
    }) => {
      const { error: rejectError } = await supabase
        .from("reward_redemptions")
        .update({ status: "rejected" as RewardRedemptionStatus })
        .eq("id", redemptionId);
      if (rejectError) throw rejectError;

      // Refund points
      const { data: member } = await supabase
        .from("members")
        .select("points_balance")
        .eq("id", memberId)
        .single();
      if (member) {
        await supabase
          .from("members")
          .update({ points_balance: member.points_balance + pointsRefund })
          .eq("id", memberId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Redemption rejected, points refunded.");
    },
    onError: (e) => toast.error("Failed to reject: " + e.message),
  });

  return {
    rewards,
    redemptions,
    pendingRedemptions,
    isLoading,
    redemptionsLoading,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    approveRedemption,
    rejectRedemption,
  };
}
