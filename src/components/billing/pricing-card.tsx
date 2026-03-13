"use client";

import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface PricingCardProps {
  planName: string;
  price: string;
  period: string;
  features: string[];
  isSelected?: boolean;
  isHighlighted?: boolean;
  savingsBadge?: string;
  ctaLabel?: string;
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PricingCard({
  planName,
  price,
  period,
  features,
  isSelected = false,
  isHighlighted = false,
  savingsBadge,
  ctaLabel = "Select Plan",
  onSelect,
  isLoading = false,
  disabled = false,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all cursor-pointer",
        isSelected && "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30",
        isHighlighted && !isSelected && "border-[var(--accent-primary)]/50",
        className
      )}
      onClick={onSelect}
    >
      {savingsBadge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
            {savingsBadge}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-lg text-[var(--text-primary)]">{planName}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold text-[var(--text-primary)]">{price}</span>
          <span className="text-sm text-[var(--text-muted)]">/{period}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <Check className="size-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={cn(
            "w-full",
            isSelected
              ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
              : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={disabled || isLoading}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
