"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { differenceInSeconds } from "date-fns";

interface ChallengeCountdownProps {
  endsAt: string;
  className?: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function computeTimeLeft(endsAt: string): TimeLeft {
  const now = new Date();
  const end = new Date(endsAt);
  const total = differenceInSeconds(end, now);

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    total,
  };
}

export function ChallengeCountdown({
  endsAt,
  className,
  compact = false,
}: ChallengeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(endsAt)
  );

  useEffect(() => {
    // Update per-second when less than 1 hour, otherwise every minute
    const intervalMs = timeLeft.total < 3600 ? 1000 : 60_000;

    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(endsAt));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [endsAt, timeLeft.total < 3600]);

  if (timeLeft.total <= 0) {
    return (
      <span
        className={cn(
          "text-xs font-medium text-red-400",
          className
        )}
      >
        Expired
      </span>
    );
  }

  // Urgency color based on remaining time
  const urgencyColor =
    timeLeft.total < 3600
      ? "text-red-400"
      : timeLeft.total < 86400
        ? "text-amber-400"
        : "text-muted-foreground";

  if (compact) {
    if (timeLeft.days > 0) {
      return (
        <span className={cn("text-xs font-medium", urgencyColor, className)}>
          {timeLeft.days}d {timeLeft.hours}h
        </span>
      );
    }
    if (timeLeft.hours > 0) {
      return (
        <span className={cn("text-xs font-medium", urgencyColor, className)}>
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      );
    }
    return (
      <span className={cn("text-xs font-medium", urgencyColor, className)}>
        {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {timeLeft.days > 0 && (
        <TimeUnit value={timeLeft.days} label="d" urgencyColor={urgencyColor} />
      )}
      <TimeUnit value={timeLeft.hours} label="h" urgencyColor={urgencyColor} />
      <TimeUnit
        value={timeLeft.minutes}
        label="m"
        urgencyColor={urgencyColor}
      />
      {timeLeft.total < 3600 && (
        <TimeUnit
          value={timeLeft.seconds}
          label="s"
          urgencyColor={urgencyColor}
        />
      )}
    </div>
  );
}

function TimeUnit({
  value,
  label,
  urgencyColor,
}: {
  value: number;
  label: string;
  urgencyColor: string;
}) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className={cn("text-sm font-bold tabular-nums", urgencyColor)}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
