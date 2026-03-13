"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Target,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChallengeCountdown } from "./challenge-countdown";
import { formatRelativeDate } from "@/lib/utils/format";
import type { BonusChallenge, ChallengeType, ChallengeStatus } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Type badge config
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  ChallengeType,
  { label: string; icon: React.ElementType; color: string }
> = {
  double_points: {
    label: "Double Points",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  complete_count: {
    label: "Completion Count",
    icon: Target,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  no_overdue: {
    label: "No Overdue",
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  custom: {
    label: "Custom",
    icon: Sparkles,
    color: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  },
};

const STATUS_CONFIG: Record<
  ChallengeStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  active: {
    label: "Active",
    icon: Clock,
    color: "text-emerald-400",
  },
  completed: {
    label: "Completed",
    icon: Trophy,
    color: "text-amber-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-400",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    color: "text-muted-foreground",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChallengeCardProps {
  challenge: BonusChallenge & { members?: Record<string, unknown> };
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const typeConfig = TYPE_CONFIG[challenge.challenge_type];
  const statusConfig = STATUS_CONFIG[challenge.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isActive = challenge.status === "active" && new Date(challenge.ends_at) > new Date();
  const progress =
    challenge.challenge_type === "complete_count" && challenge.target_value
      ? Math.min(100, ((challenge.bonus_points || 0) / challenge.target_value) * 100)
      : null;

  const creatorName =
    (challenge.members as Record<string, unknown> | undefined)?.display_name as string | undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          isActive && "border-primary/30",
          className
        )}
      >
        <CardContent className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TypeIcon className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">
                  {challenge.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeConfig.color)}>
                    {typeConfig.label}
                  </Badge>
                  {!isActive && (
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusConfig.color)}>
                      <StatusIcon className="mr-0.5 size-2.5" />
                      {statusConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Multiplier badge */}
            {challenge.points_multiplier > 1 && (
              <Badge className="shrink-0 bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold text-xs">
                <Zap className="mr-0.5 size-3" />
                {challenge.points_multiplier}x POINTS
              </Badge>
            )}
          </div>

          {/* Description */}
          {challenge.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {challenge.description}
            </p>
          )}

          {/* Progress bar for completion count */}
          {challenge.challenge_type === "complete_count" &&
            challenge.target_value &&
            isActive && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    0 / {challenge.target_value}
                  </span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Bonus points */}
              {challenge.bonus_points > 0 && (
                <span className="flex items-center gap-1 font-medium text-primary">
                  <Trophy className="size-3" />+{challenge.bonus_points} pts
                </span>
              )}

              {/* Creator */}
              {creatorName && (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {creatorName}
                </span>
              )}
            </div>

            {/* Countdown or end date */}
            {isActive ? (
              <ChallengeCountdown endsAt={challenge.ends_at} compact />
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(challenge.ends_at)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
