"use client";

import { Gift, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RewardCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  pointsCost: number;
  memberPoints: number;
  onRedeem: (rewardId: string) => void;
  isRedeeming?: boolean;
}

export function RewardCard({
  id,
  name,
  description,
  icon,
  pointsCost,
  memberPoints,
  onRedeem,
  isRedeeming = false,
}: RewardCardProps) {
  const canAfford = memberPoints >= pointsCost;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        !canAfford && "opacity-60"
      )}
    >
      <CardContent className="flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center h-14 w-14 rounded-2xl text-2xl",
            canAfford
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Gift className="h-7 w-7" />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-tight">{name}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Cost */}
        <div
          className={cn(
            "text-lg font-bold",
            canAfford ? "text-primary" : "text-muted-foreground"
          )}
        >
          {pointsCost} pts
        </div>

        {/* Redeem button */}
        <Button
          size="sm"
          className="w-full"
          disabled={!canAfford || isRedeeming}
          onClick={() => onRedeem(id)}
        >
          {!canAfford ? (
            <>
              <Lock className="h-3.5 w-3.5 mr-1" />
              Need {pointsCost - memberPoints} more
            </>
          ) : isRedeeming ? (
            "Redeeming..."
          ) : (
            "Redeem"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
