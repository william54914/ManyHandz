"use client";

import { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Pin,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useMembers } from "@/lib/hooks/use-members";
import { useRotationGroups } from "@/lib/hooks/use-rotation-groups";
import type { RotationGroupWithChore } from "@/lib/hooks/use-rotation-groups";
import { getFrequencyLabel } from "@/lib/utils/rotation";
import { getCategoryColor } from "@/lib/constants/categories";

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";
type RotationType = "round_robin" | "fixed";

interface EditScheduleDialogProps {
  rotationGroup: RotationGroupWithChore | null;
  onClose: () => void;
}

export function EditScheduleDialog({
  rotationGroup,
  onClose,
}: EditScheduleDialogProps) {
  const { members } = useMembers();
  const { updateRotation } = useRotationGroups();

  // -----------------------------------------------------------------------
  // Form state — initialized from rotationGroup
  // -----------------------------------------------------------------------
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [rotationType, setRotationType] = useState<RotationType>("round_robin");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when rotationGroup changes
  useEffect(() => {
    if (rotationGroup) {
      setFrequency(rotationGroup.frequency);
      setRotationType(rotationGroup.rotation_type);
      setSelectedMembers(rotationGroup.member_order ?? []);
      setStartDate(rotationGroup.start_date);
      setIsActive(rotationGroup.is_active);
    }
  }, [rotationGroup]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  function moveMember(index: number, direction: "up" | "down") {
    setSelectedMembers((prev) => {
      const arr = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return arr;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  }

  function handleSave() {
    if (!rotationGroup) return;
    const memberOrder =
      rotationType === "fixed"
        ? selectedMembers.slice(0, 1)
        : selectedMembers;
    updateRotation.mutate(
      {
        id: rotationGroup.id,
        frequency,
        rotation_type: rotationType,
        member_order: memberOrder,
        start_date: startDate,
        is_active: isActive,
      },
      { onSuccess: () => onClose() }
    );
  }

  const choreName = rotationGroup?.chores?.name ?? "Unknown Chore";
  const categoryName = rotationGroup?.chores?.chore_categories?.name ?? "General";
  const categoryColor = getCategoryColor(categoryName);

  const canSave = selectedMembers.length > 0 && !!startDate;

  return (
    <Dialog open={!!rotationGroup} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Modify this recurring schedule&apos;s settings
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 min-h-0">
          {/* Chore info (read only) */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="text-sm font-medium truncate">{choreName}</span>
            <Badge
              variant="secondary"
              className="text-[10px] ml-auto"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </Badge>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-[10px] text-muted-foreground">
                Paused schedules won&apos;t create new assignments
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Frequency selector */}
          <div className="space-y-2">
            <Label>How often?</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["daily", "weekly", "biweekly", "monthly"] as Frequency[]
              ).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                    frequency === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  {getFrequencyLabel(f)}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation type */}
          <div className="space-y-2">
            <Label>Assignment type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRotationType("round_robin")}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border-2 p-3 text-left transition-all",
                  rotationType === "round_robin"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <RotateCcw className="size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Round Robin</p>
                  <p className="text-[10px] text-muted-foreground">
                    Members take turns
                  </p>
                </div>
              </button>
              <button
                onClick={() => setRotationType("fixed")}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border-2 p-3 text-left transition-all",
                  rotationType === "fixed"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <Pin className="size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fixed</p>
                  <p className="text-[10px] text-muted-foreground">
                    Always same person
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Member selection */}
          <div className="space-y-2">
            <Label>
              {rotationType === "round_robin"
                ? "Rotation order"
                : "Assign to"}
            </Label>

            <div className="space-y-1.5">
              {members.map((m) => {
                const isSelected = selectedMembers.includes(m.id);
                const orderIndex = selectedMembers.indexOf(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (rotationType === "fixed") {
                        setSelectedMembers([m.id]);
                      } else {
                        toggleMember(m.id);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2.5 w-full rounded-lg border-2 p-2.5 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    {rotationType === "round_robin" && isSelected && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                        {orderIndex + 1}
                      </span>
                    )}
                    <div
                      className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: m.favorite_color }}
                    >
                      {m.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium flex-1 truncate">
                      {m.display_name}
                    </span>
                    {isSelected && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reorder controls */}
            {rotationType === "round_robin" && selectedMembers.length > 1 && (
              <div className="mt-3 space-y-1.5 rounded-lg border border-border/50 p-2.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  Rotation Order
                </p>
                {selectedMembers.map((mid, i) => {
                  const m = members.find((mem) => mem.id === mid);
                  if (!m) return null;
                  return (
                    <div
                      key={mid}
                      className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5"
                    >
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {i + 1}.
                      </span>
                      <div
                        className="flex size-6 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: m.favorite_color }}
                      >
                        {m.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium flex-1 truncate">
                        {m.display_name}
                      </span>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={i === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveMember(i, "up");
                          }}
                        >
                          <ChevronUp className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={i === selectedMembers.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveMember(i, "down");
                          }}
                        >
                          <ChevronDown className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 pb-1">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateRotation.isPending || !canSave}
            >
              {updateRotation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
