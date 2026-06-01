"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";

export function useSubscription() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", householdId],
    staleTime: 5 * 60 * 1000, // 5 minutes — only changes on billing events
    queryFn: async () => {
      if (!householdId) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select(
          "id, status, trial_end, current_period_end, stripe_subscription_id, price_id, cancel_at_period_end"
        )
        .eq("household_id", householdId)
        .single();
      return data;
    },
    enabled: !!householdId,
  });

  const trialEndsAt = subscription?.trial_end
    ? new Date(subscription.trial_end)
    : null;
  const trialEndMs = trialEndsAt?.getTime() ?? null;
  const nowMs = Date.now();

  // Whole-day count remaining (0 means trial ends today or already ended).
  const daysRemaining =
    trialEndMs !== null
      ? Math.max(
          0,
          Math.ceil((trialEndMs - nowMs) / (1000 * 60 * 60 * 24))
        )
      : null;

  // A trial is "currently active" only if (a) the subscription status is
  // `trialing` AND (b) the trial_end date is in the future.
  // This prevents the banner-vs-billing disagreement that happened when the
  // DB row said "trialing" but the trial_end had already passed (waiting on
  // the Stripe webhook to flip status).
  const trialEndPassed = trialEndMs !== null && trialEndMs <= nowMs;
  const isTrialingRaw = subscription?.status === "trialing";
  const isTrialing = isTrialingRaw && !trialEndPassed;
  const isTrialExpired = isTrialingRaw && trialEndPassed;

  // `isActive` is the gate every gated UI should check. It is true while:
  //   - status === 'active'  (paid)
  //   - status === 'trialing' AND trial_end is still in the future
  // It is false once the trial passes its end date, even if the row hasn't
  // yet been updated by Stripe.
  const isActive =
    subscription?.status === "active" ||
    (isTrialingRaw && !trialEndPassed);

  return {
    subscription,
    isActive,
    isTrialing,
    isTrialExpired,
    trialEndsAt,
    daysRemaining,
    isLoading,
  };
}
