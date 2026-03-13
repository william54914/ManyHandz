"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface GoalProgressProps {
  currentPoints: number;
  targetPoints: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showMilestones?: boolean;
  className?: string;
}

const MILESTONES = [25, 50, 75, 100];

export function GoalProgress({
  currentPoints,
  targetPoints,
  size = 120,
  strokeWidth = 8,
  color = "#6366f1",
  showMilestones = true,
  className,
}: GoalProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = targetPoints > 0
    ? Math.min(100, (currentPoints / targetPoints) * 100)
    : 0;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={strokeWidth}
        />

        {/* Milestone indicators */}
        {showMilestones &&
          MILESTONES.map((milestone) => {
            if (milestone === 100) return null;
            const milestoneOffset =
              circumference - (milestone / 100) * circumference;
            const reached = percentage >= milestone;
            return (
              <circle
                key={milestone}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={reached ? color : "currentColor"}
                className={reached ? "" : "text-muted-foreground/30"}
                strokeWidth={strokeWidth + 4}
                strokeDasharray={`2 ${circumference - 2}`}
                strokeDashoffset={milestoneOffset}
                strokeLinecap="round"
                opacity={0.6}
              />
            );
          })}

        {/* Progress ring with animation */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-[10px] text-muted-foreground">
          {currentPoints}/{targetPoints}
        </span>
      </div>
    </div>
  );
}
