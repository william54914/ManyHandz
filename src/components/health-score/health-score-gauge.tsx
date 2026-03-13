"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

function getScoreConfig(score: number): {
  color: string;
  label: string;
  gradient: [string, string];
} {
  if (score >= 90)
    return {
      color: "#34d399",
      label: "Excellent",
      gradient: ["#34d399", "#10b981"],
    };
  if (score >= 75)
    return {
      color: "#60a5fa",
      label: "Great",
      gradient: ["#60a5fa", "#3b82f6"],
    };
  if (score >= 60)
    return {
      color: "#22d3ee",
      label: "Good",
      gradient: ["#22d3ee", "#06b6d4"],
    };
  if (score >= 40)
    return {
      color: "#fbbf24",
      label: "Needs Work",
      gradient: ["#fbbf24", "#f59e0b"],
    };
  return {
    color: "#f87171",
    label: "Struggling",
    gradient: ["#f87171", "#ef4444"],
  };
}

export function HealthScoreGauge({
  score,
  size = 200,
  className,
}: HealthScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const config = getScoreConfig(clamped);

  const strokeWidth = size * 0.06;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated number count-up
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, clamped, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [clamped, motionValue]);

  const offset = circumference - (clamped / 100) * circumference;

  // Generate gradient ID
  const gradientId = `health-gauge-gradient-${size}`;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={config.gradient[0]} />
              <stop offset="100%" stopColor={config.gradient[1]} />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/20"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold"
            style={{
              fontSize: size * 0.22,
              color: config.color,
            }}
          >
            {displayValue}
          </motion.span>
          <span
            className="text-muted-foreground font-medium"
            style={{ fontSize: size * 0.07 }}
          >
            / 100
          </span>
        </div>
      </div>

      <div className="text-center">
        <p
          className="font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Household Health Score
        </p>
      </div>
    </div>
  );
}
