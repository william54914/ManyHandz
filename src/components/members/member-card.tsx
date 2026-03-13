"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Moon } from "lucide-react";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { getLevelSummary } from "@/lib/utils/levels";
import { formatPoints } from "@/lib/utils/format";
import { getAccentColorByValue } from "@/lib/constants/colors";
import type { Member } from "@/lib/supabase/types";

interface MemberCardProps {
  member: Member;
  className?: string;
}

const ROLE_LABELS: Record<string, string> = {
  parent: "Parent",
  kid: "Kid",
  roommate: "Roommate",
  manager: "Manager",
  colleague: "Colleague",
};

export function MemberCard({ member, className }: MemberCardProps) {
  const router = useRouter();
  const { mode, features } = useHouseholdMode();

  const initials = member.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const accentColor = getAccentColorByValue(member.favorite_color);
  const isAway = member.away_until && new Date(member.away_until) > new Date();
  const levelInfo = features.gamification ? getLevelSummary(member.total_xp) : null;

  return (
    <Card
      className={cn(
        "border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer",
        className
      )}
      onClick={() => router.push(`/members/${member.id}`)}
    >
      <CardContent className="flex flex-col items-center gap-3 pt-6 pb-4">
        <div className="relative">
          <Avatar className="size-16 ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)]" style={{ borderColor: member.favorite_color }}>
            <AvatarImage src={member.avatar_url ?? undefined} alt={member.display_name} />
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: accentColor?.value ?? member.favorite_color }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {isAway && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500/20 p-1">
              <Moon className="size-3.5 text-amber-400" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]">
            {member.display_name}
          </p>
          <Badge variant="outline" className="text-xs border-[var(--border-default)] text-[var(--text-muted)]">
            {ROLE_LABELS[member.role] ?? member.role}
          </Badge>
        </div>

        {features.gamification && levelInfo && (
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-[var(--accent-primary)]">
                Lv.{levelInfo.level}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{levelInfo.title}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--bg-tertiary)]">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                style={{ width: `${levelInfo.progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{formatPoints(member.points_balance)}</span>
          {member.current_streak > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className="size-3 text-orange-400" />
              {member.current_streak}
            </span>
          )}
        </div>

        {isAway && (
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
            Away
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
