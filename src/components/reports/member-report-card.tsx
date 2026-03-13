"use client";

import { motion } from "framer-motion";
import { Flame, Star, TrendingUp, TrendingDown, Award } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatPoints, formatPercentage } from "@/lib/utils/format";
import {
  getGradeColor,
  getGradeBgColor,
  type MemberReportData,
} from "@/lib/hooks/use-reports";

// ---------------------------------------------------------------------------
// Label config
// ---------------------------------------------------------------------------

const LABEL_CONFIG: Record<string, { color: string; icon?: React.ElementType }> = {
  "Most Consistent": {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  "Most Improved": {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: TrendingUp,
  },
  MVP: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: Award,
  },
  "Needs Attention": {
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: TrendingDown,
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MemberReportCardProps {
  data: MemberReportData;
  isFamily?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MemberReportCard({
  data,
  isFamily = true,
  className,
}: MemberReportCardProps) {
  const initials = data.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const gradeColor = getGradeColor(data.letter_grade);
  const gradeBg = getGradeBgColor(data.letter_grade);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardContent className="flex flex-col gap-3">
          {/* Header: Avatar + Name + Grade */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-10 shrink-0">
                <AvatarImage
                  src={data.avatar_url ?? undefined}
                  alt={data.display_name}
                />
                <AvatarFallback
                  className="text-sm font-semibold text-white"
                  style={{ backgroundColor: data.favorite_color }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {data.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.completions}/{data.total_assigned} completed
                </p>
              </div>
            </div>

            {/* Letter grade (family mode) */}
            {isFamily && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl font-bold text-xl",
                  gradeBg,
                  gradeColor
                )}
              >
                {data.letter_grade}
              </motion.div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <StatItem
              label={isFamily ? "Grade" : "Ratio"}
              value={
                isFamily
                  ? data.letter_grade
                  : formatPercentage(data.completion_ratio * 100)
              }
              className={isFamily ? gradeColor : undefined}
            />
            <StatItem
              label="Points"
              value={formatPoints(data.points_earned)}
            />
            <StatItem
              label="Streak"
              value={
                <span className="flex items-center gap-1">
                  <Flame className="size-3 text-orange-400" />
                  {data.current_streak}
                </span>
              }
            />
            <StatItem
              label="Fairness"
              value={
                <span
                  className={cn(
                    data.fairness_delta > 5
                      ? "text-emerald-400"
                      : data.fairness_delta < -5
                        ? "text-red-400"
                        : "text-muted-foreground"
                  )}
                >
                  {data.fairness_delta > 0 ? "+" : ""}
                  {formatPercentage(data.fairness_delta)}
                </span>
              }
            />
          </div>

          {/* Star Chore */}
          {data.star_chore && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>
                Star chore: <span className="font-medium">{data.star_chore}</span>
              </span>
            </div>
          )}

          {/* Labels */}
          {data.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.labels.map((label) => {
                const config = LABEL_CONFIG[label];
                const LabelIcon = config?.icon;
                return (
                  <Badge
                    key={label}
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0", config?.color)}
                  >
                    {LabelIcon && <LabelIcon className="mr-0.5 size-2.5" />}
                    {label}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stat Item
// ---------------------------------------------------------------------------

function StatItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm font-semibold", className)}>{value}</span>
    </div>
  );
}
