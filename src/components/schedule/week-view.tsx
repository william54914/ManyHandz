"use client";

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { ScheduleAssignment } from "@/components/schedule/day-column";

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  assignments: ScheduleAssignment[];
  assignmentDates: Record<string, ScheduleAssignment[]>;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
  className?: string;
}

export function WeekView({
  currentDate,
  onDateChange,
  assignmentDates,
  onDayClick,
  selectedDate,
  className,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekLabel = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(subWeeks(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium text-center">
          <span>{weekLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(addWeeks(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 7-column dot grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayAssignments = assignmentDates[dateKey] || [];
          const today = isToday(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          // Get unique member colors for dot indicators
          const uniqueColors = [
            ...new Set(dayAssignments.map((a) => a.memberColor)),
          ].slice(0, 5);

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex flex-col items-center min-h-[72px] rounded-lg p-1.5 transition-all",
                "hover:bg-muted/50",
                today && "bg-primary/10",
                isSelected && "ring-2 ring-primary bg-primary/15"
              )}
            >
              {/* Day name */}
              <span
                className={cn(
                  "text-[10px] font-medium uppercase",
                  today ? "text-primary" : "text-muted-foreground"
                )}
              >
                {format(day, "EEE")}
              </span>

              {/* Date number */}
              <span
                className={cn(
                  "text-lg font-bold leading-tight",
                  today ? "text-primary" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Task count */}
              {dayAssignments.length > 0 && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {dayAssignments.length} task
                  {dayAssignments.length !== 1 ? "s" : ""}
                </span>
              )}

              {/* Colored dots */}
              {uniqueColors.length > 0 && (
                <div className="flex gap-0.5 mt-auto mb-0.5">
                  {uniqueColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
