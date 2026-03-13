"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Scale,
  Flame,
  AlertTriangle,
  Users,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HealthComponent {
  id: string;
  label: string;
  score: number; // 0-20
  maxScore: number; // always 20
  icon: React.ElementType;
  tip: string;
}

interface HealthBreakdownProps {
  completionRate: number; // 0-20
  fairnessBalance: number; // 0-20
  streakHealth: number; // 0-20
  overdueCount: number; // 0-20 (inverse of overdue items)
  engagement: number; // 0-20
  className?: string;
}

function getBarColor(score: number): string {
  const pct = (score / 20) * 100;
  if (pct >= 80) return "#34d399";
  if (pct >= 60) return "#60a5fa";
  if (pct >= 40) return "#22d3ee";
  if (pct >= 20) return "#fbbf24";
  return "#f87171";
}

function getTip(id: string, score: number): string {
  const pct = (score / 20) * 100;
  if (pct >= 80) return "Great job! Keep it up.";

  switch (id) {
    case "completion":
      return "Complete more assigned chores on time to boost this score.";
    case "fairness":
      return "Distribute chores more evenly among household members.";
    case "streak":
      return "Build longer streaks by completing chores consistently.";
    case "overdue":
      return "Reduce overdue tasks by staying on top of due dates.";
    case "engagement":
      return "Participate more in polls, challenges, and household activities.";
    default:
      return "Keep working on improvements.";
  }
}

export function HealthBreakdown({
  completionRate,
  fairnessBalance,
  streakHealth,
  overdueCount,
  engagement,
  className,
}: HealthBreakdownProps) {
  const components: HealthComponent[] = [
    {
      id: "completion",
      label: "Completion Rate",
      score: completionRate,
      maxScore: 20,
      icon: CheckCircle,
      tip: getTip("completion", completionRate),
    },
    {
      id: "fairness",
      label: "Fairness Balance",
      score: fairnessBalance,
      maxScore: 20,
      icon: Scale,
      tip: getTip("fairness", fairnessBalance),
    },
    {
      id: "streak",
      label: "Streak Health",
      score: streakHealth,
      maxScore: 20,
      icon: Flame,
      tip: getTip("streak", streakHealth),
    },
    {
      id: "overdue",
      label: "Overdue Count",
      score: overdueCount,
      maxScore: 20,
      icon: AlertTriangle,
      tip: getTip("overdue", overdueCount),
    },
    {
      id: "engagement",
      label: "Engagement",
      score: engagement,
      maxScore: 20,
      icon: Users,
      tip: getTip("engagement", engagement),
    },
  ];

  const totalScore = components.reduce((sum, c) => sum + c.score, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="size-4 text-primary" />
          Health Breakdown
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {totalScore}/100
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {components.map((component, index) => {
          const Icon = component.icon;
          const barColor = getBarColor(component.score);
          const pct = (component.score / component.maxScore) * 100;

          return (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className="size-4"
                    style={{ color: barColor }}
                  />
                  <span className="text-sm font-medium">
                    {component.label}
                  </span>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: barColor }}
                >
                  {component.score}/{component.maxScore}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                />
              </div>

              {/* Tip */}
              {pct < 80 && (
                <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                  <Lightbulb className="size-3 mt-0.5 shrink-0 text-amber-400" />
                  {component.tip}
                </p>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
