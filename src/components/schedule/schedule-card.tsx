"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  RotateCcw,
  Pencil,
  Pause,
  Play,
  Trash2,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getNextRotationDate,
  getFrequencyLabel,
  type RotationGroup as RotationGroupUtil,
} from "@/lib/utils/rotation";
import type { RotationGroupWithChore } from "@/lib/hooks/use-rotation-groups";
import type { Member } from "@/lib/supabase/types";

interface ScheduleCardProps {
  rotationGroup: RotationGroupWithChore;
  members: Member[];
  onEdit: (rotationGroup: RotationGroupWithChore) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function ScheduleCard({
  rotationGroup,
  members,
  onEdit,
  onToggleActive,
  onDelete,
}: ScheduleCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rg = rotationGroup;
  const choreName = rg.chores?.name ?? "Unknown Chore";
  const categoryName = rg.chores?.chore_categories?.name ?? "General";
  const categoryColor = rg.chores?.chore_categories?.color ?? "#64748b";

  // Build utility group for getNextRotationDate
  const utilGroup: RotationGroupUtil = {
    id: rg.id,
    choreId: rg.chore_id,
    memberOrder: rg.member_order ?? [],
    currentIndex: rg.current_index,
    rotationType: rg.rotation_type,
    frequency: rg.frequency,
    startDate: rg.start_date,
    isActive: rg.is_active,
  };

  const nextDate = rg.is_active
    ? getNextRotationDate(utilGroup, new Date())
    : null;

  // Resolve member data from IDs
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const orderedMembers = (rg.member_order ?? [])
    .map((id) => memberMap.get(id))
    .filter(Boolean) as Member[];

  return (
    <Card
      className={cn(
        "transition-all",
        !rg.is_active && "opacity-60"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top row: chore name + category badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{choreName}</h3>
            <Badge
              variant="secondary"
              className="mt-1 text-[10px]"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </Badge>
          </div>

          {/* Active indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                rg.is_active ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
            />
            <span className="text-[10px] text-muted-foreground">
              {rg.is_active ? "Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* Badges: frequency + rotation type */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] gap-1">
            <Clock className="size-3" />
            {getFrequencyLabel(rg.frequency)}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            <RotateCcw className="size-3" />
            {rg.rotation_type === "round_robin" ? "Round Robin" : "Fixed"}
          </Badge>
        </div>

        {/* Member avatars */}
        <div className="flex items-center gap-2">
          <Users className="size-3.5 text-muted-foreground shrink-0" />
          <div className="flex -space-x-1.5">
            {orderedMembers.map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold",
                  rg.rotation_type === "round_robin" &&
                    i === rg.current_index &&
                    "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
                style={{ backgroundColor: m.favorite_color }}
                title={`${i + 1}. ${m.display_name}${
                  rg.rotation_type === "round_robin" && i === rg.current_index
                    ? " (current)"
                    : ""
                }`}
              >
                <span className="text-white drop-shadow-sm">
                  {m.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          {rg.rotation_type === "round_robin" && orderedMembers.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {orderedMembers.length} member
              {orderedMembers.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Next rotation date */}
        {nextDate && rg.is_active && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="size-3" />
            <span>Next: {format(nextDate, "EEE, MMM d")}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onEdit(rg)}
          >
            <Pencil className="size-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onToggleActive(rg.id, !rg.is_active)}
          >
            {rg.is_active ? (
              <>
                <Pause className="size-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-3" />
                Resume
              </>
            )}
          </Button>

          {confirmDelete ? (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[10px] text-destructive">Delete?</span>
              <Button
                variant="destructive"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => {
                  onDelete(rg.id);
                  setConfirmDelete(false);
                }}
              >
                Yes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
