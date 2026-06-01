"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";

/**
 * Banner that appears when the current user has not yet verified their
 * email address. Lets them resend the verification link. Auto-hides once
 * `email_confirmed_at` is set on the Supabase user.
 */
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // user.email_confirmed_at is null/undefined until the user clicks the
  // confirmation link in their inbox.
  const unverified =
    !!user &&
    !user.email_confirmed_at &&
    !!user.email;

  if (!unverified || dismissed) return null;

  async function handleResend() {
    if (!user?.email) return;
    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      if (error) {
        toast.error(error.message || "Failed to resend verification email");
      } else {
        toast.success(`Verification email sent to ${user.email}`);
      }
    } catch {
      toast.error("Failed to resend verification email");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center gap-3 bg-amber-500/15 px-4 py-2 text-sm border-b border-amber-500/30 text-amber-200">
      <Mail className="size-4 shrink-0" />
      <span className="text-center">
        <span className="hidden sm:inline">
          Please verify your email address ({user?.email}) to unlock all features.
        </span>
        <span className="sm:hidden">Verify your email to continue.</span>
      </span>
      <Button
        type="button"
        size="xs"
        variant="outline"
        onClick={handleResend}
        disabled={sending}
        className="border-amber-400/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20"
      >
        {sending ? "Sending…" : "Resend"}
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-amber-200/70 hover:opacity-80"
        aria-label="Dismiss verification banner"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
