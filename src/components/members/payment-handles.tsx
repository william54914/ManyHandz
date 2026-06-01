"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, Banknote, Smartphone, ExternalLink } from "lucide-react";
import { getPaymentLink, type PaymentPlatform } from "@/lib/utils/payment-links";
import type { Member } from "@/lib/supabase/types";

interface PaymentHandlesProps {
  member: Member;
  amount?: number;
  note?: string;
  className?: string;
}

interface PlatformConfig {
  key: PaymentPlatform;
  name: string;
  icon: React.ReactNode;
  handleField: keyof Member;
}

const PLATFORMS: PlatformConfig[] = [
  { key: "venmo", name: "Venmo", icon: <Wallet className="size-4" />, handleField: "venmo_handle" },
  { key: "paypal", name: "PayPal", icon: <CreditCard className="size-4" />, handleField: "paypal_handle" },
  { key: "cashapp", name: "Cash App", icon: <Banknote className="size-4" />, handleField: "cashapp_handle" },
  { key: "apple_cash", name: "Apple Cash", icon: <Smartphone className="size-4" />, handleField: "apple_cash_phone" },
];

export function PaymentHandles({ member, amount, note, className }: PaymentHandlesProps) {
  const configuredPlatforms = PLATFORMS.filter(
    (p) => member[p.handleField] && (member[p.handleField] as string).trim().length > 0
  );

  if (configuredPlatforms.length === 0) {
    return null;
  }

  function handlePayment(platform: PlatformConfig) {
    const handle = member[platform.handleField] as string;
    const link = getPaymentLink(platform.key, handle, amount, note);

    if (platform.key === "apple_cash") {
      // Apple Cash has no deep link; show a note instead
      return;
    }

    if (link.url) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    } else if (link.fallbackUrl) {
      window.open(link.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card className={cn("border-[var(--border-default)] bg-[var(--bg-secondary)]", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <Wallet className="size-4" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {configuredPlatforms.map((platform) => {
          const handle = member[platform.handleField] as string;
          const isAppleCash = platform.key === "apple_cash";

          return (
            <div
              key={platform.key}
              className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-muted)]">{platform.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{platform.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isAppleCash ? handle : `@${handle.replace(/^@+/, "")}`}
                  </p>
                </div>
              </div>
              {isAppleCash ? (
                <span className="text-xs text-[var(--text-muted)]">via iMessage</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] hover:bg-[var(--accent-primary)]/10"
                  onClick={() => handlePayment(platform)}
                >
                  Pay
                  <ExternalLink className="size-3" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
