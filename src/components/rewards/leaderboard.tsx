"use client";

import { useState } from "react";
import { Crown, Medal, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLevelTitle } from "@/lib/constants/levels";

interface LeaderboardMember {
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  favoriteColor: string;
  points: number;
  level: number;
  streak: number;
}

interface LeaderboardProps {
  members: LeaderboardMember[];
  className?: string;
}

type PeriodFilter = "this_week" | "this_month" | "all_time";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return (
    <span className="h-5 w-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

export function Leaderboard({ members, className }: LeaderboardProps) {
  const [period, setPeriod] = useState<PeriodFilter>("all_time");

  // Sort by points descending
  const ranked = [...members].sort((a, b) => b.points - a.points);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Leaderboard
        </h3>
        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as PeriodFilter)}
        >
          <SelectTrigger className="w-[140px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {ranked.map((member, idx) => {
          const rank = idx + 1;
          const isTop = rank <= 3;

          return (
            <div
              key={member.memberId}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-all",
                isTop
                  ? "bg-card border border-border/50"
                  : "hover:bg-muted/30"
              )}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center shrink-0">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="h-9 w-9 rounded-full object-cover shrink-0"
                  style={{ border: `2px solid ${member.favoriteColor}` }}
                />
              ) : (
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: member.favoriteColor }}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {member.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Lv. {member.level} {getLevelTitle(member.level)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                {member.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame className="h-3.5 w-3.5" />
                    {member.streak}
                  </div>
                )}
                <div className="text-right">
                  <p className="font-bold text-sm">{member.points.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
              </div>
            </div>
          );
        })}

        {ranked.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No leaderboard data yet.
          </p>
        )}
      </div>
    </div>
  );
}
