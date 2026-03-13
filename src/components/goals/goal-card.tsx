"use client";

import { useState, useMemo } from "react";
import { DollarSign, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GoalProgress } from "@/components/goals/goal-progress";
import type { Goal, Member } from "@/lib/supabase/types";

interface GoalCardProps {
  goal: Goal;
  member: Member | undefined;
  onContribute: (goalId: string, points: number) => void;
  isContributing?: boolean;
  currentMemberPoints?: number;
  className?: string;
}

export function GoalCard({
  goal,
  member,
  onContribute,
  isContributing = false,
  currentMemberPoints = 0,
  className,
}: GoalCardProps) {
  const [showContribute, setShowContribute] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");

  const remaining = Math.max(0, goal.target_points - goal.current_points);
  const isCompleted = goal.status === "completed";

  // Estimate completion: rough linear projection
  const estimatedDaysToComplete = useMemo(() => {
    if (isCompleted || remaining === 0) return 0;
    // Use auto_contribute_percentage as an estimate of daily earning rate
    // This is a rough heuristic
    const dailyEstimate = goal.auto_contribute_enabled
      ? Math.max(1, Math.round(goal.auto_contribute_percentage * 0.5))
      : 5;
    return Math.ceil(remaining / dailyEstimate);
  }, [remaining, isCompleted, goal.auto_contribute_enabled, goal.auto_contribute_percentage]);

  const handleContribute = () => {
    const amount = parseInt(contributeAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    onContribute(goal.id, Math.min(amount, remaining, currentMemberPoints));
    setShowContribute(false);
    setContributeAmount("");
  };

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden transition-all",
          isCompleted && "border-emerald-500/30",
          className
        )}
      >
        <CardContent className="flex flex-col items-center text-center gap-3">
          {/* Progress ring */}
          <GoalProgress
            currentPoints={goal.current_points}
            targetPoints={goal.target_points}
            size={100}
            color={member?.favorite_color || "#6366f1"}
          />

          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {goal.title}
          </h3>

          {/* Assigned member */}
          {member && (
            <div className="flex items-center gap-1.5">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.display_name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: member.favorite_color }}
                >
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {member.display_name}
              </span>
            </div>
          )}

          {/* Points remaining */}
          <div className="text-xs text-muted-foreground">
            {isCompleted ? (
              <span className="text-emerald-400 font-medium">Completed!</span>
            ) : (
              <span>{remaining.toLocaleString()} pts remaining</span>
            )}
          </div>

          {/* Monetary value */}
          {goal.monetary_value !== null && goal.monetary_value > 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <DollarSign className="h-3 w-3" />
              {(goal.monetary_value / 100).toFixed(2)}
            </div>
          )}

          {/* Estimated completion */}
          {!isCompleted && estimatedDaysToComplete > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              ~{estimatedDaysToComplete} days
            </div>
          )}

          {/* Contribute button */}
          {!isCompleted && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-1"
              onClick={() => setShowContribute(true)}
              disabled={currentMemberPoints === 0}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Contribute Points
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Contribute dialog */}
      <Dialog open={showContribute} onOpenChange={setShowContribute}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to "{goal.title}"</DialogTitle>
            <DialogDescription>
              You have {currentMemberPoints.toLocaleString()} points available.{" "}
              {remaining.toLocaleString()} points remaining for this goal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Points to contribute"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              min={1}
              max={Math.min(remaining, currentMemberPoints)}
            />
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  onClick={() => setContributeAmount(String(Math.min(amount, remaining, currentMemberPoints)))}
                  disabled={amount > currentMemberPoints || amount > remaining}
                >
                  {amount}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setContributeAmount(
                    String(Math.min(remaining, currentMemberPoints))
                  )
                }
              >
                Max
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContribute(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleContribute}
              disabled={
                isContributing ||
                !contributeAmount ||
                parseInt(contributeAmount) <= 0
              }
            >
              {isContributing ? "Contributing..." : "Contribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
