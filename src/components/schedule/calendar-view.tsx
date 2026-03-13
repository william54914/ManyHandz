"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { ScheduleAssignment } from "@/components/schedule/day-column";

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  assignmentDates: Record<string, ScheduleAssignment[]>;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
  className?: string;
}

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({
  currentDate,
  onDateChange,
  assignmentDates,
  onDayClick,
  selectedDate,
  className,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const monthLabel = format(currentDate, "MMMM yyyy");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold">{monthLabel}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayAssignments = assignmentDates[dateKey] || [];
          const inCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const isSelected = selectedDate
            ? isSameDay(day, selectedDate)
            : false;

          // Get unique member colors for dot indicators
          const uniqueColors = [
            ...new Set(dayAssignments.map((a) => a.memberColor)),
          ].slice(0, 4);

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex flex-col items-center min-h-[64px] rounded-lg p-1 transition-all hover:bg-muted/50",
                !inCurrentMonth && "opacity-30",
                today && "bg-primary/10",
                isSelected && "ring-2 ring-primary bg-primary/15"
              )}
            >
              {/* Date number */}
              <span
                className={cn(
                  "text-xs font-medium",
                  today
                    ? "text-primary font-bold"
                    : inCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Assignment count */}
              {dayAssignments.length > 0 && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {dayAssignments.length}
                </span>
              )}

              {/* Colored dots */}
              <div className="flex gap-0.5 mt-auto mb-0.5">
                {uniqueColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
