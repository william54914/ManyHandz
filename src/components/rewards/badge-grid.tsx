"use client";

import { Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { BADGES, type BadgeDefinition } from "@/lib/constants/badges";
import type { Achievement } from "@/lib/supabase/types";

interface BadgeGridProps {
  achievements: Achievement[];
  className?: string;
}

function BadgeIcon({ badge, earned }: { badge: BadgeDefinition; earned: boolean }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-16 w-16 rounded-2xl text-2xl transition-all",
        earned
          ? "bg-primary/15 text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          : "bg-muted/50 text-muted-foreground"
      )}
    >
      {/* Using a generic icon representation since we can't dynamically import lucide icons */}
      <span className="text-lg font-bold">
        {badge.name.charAt(0)}
      </span>
      {!earned && (
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-muted p-0.5">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function BadgeGrid({ achievements, className }: BadgeGridProps) {
  const earnedKeys = new Set(achievements.map((a) => a.badge_key));
  const earnedMap = new Map(
    achievements.map((a) => [a.badge_key, a])
  );

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4", className)}>
      {BADGES.map((badge) => {
        const earned = earnedKeys.has(badge.key);
        const achievement = earnedMap.get(badge.key);

        return (
          <div
            key={badge.key}
            className={cn(
              "flex flex-col items-center text-center gap-2 p-3 rounded-xl transition-all",
              earned
                ? "bg-card border border-border/50"
                : "opacity-50"
            )}
          >
            <BadgeIcon badge={badge} earned={earned} />
            <span
              className={cn(
                "text-xs font-medium leading-tight",
                earned ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {badge.name}
            </span>
            {earned && achievement && (
              <span className="text-[10px] text-muted-foreground">
                {format(parseISO(achievement.earned_at), "MMM d, yyyy")}
              </span>
            )}
            {!earned && (
              <span className="text-[10px] text-muted-foreground line-clamp-2">
                {badge.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
