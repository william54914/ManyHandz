"use client";

import { useState } from "react";
import { ArrowRight, Check, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatRelativeDate } from "@/lib/utils/format";
import { SettleUpModal } from "./settle-up-modal";
import type { SettlementWithMembers } from "@/lib/hooks/use-settlements";
import type { SettlementPayoutType, SettlementSourceType, SettlementStatus } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Payout type icons and labels
// ---------------------------------------------------------------------------
const PAYOUT_ICONS: Record<SettlementPayoutType, string> = {
  money: "\uD83D\uDCB0",
  treat: "\uD83C\uDF55",
  gift: "\uD83C\uDF81",
  privilege: "\uD83D\uDC51",
  experience: "\uD83C\uDFAA",
  custom: "\u270F\uFE0F",
};

const PAYOUT_LABELS: Record<SettlementPayoutType, string> = {
  money: "Money",
  treat: "Treat",
  gift: "Gift",
  privilege: "Privilege",
  experience: "Experience",
  custom: "Custom",
};

const SOURCE_LABELS: Record<SettlementSourceType, string> = {
  goal_payout: "Goal",
  competition: "Competition",
  reward_redemption: "Reward",
  allowance: "Allowance",
  manual: "Manual",
};

const STATUS_VARIANTS: Record<SettlementStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "default",
  settled: "secondary",
  forgiven: "outline",
  declined: "destructive",
};

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SettlementCardProps {
  settlement: SettlementWithMembers;
  currentMemberId: string | null;
  onSettle: (settlementId: string, via: string, note?: string) => void;
  onForgive: (settlementId: string, note?: string) => void;
}

export function SettlementCard({
  settlement,
  currentMemberId,
  onSettle,
  onForgive,
}: SettlementCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"settle" | "forgive">("settle");

  const isPending = settlement.status === "pending";
  const isFromMe = settlement.from_member_id === currentMemberId;
  const isToMe = settlement.to_member_id === currentMemberId;
  const icon = PAYOUT_ICONS[settlement.payout_type];

  return (
    <>
      <Card
        className={cn(
          "transition-colors",
          isPending && "border-primary/20",
          settlement.status === "settled" && "opacity-70",
          settlement.status === "forgiven" && "opacity-60"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Payout type icon */}
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-lg shrink-0">
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Description + amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">
                    {settlement.description}
                  </p>
                  {settlement.payout_type !== "money" &&
                    settlement.payout_description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {settlement.payout_description}
                      </p>
                    )}
                </div>
                {settlement.payout_type === "money" && settlement.amount_cents && (
                  <span className="font-semibold text-sm shrink-0">
                    {formatCurrency(settlement.amount_cents)}
                  </span>
                )}
              </div>

              {/* From -> To */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar size="sm">
                  <AvatarImage
                    src={settlement.from_member.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {getMemberInitials(settlement.from_member.display_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {isFromMe ? "You" : settlement.from_member.display_name}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <Avatar size="sm">
                  <AvatarImage
                    src={settlement.to_member.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {getMemberInitials(settlement.to_member.display_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {isToMe ? "You" : settlement.to_member.display_name}
                </span>
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {SOURCE_LABELS[settlement.source_type]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {PAYOUT_LABELS[settlement.payout_type]}
                </Badge>
                <Badge variant={STATUS_VARIANTS[settlement.status]} className="text-xs capitalize">
                  {settlement.status}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatRelativeDate(settlement.created_at)}
                </span>
              </div>

              {/* Settled info */}
              {settlement.status === "settled" && settlement.settled_via && (
                <p className="text-xs text-muted-foreground">
                  Settled via {settlement.settled_via}
                  {settlement.settled_note && ` - ${settlement.settled_note}`}
                </p>
              )}
              {settlement.status === "forgiven" && (
                <p className="text-xs text-muted-foreground">
                  Forgiven
                  {settlement.settled_note && ` - ${settlement.settled_note}`}
                </p>
              )}

              {/* Actions for pending */}
              {isPending && (isFromMe || isToMe) && (
                <div className="flex items-center gap-2 pt-1">
                  {isFromMe && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() => {
                        setModalAction("settle");
                        setShowModal(true);
                      }}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Settle
                    </Button>
                  )}
                  {isToMe && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setModalAction("forgive");
                        setShowModal(true);
                      }}
                    >
                      <HeartHandshake className="h-3 w-3 mr-1" />
                      Forgive
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <SettleUpModal
          settlement={settlement}
          action={modalAction}
          open={showModal}
          onOpenChange={setShowModal}
          onSettle={onSettle}
          onForgive={onForgive}
        />
      )}
    </>
  );
}
