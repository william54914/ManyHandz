"use client";

import { cn } from "@/lib/utils/cn";
import type { FairnessStatus } from "@/lib/utils/fairness";

interface FairnessScoreProps {
  memberId: string;
  memberName: string;
  avatarUrl: string | null;
  percentage: number;
  status: FairnessStatus;
  favoriteColor: string;
  size?: number;
}

const STATUS_COLORS: Record<FairnessStatus, string> = {
  balanced: "#34d399",
  slightly_off: "#fbbf24",
  significantly_off: "#f87171",
};

export function FairnessScore({
  memberName,
  avatarUrl,
  percentage,
  status,
  favoriteColor,
  size = 140,
}: FairnessScoreProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const color = STATUS_COLORS[status];
  const center = size / 2;
  const avatarRadius = radius - 16;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
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
          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={memberName}
              className="rounded-full object-cover"
              style={{
                width: avatarRadius * 2,
                height: avatarRadius * 2,
                border: `3px solid ${favoriteColor}`,
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-white font-bold"
              style={{
                width: avatarRadius * 2,
                height: avatarRadius * 2,
                backgroundColor: favoriteColor,
                fontSize: avatarRadius * 0.6,
              }}
            >
              {memberName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* Percentage overlay */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ backgroundColor: color, color: "#000" }}
        >
          {Math.round(clamped)}%
        </div>
      </div>
      <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
        {memberName}
      </span>
      <span
        className={cn(
          "text-xs capitalize",
          status === "balanced" && "text-emerald-400",
          status === "slightly_off" && "text-amber-400",
          status === "significantly_off" && "text-red-400"
        )}
      >
        {status.replace("_", " ")}
      </span>
    </div>
  );
}
