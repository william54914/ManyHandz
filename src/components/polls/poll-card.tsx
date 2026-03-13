"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, parseISO, isPast } from "date-fns";
import { Check, Clock, BarChart3, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { HouseholdPoll, PollOption, PollVotes, Member } from "@/lib/supabase/types";

interface PollCardProps {
  poll: HouseholdPoll;
  currentMemberId: string;
  members?: Member[];
  onVote?: (pollId: string, optionId: string) => void;
  className?: string;
}

export function PollCard({
  poll,
  currentMemberId,
  members = [],
  onVote,
  className,
}: PollCardProps) {
  const isClosed =
    poll.is_closed || (poll.closes_at && isPast(parseISO(poll.closes_at)));

  const votes = (poll.votes ?? {}) as PollVotes;
  const options = (poll.options ?? []) as PollOption[];

  // Determine which option(s) the current user voted for
  const userVotes = useMemo(() => {
    const voted = new Set<string>();
    for (const [optionId, voterIds] of Object.entries(votes)) {
      if (voterIds?.includes(currentMemberId)) {
        voted.add(optionId);
      }
    }
    return voted;
  }, [votes, currentMemberId]);

  const hasVoted = userVotes.size > 0;
  const showResults = hasVoted || isClosed;

  // Calculate total votes
  const totalVotes = useMemo(() => {
    let total = 0;
    for (const voterIds of Object.values(votes)) {
      total += voterIds?.length ?? 0;
    }
    return total;
  }, [votes]);

  // Find winner(s)
  const maxVotes = useMemo(() => {
    let max = 0;
    for (const voterIds of Object.values(votes)) {
      const count = voterIds?.length ?? 0;
      if (count > max) max = count;
    }
    return max;
  }, [votes]);

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const m of members) {
      map[m.id] = m;
    }
    return map;
  }, [members]);

  const handleVote = (optionId: string) => {
    if (isClosed || (!poll.allow_multiple && hasVoted)) return;
    if (userVotes.has(optionId)) return;
    onVote?.(poll.id, optionId);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{poll.question}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {poll.is_anonymous && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Lock className="size-2.5" />
                Anonymous
              </Badge>
            )}
            {isClosed ? (
              <Badge variant="secondary" className="text-[10px]">
                Closed
              </Badge>
            ) : poll.closes_at ? (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Clock className="size-2.5" />
                {formatDistanceToNow(parseISO(poll.closes_at), {
                  addSuffix: true,
                })}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence mode="wait">
          {options.map((option) => {
            const optionVotes = votes[option.id]?.length ?? 0;
            const percentage =
              totalVotes > 0
                ? Math.round((optionVotes / totalVotes) * 100)
                : 0;
            const isWinner =
              isClosed && maxVotes > 0 && optionVotes === maxVotes;
            const isSelected = userVotes.has(option.id);

            return (
              <motion.button
                key={option.id}
                type="button"
                disabled={isClosed || (!poll.allow_multiple && hasVoted && !isSelected)}
                onClick={() => handleVote(option.id)}
                className={cn(
                  "relative w-full rounded-lg border p-3 text-left transition-all overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50",
                  isClosed && "cursor-default",
                  isWinner && "ring-2 ring-amber-500/50"
                )}
                layout
              >
                {/* Background bar */}
                {showResults && (
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-lg",
                      isSelected ? "bg-primary/15" : "bg-muted/50"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}

                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary shrink-0">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        isWinner && "text-amber-400"
                      )}
                    >
                      {option.text}
                    </span>
                  </div>

                  {showResults && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {optionVotes} vote{optionVotes !== 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-semibold min-w-[2.5rem] text-right">
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Voter avatars (if not anonymous and results shown) */}
                {showResults &&
                  !poll.is_anonymous &&
                  (votes[option.id]?.length ?? 0) > 0 && (
                    <div className="relative flex items-center gap-1 mt-2">
                      {votes[option.id]?.slice(0, 5).map((voterId) => {
                        const member = memberMap[voterId];
                        return (
                          <Avatar
                            key={voterId}
                            className="size-5 border-2 border-background"
                          >
                            <AvatarFallback
                              className="text-[9px]"
                              style={{
                                backgroundColor:
                                  member?.favorite_color ?? "#6366f1",
                                color: "#fff",
                              }}
                            >
                              {member?.display_name?.charAt(0)?.toUpperCase() ??
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {(votes[option.id]?.length ?? 0) > 5 && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          +{(votes[option.id]?.length ?? 0) - 5}
                        </span>
                      )}
                    </div>
                  )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
          </span>
          {poll.allow_multiple && (
            <span className="flex items-center gap-1">
              <BarChart3 className="size-3" />
              Multiple selections allowed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
