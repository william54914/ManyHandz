"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRotationGroups } from "@/lib/hooks/use-rotation-groups";
import type { RotationGroupWithChore } from "@/lib/hooks/use-rotation-groups";
import { useMembers } from "@/lib/hooks/use-members";
import { ScheduleCard } from "./schedule-card";
import { EditScheduleDialog } from "./edit-schedule-dialog";

interface SchedulesListProps {
  onCreateNew: () => void;
}

export function SchedulesList({ onCreateNew }: SchedulesListProps) {
  const { rotationGroups, isLoading, toggleActive, deleteRotation } =
    useRotationGroups();
  const { members } = useMembers();
  const [editingSchedule, setEditingSchedule] =
    useState<RotationGroupWithChore | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (rotationGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <CalendarClock className="size-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">No recurring schedules yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Create your first recurring schedule to automatically assign chores to
          household members on a regular basis.
        </p>
        <Button className="mt-6 gap-1.5" onClick={onCreateNew}>
          <Plus className="size-4" />
          Create Schedule
        </Button>
      </div>
    );
  }

  // Split active and paused
  const activeSchedules = rotationGroups.filter((rg) => rg.is_active);
  const pausedSchedules = rotationGroups.filter((rg) => !rg.is_active);

  return (
    <>
      <div className="space-y-6">
        {/* Active schedules */}
        {activeSchedules.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Active ({activeSchedules.length})
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSchedules.map((rg) => (
                <ScheduleCard
                  key={rg.id}
                  rotationGroup={rg}
                  members={members}
                  onEdit={setEditingSchedule}
                  onToggleActive={(id, isActive) =>
                    toggleActive.mutate({ id, is_active: isActive })
                  }
                  onDelete={(id) => {
                    deleteRotation.mutate(id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused schedules */}
        {pausedSchedules.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Paused ({pausedSchedules.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {pausedSchedules.map((rg) => (
                <ScheduleCard
                  key={rg.id}
                  rotationGroup={rg}
                  members={members}
                  onEdit={setEditingSchedule}
                  onToggleActive={(id, isActive) =>
                    toggleActive.mutate({ id, is_active: isActive })
                  }
                  onDelete={(id) => {
                    deleteRotation.mutate(id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <EditScheduleDialog
        rotationGroup={editingSchedule}
        onClose={() => setEditingSchedule(null)}
      />
    </>
  );
}
