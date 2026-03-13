"use client";

import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  Target,
  Clock,
  Crown,
  Check,
  X,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChallengeCountdown } from "@/components/challenges/challenge-countdown";
import { H2HProgress } from "./h2h-progress";
import { CompetitionResult } from "./competition-result";
import { formatPoints, formatRelativeDate } from "@/lib/utils/format";
import type {
  CompetitionType,
  CompetitionStatus,
} from "@/lib/supabase/types";
import type { CompetitionWithMembers } from "@/lib/hooks/use-competitions";

// ---------------------------------------------------------------------------
// Type labels
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<CompetitionType, string> = {
  most_points: "Most Points",
  most_completions: "Most Completions",
  first_to_target: "First to Target",
  specific_chore_race: "Chore Race",
};

const STATUS_COLORS: Record<CompetitionStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  declined: "bg-red-500/10 text-red-400 border-red-500/30",
  expired: "bg-muted text-muted-foreground border-muted",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getMemberData(member: Record<string, unknown>) {
  return {
    id: member.id as string,
    displayName: member.display_name as string,
    avatarUrl: member.avatar_url as string | null,
    favoriteColor: (member.favorite_color as string) || "#6366f1",
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CompetitionCardProps {
  competition: CompetitionWithMembers;
  currentMemberId?: string | null;
  onAccept?: (competitionId: string) => void;
  onDecline?: (competitionId: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompetitionCard({
  competition,
  currentMemberId,
  onAccept,
  onDecline,
  className,
}: CompetitionCardProps) {
  const challenger = getMemberData(competition.challenger);
  const opponent = getMemberData(competition.opponent);
  const isActive = competition.status === "active";
  const isPending = competition.status === "pending";
  const isCompleted = competition.status === "completed";
  const isOpponent = currentMemberId === opponent.id;

  // Determine winner for completed competitions
  const winnerId = competition.winner_id;
  const isWinnerChallenger = winnerId === challenger.id;

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
          isPending && "border-amber-500/30",
          className
        )}
      >
        <CardContent className="flex flex-col gap-4">
          {/* Header: Type + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="size-4 text-primary" />
              <span className="text-sm font-semibold">{competition.title}</span>
            </div>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", STATUS_COLORS[competition.status])}
            >
              {competition.status === "pending"
                ? "Awaiting Response"
                : competition.status.charAt(0).toUpperCase() +
                  competition.status.slice(1)}
            </Badge>
          </div>

          {/* VS Layout */}
          {!isCompleted ? (
            <div className="flex items-center justify-center gap-4">
              {/* Challenger */}
              <div className="flex flex-col items-center gap-1.5">
                <Avatar className="size-12 ring-2 ring-offset-2 ring-offset-background" style={{ borderColor: challenger.favoriteColor }}>
                  <AvatarImage
                    src={challenger.avatarUrl ?? undefined}
                    alt={challenger.displayName}
                  />
                  <AvatarFallback
                    className="font-semibold text-white"
                    style={{ backgroundColor: challenger.favoriteColor }}
                  >
                    {getInitials(challenger.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[80px]">
                  {challenger.displayName}
                </span>
                {isActive && (
                  <span className="text-lg font-bold tabular-nums text-primary">
                    {competition.challenger_progress}
                  </span>
                )}
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                  VS
                </div>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center gap-1.5">
                <Avatar className="size-12 ring-2 ring-offset-2 ring-offset-background" style={{ borderColor: opponent.favoriteColor }}>
                  <AvatarImage
                    src={opponent.avatarUrl ?? undefined}
                    alt={opponent.displayName}
                  />
                  <AvatarFallback
                    className="font-semibold text-white"
                    style={{ backgroundColor: opponent.favoriteColor }}
                  >
                    {getInitials(opponent.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[80px]">
                  {opponent.displayName}
                </span>
                {isActive && (
                  <span className="text-lg font-bold tabular-nums text-primary">
                    {competition.opponent_progress}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Completed - show result */
            <CompetitionResult
              winnerName={
                isWinnerChallenger
                  ? challenger.displayName
                  : opponent.displayName
              }
              winnerAvatar={
                isWinnerChallenger
                  ? challenger.avatarUrl
                  : opponent.avatarUrl
              }
              winnerColor={
                isWinnerChallenger
                  ? challenger.favoriteColor
                  : opponent.favoriteColor
              }
              winnerScore={
                isWinnerChallenger
                  ? competition.challenger_progress
                  : competition.opponent_progress
              }
              loserName={
                isWinnerChallenger
                  ? opponent.displayName
                  : challenger.displayName
              }
              loserAvatar={
                isWinnerChallenger
                  ? opponent.avatarUrl
                  : challenger.avatarUrl
              }
              loserColor={
                isWinnerChallenger
                  ? opponent.favoriteColor
                  : challenger.favoriteColor
              }
              loserScore={
                isWinnerChallenger
                  ? competition.opponent_progress
                  : competition.challenger_progress
              }
              stakesPoints={competition.stakes_points}
              stakesDescription={competition.stakes_description}
            />
          )}

          {/* H2H Progress (active only) */}
          {isActive && (
            <H2HProgress
              challengerName={challenger.displayName}
              challengerAvatar={challenger.avatarUrl}
              challengerColor={challenger.favoriteColor}
              challengerScore={competition.challenger_progress}
              opponentName={opponent.displayName}
              opponentAvatar={opponent.avatarUrl}
              opponentColor={opponent.favoriteColor}
              opponentScore={competition.opponent_progress}
              targetValue={competition.target_value}
            />
          )}

          {/* Footer info */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {TYPE_LABELS[competition.competition_type]}
              </Badge>

              {competition.stakes_points > 0 && (
                <span className="flex items-center gap-1">
                  <Coins className="size-3" />
                  {formatPoints(competition.stakes_points)} wager
                </span>
              )}
            </div>

            {isActive ? (
              <ChallengeCountdown endsAt={competition.ends_at} compact />
            ) : (
              <span>{formatRelativeDate(competition.ends_at)}</span>
            )}
          </div>

          {/* Stakes description */}
          {competition.stakes_description && !isCompleted && (
            <p className="text-xs text-muted-foreground italic rounded-md bg-muted/50 px-2 py-1.5">
              Stakes: {competition.stakes_description}
            </p>
          )}

          {/* Accept/Decline buttons for pending */}
          {isPending && isOpponent && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-400 hover:text-red-300"
                onClick={() => onDecline?.(competition.id)}
              >
                <X className="mr-1 size-4" />
                Decline
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onAccept?.(competition.id)}
              >
                <Check className="mr-1 size-4" />
                Accept
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
