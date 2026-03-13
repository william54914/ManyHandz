"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Trophy,
  Flame,
  TrendingUp,
  Star,
  Calendar,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useReports,
  getCurrentWeekRange,
  getGradeColor,
  getGradeBgColor,
  type HouseholdReportSummary,
  type MemberReportData,
} from "@/lib/hooks/use-reports";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MVP Highlight
// ---------------------------------------------------------------------------

function MvpHighlight({
  mvpMember,
  reportData,
}: {
  mvpMember: Record<string, any> | null | undefined;
  reportData: HouseholdReportSummary | null;
}) {
  if (!mvpMember || !reportData) return null;

  const memberData = reportData.members.find(
    (m) => m.member_id === reportData.mvp_member_id
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10 overflow-hidden">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="size-14 ring-2 ring-amber-500/40">
              {mvpMember.avatar_url && (
                <AvatarImage
                  src={mvpMember.avatar_url as string}
                  alt={mvpMember.display_name as string}
                />
              )}
              <AvatarFallback className="text-lg">
                {(mvpMember.display_name as string)?.charAt(0)?.toUpperCase() ??
                  "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
              <Trophy className="size-3.5" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
              MVP of the Week
            </p>
            <p className="text-lg font-bold">
              {mvpMember.display_name as string}
            </p>
            {memberData && (
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span>
                  {memberData.completions}/{memberData.total_assigned} done
                </span>
                <span>{memberData.points_earned} pts</span>
                <span>{memberData.current_streak} day streak</span>
              </div>
            )}
          </div>
          <Award className="size-10 text-amber-500/30" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Member Stats Card
// ---------------------------------------------------------------------------

function MemberStatCard({
  member,
  index,
}: {
  member: MemberReportData;
  index: number;
}) {
  const completionPct = Math.round(member.completion_ratio * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <CardContent className="flex items-center gap-3 py-3">
          <Avatar className="size-9">
            {member.avatar_url && (
              <AvatarImage src={member.avatar_url} alt={member.display_name} />
            )}
            <AvatarFallback
              className="text-xs"
              style={
                member.favorite_color
                  ? { backgroundColor: member.favorite_color + "20" }
                  : undefined
              }
            >
              {member.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {member.display_name}
              </p>
              <span
                className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded",
                  getGradeColor(member.letter_grade),
                  getGradeBgColor(member.letter_grade)
                )}
              >
                {member.letter_grade}
              </span>
            </div>
            <Progress value={completionPct} className="mt-1.5 h-1.5" />
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
              <span>
                {member.completions}/{member.total_assigned} tasks
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="size-2.5" />
                {member.points_earned} pts
              </span>
              <span className="flex items-center gap-0.5">
                <Flame className="size-2.5" />
                {member.current_streak}d
              </span>
            </div>
          </div>

          {member.labels.length > 0 && (
            <div className="flex flex-col gap-1">
              {member.labels.slice(0, 2).map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="text-[9px] px-1.5"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Current Week Report Card
// ---------------------------------------------------------------------------

function CurrentWeekCard({
  report,
}: {
  report: any;
}) {
  const weekRange = getCurrentWeekRange();
  const reportData = report?.report_data as unknown as HouseholdReportSummary | null;

  if (!reportData) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-8 text-center">
          <BarChart3 className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No report data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Reports are generated at the end of each week.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Current week: {weekRange.label}
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionPct =
    reportData.total_assigned > 0
      ? Math.round(
          (reportData.total_completed / reportData.total_assigned) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4" />
              This Week
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {report.week_start &&
                format(parseISO(report.week_start), "MMM d")}{" "}
              -{" "}
              {report.week_end && format(parseISO(report.week_end), "MMM d")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{reportData.total_completed}</p>
              <p className="text-[11px] text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{completionPct}%</p>
              <p className="text-[11px] text-muted-foreground">Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {reportData.household_streak}
              </p>
              <p className="text-[11px] text-muted-foreground">Streak</p>
            </div>
          </div>

          <Progress value={completionPct} className="h-2" />

          {/* Milestones */}
          {reportData.milestones.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {reportData.milestones.map((milestone, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[10px] gap-1"
                >
                  <TrendingUp className="size-2.5" />
                  {milestone}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trend Chart (simple bar chart without recharts fallback)
// ---------------------------------------------------------------------------

function TrendBars({
  reports,
}: {
  reports: any[];
}) {
  if (reports.length < 2) return null;

  // Take last 8 weeks, reversed to chronological order
  const recentReports = reports.slice(0, 8).reverse();
  const maxCompleted = Math.max(
    ...recentReports.map((r) => {
      const data = r.report_data as unknown as HouseholdReportSummary | null;
      return data?.total_completed ?? 0;
    }),
    1
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="size-4" />
          Weekly Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32">
          {recentReports.map((report, i) => {
            const data = report.report_data as unknown as HouseholdReportSummary | null;
            const completed = data?.total_completed ?? 0;
            const heightPct = (completed / maxCompleted) * 100;

            return (
              <div
                key={report.id}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground">
                  {completed}
                </span>
                <motion.div
                  className="w-full rounded-t bg-primary/60"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 4)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {report.week_start
                    ? format(parseISO(report.week_start), "M/d")
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Historical Report Row
// ---------------------------------------------------------------------------

function HistoricalReportRow({ report }: { report: any }) {
  const data = report.report_data as unknown as HouseholdReportSummary | null;
  const completionPct =
    data && data.total_assigned > 0
      ? Math.round((data.total_completed / data.total_assigned) * 100)
      : 0;

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-sm">
          <BarChart3 className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {report.week_start
              ? format(parseISO(report.week_start), "MMM d")
              : "?"}{" "}
            -{" "}
            {report.week_end
              ? format(parseISO(report.week_end), "MMM d, yyyy")
              : "?"}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{data?.total_completed ?? 0} completed</span>
            <span>{completionPct}% rate</span>
            {report.mvp_member && (
              <span className="flex items-center gap-0.5">
                <Trophy className="size-2.5 text-amber-500" />
                {(report.mvp_member as Record<string, any>)?.display_name}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const { reports, currentWeekReport, previousReports, isLoading } =
    useReports();
  const { features } = useHouseholdMode();

  const currentReportData =
    (currentWeekReport?.report_data as unknown) as unknown as HouseholdReportSummary | null;
  const sortedMembers = useMemo(() => {
    if (!currentReportData?.members) return [];
    return [...currentReportData.members].sort(
      (a, b) => b.points_earned - a.points_earned
    );
  }, [currentReportData]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Weekly Reports</h1>
        <p className="text-sm text-muted-foreground">
          Track household performance over time
        </p>
      </div>

      {isLoading ? (
        <ReportsSkeleton />
      ) : (
        <>
          {/* Current Week Report */}
          <CurrentWeekCard report={currentWeekReport} />

          {/* MVP Highlight */}
          {currentWeekReport && (
            <MvpHighlight
              mvpMember={currentWeekReport.mvp_member}
              reportData={currentReportData}
            />
          )}

          {/* Per-Member Stats */}
          {sortedMembers.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Member Performance
              </h2>
              <AnimatePresence mode="popLayout">
                {sortedMembers.map((member, index) => (
                  <MemberStatCard
                    key={member.member_id}
                    member={member}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Trend Chart */}
          {reports.length >= 2 && <TrendBars reports={reports} />}

          {/* Historical Reports */}
          {previousReports.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Previous Weeks
              </h2>
              {previousReports.map((report) => (
                <HistoricalReportRow key={report.id} report={report} />
              ))}
            </div>
          )}

          {/* Empty state when no reports at all */}
          {reports.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">No reports yet</p>
                <p className="text-sm text-muted-foreground">
                  Weekly reports will appear here once your household starts
                  completing chores.
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
