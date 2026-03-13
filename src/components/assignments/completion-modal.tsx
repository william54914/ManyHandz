"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Loader2,
  Star,
  Zap,
  Flame,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { useTimerStore } from "@/lib/stores/timer-store";
import {
  calculateBasePoints,
  calculatePhotoBonus,
  calculateSpeedBonus,
  calculateStreakBonus,
} from "@/lib/utils/points";
import type { Assignment, Chore, Member } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Photo uploader sub-component
// ---------------------------------------------------------------------------

function PhotoUploader({
  label,
  photo,
  onPhotoChange,
  onRemove,
}: {
  label: string;
  photo: string | null;
  onPhotoChange: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Basic client-side compression: resize large images
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onPhotoChange]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {photo ? (
        <div className="relative">
          <img
            src={photo}
            alt={label}
            className="h-32 w-full rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.accept = "image/*";
                inputRef.current.capture = "environment";
                inputRef.current.click();
              }
            }}
          >
            <Camera className="size-3.5" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.removeAttribute("capture");
                inputRef.current.accept = "image/*";
                inputRef.current.click();
              }
            }}
          >
            <Upload className="size-3.5" />
            Upload
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Points preview
// ---------------------------------------------------------------------------

function PointsPreview({
  base,
  streakBonus,
  speedBonus,
  photoBonus,
  total,
}: {
  base: number;
  streakBonus: number;
  speedBonus: number;
  photoBonus: number;
  total: number;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Points Preview</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="size-3 text-amber-500" />
            <span>Base</span>
          </div>
          <span className="font-mono">+{base}</span>
        </div>
        {streakBonus > 0 && (
          <div className="flex items-center justify-between text-orange-500">
            <div className="flex items-center gap-1.5">
              <Flame className="size-3" />
              <span>Streak</span>
            </div>
            <span className="font-mono">+{streakBonus}</span>
          </div>
        )}
        {speedBonus > 0 && (
          <div className="flex items-center justify-between text-blue-500">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3" />
              <span>Speed</span>
            </div>
            <span className="font-mono">+{speedBonus}</span>
          </div>
        )}
        {photoBonus > 0 && (
          <div className="flex items-center justify-between text-purple-500">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="size-3" />
              <span>Photo</span>
            </div>
            <span className="font-mono">+{photoBonus}</span>
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono text-primary">{total} pts</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: (Assignment & { chores?: Chore | null; members?: Member | null }) | null;
  currentMember: Member | null;
  onSubmit: (data: {
    assignmentId: string;
    notes?: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    actualMinutes?: number;
    pointsEarned: number;
    speedBonus: number;
  }) => void;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompletionModal({
  open,
  onOpenChange,
  assignment,
  currentMember,
  onSubmit,
  isSubmitting = false,
}: CompletionModalProps) {
  const { features } = useHouseholdMode();
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const getElapsedMs = useTimerStore((s) => s.getElapsedMs);

  const [notes, setNotes] = useState("");
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  if (!assignment || !assignment.chores) return null;

  const chore = assignment.chores;
  const elapsedMs = getElapsedMs(assignment.id);
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const actualMinutes = elapsedMinutes > 0 ? elapsedMinutes : undefined;

  const base = calculateBasePoints(chore.difficulty, chore.estimated_minutes);
  const streakBonus = calculateStreakBonus(base, currentMember?.current_streak ?? 0);
  const speedBonusValue =
    actualMinutes !== undefined
      ? calculateSpeedBonus(base, chore.estimated_minutes, actualMinutes)
      : 0;
  const photoBonus = calculatePhotoBonus(!!beforePhoto, !!afterPhoto);
  const total = base + streakBonus + speedBonusValue + photoBonus;

  const handleSubmit = () => {
    // Stop the timer if one is running
    stopTimer(assignment.id);

    onSubmit({
      assignmentId: assignment.id,
      notes: notes.trim() || undefined,
      beforePhotoUrl: beforePhoto ?? undefined,
      afterPhotoUrl: afterPhoto ?? undefined,
      actualMinutes,
      pointsEarned: total,
      speedBonus: speedBonusValue,
    });

    // Reset form
    setNotes("");
    setBeforePhoto(null);
    setAfterPhoto(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500" />
            Complete: {chore.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Timer result */}
          {actualMinutes !== undefined && actualMinutes > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-sm">
              <Zap className="size-4 text-blue-500" />
              <span>
                Completed in{" "}
                <span className="font-semibold">{actualMinutes} min</span>
                {actualMinutes < chore.estimated_minutes && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {" "}
                    - {chore.estimated_minutes - actualMinutes} min faster!
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Before Photo */}
          <PhotoUploader
            label="Before Photo (optional)"
            photo={beforePhoto}
            onPhotoChange={setBeforePhoto}
            onRemove={() => setBeforePhoto(null)}
          />

          {/* After Photo */}
          <PhotoUploader
            label="After Photo (optional)"
            photo={afterPhoto}
            onPhotoChange={setAfterPhoto}
            onRemove={() => setAfterPhoto(null)}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="completion-notes">Notes (optional)</Label>
            <Textarea
              id="completion-notes"
              placeholder="Anything to note about this completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Points Preview */}
          {features.gamification && (
            <PointsPreview
              base={base}
              streakBonus={streakBonus}
              speedBonus={speedBonusValue}
              photoBonus={photoBonus}
              total={total}
            />
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Completion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
