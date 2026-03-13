"use client";

import { motion } from "framer-motion";
import { Crown, Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils/format";

interface CompetitionResultProps {
  winnerName: string;
  winnerAvatar?: string | null;
  winnerColor: string;
  winnerScore: number;
  loserName: string;
  loserAvatar?: string | null;
  loserColor: string;
  loserScore: number;
  stakesPoints: number;
  stakesDescription?: string | null;
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

export function CompetitionResult({
  winnerName,
  winnerAvatar,
  winnerColor,
  winnerScore,
  loserName,
  loserAvatar,
  loserColor,
  loserScore,
  stakesPoints,
  stakesDescription,
  className,
}: CompetitionResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-xl border bg-gradient-to-b from-amber-500/5 to-transparent p-4 space-y-4",
        className
      )}
    >
      {/* Winner announcement */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Crown className="size-8 text-amber-400" />
        </motion.div>
        <p className="text-sm font-semibold text-amber-400">Winner!</p>
      </div>

      {/* Score comparison */}
      <div className="flex items-center justify-center gap-4">
        {/* Winner */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="size-14 ring-2 ring-amber-400 ring-offset-2 ring-offset-background">
              <AvatarImage src={winnerAvatar ?? undefined} alt={winnerName} />
              <AvatarFallback
                className="text-lg font-semibold text-white"
                style={{ backgroundColor: winnerColor }}
              >
                {getInitials(winnerName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-400">
              <Trophy className="size-3 text-amber-900" />
            </div>
          </div>
          <span className="text-sm font-medium">{winnerName}</span>
          <span className="text-2xl font-bold text-primary tabular-nums">
            {winnerScore}
          </span>
        </div>

        {/* VS */}
        <div className="text-xs font-bold text-muted-foreground">VS</div>

        {/* Loser */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-14 ring-2 ring-muted ring-offset-2 ring-offset-background opacity-75">
            <AvatarImage src={loserAvatar ?? undefined} alt={loserName} />
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: loserColor }}
            >
              {getInitials(loserName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {loserName}
          </span>
          <span className="text-2xl font-bold text-muted-foreground tabular-nums">
            {loserScore}
          </span>
        </div>
      </div>

      {/* Stakes transfer */}
      {stakesPoints > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <span className="text-xs text-muted-foreground">{loserName}</span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs font-semibold">
            {formatPoints(stakesPoints)}
          </Badge>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{winnerName}</span>
        </div>
      )}

      {/* Stakes description */}
      {stakesDescription && (
        <p className="text-center text-xs text-muted-foreground italic">
          Stakes: {stakesDescription}
        </p>
      )}
    </motion.div>
  );
}
