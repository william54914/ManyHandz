"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface H2HProgressProps {
  challengerName: string;
  challengerAvatar?: string | null;
  challengerColor: string;
  challengerScore: number;
  opponentName: string;
  opponentAvatar?: string | null;
  opponentColor: string;
  opponentScore: number;
  targetValue?: number | null;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function H2HProgress({
  challengerName,
  challengerAvatar,
  challengerColor,
  challengerScore,
  opponentName,
  opponentAvatar,
  opponentColor,
  opponentScore,
  targetValue,
  className,
}: H2HProgressProps) {
  const maxScore = targetValue
    ? targetValue
    : Math.max(challengerScore, opponentScore, 1);

  const challengerPct = Math.min(100, (challengerScore / maxScore) * 100);
  const opponentPct = Math.min(100, (opponentScore / maxScore) * 100);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Challenger progress */}
      <div className="flex items-center gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={challengerAvatar ?? undefined} alt={challengerName} />
          <AvatarFallback
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: challengerColor }}
          >
            {getInitials(challengerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium truncate max-w-[120px]">
              {challengerName}
            </span>
            <motion.span
              key={challengerScore}
              initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
              animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
              className="font-bold tabular-nums"
            >
              {challengerScore}
            </motion.span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: challengerColor }}
              initial={{ width: 0 }}
              animate={{ width: `${challengerPct}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Opponent progress */}
      <div className="flex items-center gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={opponentAvatar ?? undefined} alt={opponentName} />
          <AvatarFallback
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: opponentColor }}
          >
            {getInitials(opponentName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium truncate max-w-[120px]">
              {opponentName}
            </span>
            <motion.span
              key={opponentScore}
              initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
              animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
              className="font-bold tabular-nums"
            >
              {opponentScore}
            </motion.span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: opponentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${opponentPct}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Target line */}
      {targetValue && (
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <span>Target:</span>
          <span className="font-medium">{targetValue}</span>
        </div>
      )}
    </div>
  );
}
