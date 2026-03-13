"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Play,
  CheckCircle2,
  CalendarClock,
  Pause,
  Timer,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { useTimerStore } from "@/lib/stores/timer-store";
import type {
  Assignment,
  Chore,
  Member,
  ChecklistProgressItem,
} from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  skipped: {
    label: "Skipped",
    className: "bg-muted text-muted-foreground",
  },
  snoozed_pending_approval: {
    label: "Snoozed",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDueDate(dueDate: string, dueTime?: string | null): string {
  const date = parseISO(dueDate);
  if (isToday(date)) {
    return dueTime ? `Today at ${dueTime}` : "Today";
  }
  if (isTomorrow(date)) {
    return dueTime ? `Tomorrow at ${dueTime}` : "Tomorrow";
  }
  return dueTime
    ? `${format(date, "MMM d")} at ${dueTime}`
    : format(date, "MMM d");
}

function getChecklistProgress(
  progress: ChecklistProgressItem[] | null | undefined
): { checked: number; total: number } {
  if (!progress || !Array.isArray(progress)) return { checked: 0, total: 0 };
  return {
    checked: progress.filter((p) => p.checked).length,
    total: progress.length,
  };
}

// ---------------------------------------------------------------------------
// Live timer display
// ---------------------------------------------------------------------------

function LiveTimer({ assignmentId }: { assignmentId: string }) {
  const getElapsedMs = useTimerStore((s) => s.getElapsedMs);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setElapsedMs(getElapsedMs(assignmentId));
    const interval = setInterval(() => {
      setElapsedMs(getElapsedMs(assignmentId));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignmentId, getElapsedMs]);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-amber-600 dark:text-amber-400">
      <Timer className="size-3 animate-pulse" />
      <span>
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AssignmentCardProps {
  assignment: Assignment & {
    chores?: Chore | null;
    members?: Member | null;
  };
  onStart?: (assignmentId: string) => void;
  onComplete?: (assignmentId: string) => void;
  onPostpone?: (assignmentId: string) => void;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssignmentCard({
  assignment,
  onStart,
  onComplete,
  onPostpone,
  compact = false,
}: AssignmentCardProps) {
  const { mode, ui } = useHouseholdMode();
  const timers = useTimerStore((s) => s.timers);

  const chore = assignment.chores;
  const member = assignment.members;
  const status = assignment.status;
  const hasTimer = !!timers[assignment.id];
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  const isOverdue =
    status !== "completed" &&
    status !== "skipped" &&
    isPast(parseISO(assignment.due_date));
  const effectiveStatus = isOverdue && status !== "overdue" ? "overdue" : status;
  const effectiveConfig = STATUS_CONFIG[effectiveStatus] ?? statusConfig;

  const { checked, total } = getChecklistProgress(assignment.checklist_progress);
  const checklistPercent = total > 0 ? Math.round((checked / total) * 100) : 0;

  const isKidMode = mode === "family" && ui.tonePlayful;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/assignments/${assignment.id}`}>
        <Card
          className={cn(
            "group cursor-pointer transition-all hover:shadow-md",
            isOverdue && "border-red-500/50 bg-red-500/5",
            isKidMode && "rounded-2xl",
            hasTimer && "ring-2 ring-amber-400/50"
          )}
        >
          <CardContent
            className={cn("flex flex-col gap-2.5", compact && "py-3")}
          >
            {/* Top row: chore name + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-medium leading-tight",
                    isKidMode && "text-base"
                  )}
                >
                  {chore?.name ?? "Unknown Chore"}
                </p>
                {!compact && chore?.reference_photo_url && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ImageIcon className="size-3" />
                    <span>Has reference photo</span>
                  </div>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn("shrink-0 text-[10px]", effectiveConfig.className)}
              >
                {isOverdue && <AlertTriangle className="mr-0.5 size-3" />}
                {effectiveConfig.label}
              </Badge>
            </div>

            {/* Assignee + due date */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  {member?.avatar_url && (
                    <AvatarImage src={member.avatar_url} alt={member.display_name} />
                  )}
                  <AvatarFallback>
                    {member?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {member?.display_name ?? "Unassigned"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{formatDueDate(assignment.due_date, assignment.due_time)}</span>
              </div>
            </div>

            {/* Checklist progress bar */}
            {total > 0 && !compact && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {checked}/{total} steps
                  </span>
                  <span>{checklistPercent}%</span>
                </div>
                <Progress value={checklistPercent} className="h-1.5" />
              </div>
            )}

            {/* Timer display when in_progress */}
            {hasTimer && <LiveTimer assignmentId={assignment.id} />}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              {(status === "pending" || effectiveStatus === "overdue") && (
                <>
                  <Button
                    variant="default"
                    size="xs"
                    className="gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStart?.(assignment.id);
                    }}
                  >
                    <Play className="size-3" />
                    Start
                  </Button>
                  {onPostpone && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPostpone(assignment.id);
                      }}
                    >
                      <CalendarClock className="size-3" />
                      Postpone
                    </Button>
                  )}
                </>
              )}
              {status === "in_progress" && (
                <Button
                  variant="default"
                  size="xs"
                  className="gap-1 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onComplete?.(assignment.id);
                  }}
                >
                  <CheckCircle2 className="size-3" />
                  Mark Done
                </Button>
              )}
              {status === "completed" && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-3" />
                  Completed
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
