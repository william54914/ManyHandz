"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { TrialBanner } from "@/components/billing/trial-banner";
import { SubscriptionStatus } from "@/components/billing/subscription-status";
import { PricingCard } from "@/components/billing/pricing-card";

import {
  CreditCard,
  Check,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Lock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Stripe config (matches server-side constants)
// ---------------------------------------------------------------------------
const STRIPE_CONFIG = {
  monthly: {
    priceId: "price_monthly",
    amount: 999,
    label: "$9.99",
    period: "month",
  },
  annual: {
    priceId: "price_annual",
    amount: 9999,
    label: "$99.99",
    period: "year",
  },
};

const FEATURES = [
  "Unlimited household members",
  "Unlimited chores and assignments",
  "AI verification of photo proof",
  "Automated rotation schedules",
  "Points, levels, and achievements",
  "Reward marketplace",
  "Savings goals with auto-contribute",
  "Head-to-head competitions",
  "Bonus challenges",
  "Weekly report cards",
  "Payment handles integration",
  "Priority support",
];

export default function BillingPage() {
  const router = useRouter();
  const { subscription, isActive, isTrialing, isTrialExpired, daysRemaining, isLoading } = useSubscription();
  const { permissions } = useHouseholdMode();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  // use-subscription already accounts for status=trialing + trial_end past.
  // We accept either as "expired" here so the paywall shows on day 0.
  const trialExpired =
    isTrialExpired || (isTrialing && daysRemaining !== null && daysRemaining <= 0);
  const showPaywall = !isActive || trialExpired;

  // -----------------------------------------------------------------------
  // Create Checkout Session
  // -----------------------------------------------------------------------
  const createCheckout = useMutation({
    mutationFn: async () => {
      if (!householdId) throw new Error("No household selected");
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId,
          priceId: STRIPE_CONFIG[selectedPlan].priceId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      return url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to start checkout"),
  });

  // -----------------------------------------------------------------------
  // Create Portal Session (manage subscription)
  // -----------------------------------------------------------------------
  const createPortal = useMutation({
    mutationFn: async () => {
      if (!householdId) throw new Error("No household selected");
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId,
          returnUrl: `${window.location.origin}/billing`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create portal session");
      const { url } = await res.json();
      return url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal"),
  });

  // Only admins can access billing (placed after all hooks to satisfy Rules of Hooks)
  if (!permissions.canAccessBilling) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Only household admins can manage billing. Please contact your household admin.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24 px-4">
      <div className="pt-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage your subscription and billing
        </p>
      </div>

      {/* Trial Banner */}
      {isTrialing && daysRemaining !== null && (
        <TrialBanner daysRemaining={daysRemaining} />
      )}

      {/* Trial Expired Paywall */}
      {trialExpired && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <Lock className="size-12 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Your Free Trial Has Expired
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Subscribe to continue using all ManyHandz features
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Status */}
      {subscription && !trialExpired && (
        <SubscriptionStatus subscription={subscription} />
      )}

      {/* Manage Subscription Button (active subscribers) */}
      {isActive && !isTrialing && (
        <Button
          variant="outline"
          className="w-full gap-2 border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          onClick={() => createPortal.mutate()}
          disabled={createPortal.isPending}
        >
          {createPortal.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CreditCard className="size-4" />
          )}
          Manage Subscription
        </Button>
      )}

      {/* Pricing Cards */}
      {(showPaywall || isTrialing) && (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Choose Your Plan
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              All plans include every feature. No hidden fees.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PricingCard
              planName="Monthly"
              price={STRIPE_CONFIG.monthly.label}
              period="month"
              features={FEATURES}
              isSelected={selectedPlan === "monthly"}
              onSelect={() => setSelectedPlan("monthly")}
              ctaLabel={selectedPlan === "monthly" ? "Selected" : "Select Monthly"}
            />
            <PricingCard
              planName="Annual"
              price={STRIPE_CONFIG.annual.label}
              period="year"
              features={FEATURES}
              isSelected={selectedPlan === "annual"}
              isHighlighted
              savingsBadge="Save ~17%"
              onSelect={() => setSelectedPlan("annual")}
              ctaLabel={selectedPlan === "annual" ? "Selected" : "Select Annual"}
            />
          </div>

          <Button
            className="w-full gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white py-6 text-lg"
            onClick={() => createCheckout.mutate()}
            disabled={createCheckout.isPending}
          >
            {createCheckout.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="size-5" />
                Subscribe to {selectedPlan === "monthly" ? "Monthly" : "Annual"} Plan
              </>
            )}
          </Button>
        </>
      )}

      {/* Feature Checklist */}
      <Card className="border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
            <Zap className="size-5 text-amber-400" />
            Everything Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
              >
                <Check className="size-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
        <Shield className="size-3.5" />
        <span>Payments secured by Stripe. Cancel anytime.</span>
      </div>
    </div>
  );
}
