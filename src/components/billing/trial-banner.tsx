"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Zap } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
  className?: string;
}

export function TrialBanner({ daysRemaining, className }: TrialBannerProps) {
  const router = useRouter();

  const isUrgent = daysRemaining <= 1;
  const isWarning = daysRemaining <= 3;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
        isUrgent
          ? "border-red-500/50 bg-red-500/10 text-red-400"
          : isWarning
            ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
            : "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 text-[var(--text-primary)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertTriangle className="size-5 shrink-0" />
        ) : isWarning ? (
          <Clock className="size-5 shrink-0" />
        ) : (
          <Zap className="size-5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">
            {daysRemaining <= 0
              ? "Your free trial has expired"
              : daysRemaining === 1
                ? "Last day of your free trial!"
                : `${daysRemaining} days remaining in your free trial`}
          </p>
          <p
            className={cn(
              "text-xs",
              isUrgent
                ? "text-red-400/80"
                : isWarning
                  ? "text-amber-400/80"
                  : "text-[var(--text-muted)]"
            )}
          >
            {daysRemaining <= 0
              ? "Subscribe now to continue using ManyHandz"
              : "Subscribe to keep all features after your trial ends"}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className={cn(
          "shrink-0",
          isUrgent
            ? "bg-red-500 hover:bg-red-600 text-white"
            : isWarning
              ? "bg-amber-500 hover:bg-amber-600 text-black"
              : "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
        )}
        onClick={() => router.push("/billing")}
      >
        Subscribe Now
      </Button>
    </div>
  );
}
