"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Gift,
  Trophy,
  Star,
  Flame,
  ShieldOff,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { getLevelSummary } from "@/lib/utils/levels";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RewardCard } from "@/components/rewards/reward-card";
import { BadgeGrid } from "@/components/rewards/badge-grid";
import { Leaderboard } from "@/components/rewards/leaderboard";

import type { Reward, RewardRedemption, Achievement, Member } from "@/lib/supabase/types";

export default function RewardsPage() {
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { features, permissions, isAdmin, mode } = useHouseholdMode();
  const { members, currentMember, isLoading: membersLoading } = useMembers();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch available rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ["rewards", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data } = await supabase
        .from("rewards")
        .select("*")
        .eq("household_id", householdId)
        .eq("is_active", true)
        .order("points_cost");
      return (data || []) as Reward[];
    },
    enabled: !!householdId,
  });

  // Fetch pending redemptions (for admins)
  const { data: pendingRedemptions = [] } = useQuery({
    queryKey: ["pending-redemptions", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data } = await supabase
        .from("reward_redemptions")
        .select("*, rewards(*), members(*)")
        .eq("rewards.household_id", householdId)
        .eq("status", "pending")
        .order("redeemed_at", { ascending: false });
      return (data || []) as (RewardRedemption & { rewards: Reward; members: Member })[];
    },
    enabled: !!householdId && isAdmin,
  });

  // Fetch achievements for current member
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", currentMember?.id],
    queryFn: async () => {
      if (!currentMember?.id) return [];
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("member_id", currentMember.id)
        .order("earned_at", { ascending: false });
      return (data || []) as Achievement[];
    },
    enabled: !!currentMember?.id,
  });

  // Redeem reward
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!currentMember?.id) throw new Error("Not logged in");
      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward) throw new Error("Reward not found");
      if (currentMember.points_balance < reward.points_cost) {
        throw new Error("Not enough points");
      }

      const { data, error } = await supabase
        .from("reward_redemptions")
        .insert({
          reward_id: rewardId,
          member_id: currentMember.id,
          points_spent: reward.points_cost,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;

      // Deduct points
      await supabase
        .from("members")
        .update({
          points_balance: currentMember.points_balance - reward.points_cost,
        })
        .eq("id", currentMember.id);

      return data;
    },
    onSuccess: () => {
      toast.success("Reward redeemed! Waiting for approval.");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["current-member"] });
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Approve/reject redemption
  const handleRedemption = useMutation({
    mutationFn: async ({
      redemptionId,
      action,
    }: {
      redemptionId: string;
      action: "approved" | "rejected";
    }) => {
      const { error } = await supabase
        .from("reward_redemptions")
        .update({
          status: action,
          approved_by: currentMember?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", redemptionId);
      if (error) throw error;

      // If rejected, refund points
      if (action === "rejected") {
        const redemption = pendingRedemptions.find((r) => r.id === redemptionId);
        if (redemption) {
          const member = members.find((m) => m.id === redemption.member_id);
          if (member) {
            await supabase
              .from("members")
              .update({
                points_balance: member.points_balance + redemption.points_spent,
              })
              .eq("id", member.id);
          }
        }
      }
    },
    onSuccess: (_, { action }) => {
      toast.success(
        action === "approved" ? "Reward approved!" : "Reward rejected. Points refunded."
      );
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err) => {
      toast.error("Failed: " + err.message);
    },
  });

  const levelInfo = useMemo(() => {
    if (!currentMember) return null;
    return getLevelSummary(currentMember.total_xp);
  }, [currentMember]);

  const isLoading = membersLoading || rewardsLoading;

  // Feature gate: rewards only in family mode (placed after all hooks to satisfy Rules of Hooks)
  if (!features.rewards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <ShieldOff className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Rewards are available in Family mode</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Rewards, achievements, and the leaderboard are designed for Family
          households where parents and kids can earn points and redeem rewards.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Rewards</h1>
      </div>

      {/* Your stats header */}
      {currentMember && levelInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Points balance */}
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/15 text-primary">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentMember.points_balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Points Balance</p>
              </div>
            </CardContent>
          </Card>

          {/* Level / XP */}
          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Level {levelInfo.level}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {levelInfo.title}
                  </p>
                </div>
                {!levelInfo.isMaxLevel && (
                  <span className="text-xs text-muted-foreground">
                    {levelInfo.xpToNext} XP to next
                  </span>
                )}
              </div>
              <Progress value={levelInfo.progress.percentage} className="h-2" />
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/15 text-orange-400">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentMember.current_streak}
                </p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          {features.leaderboard && (
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          )}
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          {/* Available Rewards Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Rewards</h2>
            {rewards.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No rewards available yet.</p>
                  {isAdmin && (
                    <p className="text-xs mt-1">
                      Create rewards in Settings to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {rewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    id={reward.id}
                    name={reward.name}
                    description={reward.description}
                    icon={reward.icon}
                    pointsCost={reward.points_cost}
                    memberPoints={currentMember?.points_balance ?? 0}
                    onRedeem={(id) => redeemMutation.mutate(id)}
                    isRedeeming={redeemMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pending Redemptions (admin only) */}
          {isAdmin && pendingRedemptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
              <div className="space-y-3">
                {pendingRedemptions.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{
                            backgroundColor:
                              (redemption as any).members?.favorite_color || "#6366f1",
                          }}
                        >
                          {((redemption as any).members?.display_name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {(redemption as any).members?.display_name} wants{" "}
                            <span className="text-primary">
                              {(redemption as any).rewards?.name}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {redemption.points_spent} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRedemption.mutate({
                              redemptionId: redemption.id,
                              action: "rejected",
                            })
                          }
                          disabled={handleRedemption.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRedemption.mutate({
                              redemptionId: redemption.id,
                              action: "approved",
                            })
                          }
                          disabled={handleRedemption.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Achievement Badges</h2>
            <Badge variant="secondary">
              {achievements.length} earned
            </Badge>
          </div>
          <BadgeGrid achievements={achievements} />
        </TabsContent>

        {/* Leaderboard Tab */}
        {features.leaderboard && (
          <TabsContent value="leaderboard">
            <Leaderboard
              members={members.map((m) => ({
                memberId: m.id,
                displayName: m.display_name,
                avatarUrl: m.avatar_url,
                favoriteColor: m.favorite_color,
                points: m.total_xp,
                level: m.current_level,
                streak: m.current_streak,
              }))}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
