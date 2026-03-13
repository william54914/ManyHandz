"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
          setIsCheckingSession(false);
          return;
        }

        // Listen for auth state changes (the SDK may pick up the hash fragment)
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            setHasSession(true);
            setIsCheckingSession(false);
          }
        });
        subscription = data.subscription;

        // Give up after 10 seconds
        timeoutId = setTimeout(() => {
          subscription?.unsubscribe();
          subscription = null;
          setIsCheckingSession(false);
        }, 10000);
      } catch {
        setIsCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully");

      // Redirect to dashboard after a short delay (user already has an active session)
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
        <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--accent-success)]/10">
              <CheckCircle2 className="size-8 text-[var(--accent-success)]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
              Password updated
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Your password has been successfully reset. Redirecting you to
              login...
            </CardDescription>
          </CardHeader>

          <CardFooter className="justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
            >
              <ArrowLeft className="size-4" />
              Go to login now
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isCheckingSession && !hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
        <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-[var(--accent-primary)]" />
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Verifying your reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasSession && !isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
        <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
              Invalid or expired link
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              This password reset link is invalid or has expired. Please request
              a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link
              href="/forgot-password"
              className="flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
            >
              Request a new reset link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
      <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
            Set new password
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-secondary)]">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-[var(--accent-danger)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[var(--text-secondary)]"
              >
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-[var(--accent-danger)]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
