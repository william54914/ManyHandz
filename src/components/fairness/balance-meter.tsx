"use client";

import { cn } from "@/lib/utils/cn";

interface BalanceMemberData {
  memberId: string;
  memberName: string;
  percentage: number;
  color: string;
}

interface BalanceMeterProps {
  members: BalanceMemberData[];
  className?: string;
}

export function BalanceMeter({ members, className }: BalanceMeterProps) {
  const idealShare = members.length > 0 ? 100 / members.length : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* The horizontal bar */}
      <div className="relative h-8 w-full rounded-full overflow-hidden bg-muted/30">
        {members.map((member, idx) => {
          const leftOffset = members
            .slice(0, idx)
            .reduce((sum, m) => sum + m.percentage, 0);

          return (
            <div
              key={member.memberId}
              className="absolute inset-y-0 transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
              style={{
                left: `${leftOffset}%`,
                width: `${Math.max(member.percentage, 0.5)}%`,
                backgroundColor: member.color,
              }}
              title={`${member.memberName}: ${Math.round(member.percentage)}%`}
            />
          );
        })}
        {/* Ideal marker lines */}
        {members.length > 1 &&
          Array.from({ length: members.length - 1 }).map((_, i) => (
            <div
              key={`marker-${i}`}
              className="absolute inset-y-0 w-0.5 bg-foreground/50 z-10"
              style={{ left: `${idealShare * (i + 1)}%` }}
            />
          ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {members.map((member) => (
          <div key={member.memberId} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: member.color }}
            />
            <span className="text-muted-foreground">{member.memberName}</span>
            <span className="font-medium">{Math.round(member.percentage)}%</span>
          </div>
        ))}
      </div>

      {/* Ideal label */}
      <p className="text-xs text-muted-foreground">
        Ideal share: {Math.round(idealShare)}% each
        {members.length > 1 && " (markers show ideal boundaries)"}
      </p>
    </div>
  );
}
