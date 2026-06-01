"use client";

import { format, isToday } from "date-fns";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/lib/supabase/types";

export interface ScheduleAssignment {
  id: string;
  choreName: string;
  choreIcon: string;
  memberName: string;
  memberColor: string;
  dueTime: string | null;
  status: AssignmentStatus;
  categoryName: string;
  rotationGroupId?: string | null;
}

interface DayColumnProps {
  date: Date;
  assignments: ScheduleAssignment[];
  onAssignmentClick: (assignmentId: string) => void;
  className?: string;
}

function getStatusStyles(status: AssignmentStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/5";
    case "overdue":
      return "border-red-500/30 bg-red-500/5";
    case "in_progress":
      return "border-blue-500/30 bg-blue-500/5";
    case "skipped":
      return "border-muted-foreground/30 bg-muted/30 opacity-50";
    default:
      return "border-border/50 bg-card";
  }
}

function getStatusLabel(status: AssignmentStatus): string {
  switch (status) {
    case "completed":
      return "Done";
    case "overdue":
      return "Overdue";
    case "in_progress":
      return "Active";
    case "skipped":
      return "Skipped";
    default:
      return "Pending";
  }
}

export function DayColumn({
  date,
  assignments,
  onAssignmentClick,
  className,
}: DayColumnProps) {
  const today = isToday(date);
  const dayName = format(date, "EEE");
  const dayNum = format(date, "d");

  return (
    <div
      className={cn(
        "flex flex-col min-w-0",
        today && "relative",
        className
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          "flex flex-col items-center py-2 mb-2 rounded-lg",
          today
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground"
        )}
      >
        <span className="text-xs font-medium uppercase">{dayName}</span>
        <span
          className={cn(
            "text-lg font-bold",
            today && "text-primary"
          )}
        >
          {dayNum}
        </span>
      </div>

      {/* Assignment cards */}
      <div className="flex-1 space-y-1.5 min-h-[80px]">
        {assignments.length === 0 && (
          <div className="text-[10px] text-muted-foreground/50 text-center py-4">
            No tasks
          </div>
        )}
        {assignments.map((assignment) => (
          <button
            type="button"
            key={assignment.id}
            onClick={() => onAssignmentClick(assignment.id)}
            className={cn(
              "w-full text-left rounded-lg border p-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
              getStatusStyles(assignment.status)
            )}
          >
            {/* Color indicator */}
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: assignment.memberColor }}
              />
              <span className="text-[10px] text-muted-foreground truncate">
                {assignment.memberName}
              </span>
              {assignment.rotationGroupId && (
                <RotateCcw className="size-2.5 text-muted-foreground/60 shrink-0" />
              )}
            </div>

            {/* Chore name */}
            <p className="text-xs font-medium leading-tight truncate">
              {assignment.choreName}
            </p>

            {/* Time & status */}
            <div className="flex items-center justify-between mt-1">
              {assignment.dueTime && (
                <span className="text-[10px] text-muted-foreground">
                  {assignment.dueTime}
                </span>
              )}
              {assignment.status !== "pending" && (
                <Badge
                  variant={
                    assignment.status === "completed"
                      ? "default"
                      : assignment.status === "overdue"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[9px] px-1 py-0"
                >
                  {getStatusLabel(assignment.status)}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
