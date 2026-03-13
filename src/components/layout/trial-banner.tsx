"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysRemaining: number;
  onDismiss: () => void;
}

export function TrialBanner({ daysRemaining, onDismiss }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 3;
  const isLastDay = daysRemaining <= 1;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium",
        isLastDay
          ? "bg-destructive/90 text-white"
          : isUrgent
            ? "bg-amber-500/90 text-black"
            : "bg-primary/90 text-primary-foreground"
      )}
    >
      <span>
        {isLastDay
          ? "Last day of your free trial!"
          : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining in your free trial`}
      </span>

      <Button
        asChild
        size="xs"
        variant={isUrgent ? "outline" : "secondary"}
        className={cn(
          isLastDay && "border-white/40 text-white hover:bg-white/20",
          isUrgent && !isLastDay && "border-black/20 text-black hover:bg-black/10"
        )}
      >
        <Link href="/billing">Subscribe Now</Link>
      </Button>

      <button
        onClick={onDismiss}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 transition-opacity hover:opacity-80",
          isLastDay
            ? "text-white/80"
            : isUrgent
              ? "text-black/60"
              : "text-primary-foreground/80"
        )}
        aria-label="Dismiss trial banner"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
