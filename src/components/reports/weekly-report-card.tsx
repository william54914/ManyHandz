"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Trophy,
  CheckCircle2,
  Flame,
  ChevronLeft,
  ChevronRight,
  Share2,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MemberReportCard } from "./member-report-card";
import { formatPercentage, pluralize } from "@/lib/utils/format";
import type { WeeklyReportWithMVP } from "@/lib/hooks/use-reports";
import type {
  HouseholdReportSummary,
  MemberReportData,
} from "@/lib/hooks/use-reports";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeeklyReportCardProps {
  report: WeeklyReportWithMVP;
  isFamily?: boolean;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  hasPrevWeek?: boolean;
  hasNextWeek?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WeeklyReportCard({
  report,
  isFamily = true,
  onPrevWeek,
  onNextWeek,
  hasPrevWeek = false,
  hasNextWeek = false,
  className,
}: WeeklyReportCardProps) {
  const reportData = report.report_data as unknown as HouseholdReportSummary | null;
  const members = reportData?.members || [];
  const totalCompleted = reportData?.total_completed || 0;
  const totalAssigned = reportData?.total_assigned || 0;
  const householdStreak = reportData?.household_streak || 0;
  const milestones = reportData?.milestones || [];

  const mvpMember = useMemo(() => {
    const mvpId = reportData?.mvp_member_id;
    if (!mvpId) return null;
    return members.find((m) => m.member_id === mvpId) || null;
  }, [reportData, members]);

  const completionRate =
    totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

  const weekLabel = `${format(new Date(report.week_start), "MMM d")} - ${format(new Date(report.week_end), "MMM d, yyyy")}`;

  const handleShareAsImage = async () => {
    // Share as image using native share API or clipboard
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Weekly Report - ${weekLabel}`,
          text: `Household completed ${totalCompleted}/${totalAssigned} chores (${formatPercentage(completionRate)}) this week!`,
        });
      } else {
        await navigator.clipboard.writeText(
          `Weekly Report (${weekLabel}): ${totalCompleted}/${totalAssigned} chores completed (${formatPercentage(completionRate)})`
        );
      }
    } catch {
      // Silently fail if share is cancelled
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <div className="space-y-4">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevWeek}
            disabled={!hasPrevWeek}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="text-sm font-medium">{weekLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            disabled={!hasNextWeek}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Household summary */}
        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Household Summary</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareAsImage}
                className="text-xs"
              >
                <Share2 className="mr-1 size-3.5" />
                Share
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <span className="text-lg font-bold">
                  {totalCompleted}/{totalAssigned}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Completed
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Trophy className="size-5 text-amber-400" />
                <span className="text-lg font-bold">
                  {formatPercentage(completionRate)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Rate
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Flame className="size-5 text-orange-400" />
                <span className="text-lg font-bold">{householdStreak}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Streak
                </span>
              </div>
            </div>

            {/* MVP */}
            {mvpMember && (
              <>
                <Separator />
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <Avatar className="size-10 ring-2 ring-amber-400 ring-offset-2 ring-offset-background">
                      <AvatarImage
                        src={mvpMember.avatar_url ?? undefined}
                        alt={mvpMember.display_name}
                      />
                      <AvatarFallback
                        className="text-sm font-semibold text-white"
                        style={{
                          backgroundColor: mvpMember.favorite_color,
                        }}
                      >
                        {getInitials(mvpMember.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">
                      <Crown className="size-4 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {mvpMember.display_name}
                    </p>
                    <p className="text-xs text-amber-400 font-medium">
                      {isFamily ? "This Week's MVP" : "Top Contributor"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Milestones
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {milestones.map((milestone) => (
                      <Badge
                        key={milestone}
                        variant="outline"
                        className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30"
                      >
                        <Award className="mr-0.5 size-2.5" />
                        {milestone}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Member report cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isFamily ? "Report Cards" : "Member Stats"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((memberData) => (
              <MemberReportCard
                key={memberData.member_id}
                data={memberData}
                isFamily={isFamily}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
