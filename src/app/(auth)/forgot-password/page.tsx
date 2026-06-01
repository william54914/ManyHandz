"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsEmailSent(true);
      toast.success("Password reset email sent");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="mb-8">
          <Image
            src="/logo-dark.png"
            alt="ManyHandz"
            width={280}
            height={87}
            className="h-16 w-auto"
            priority
          />
        </div>
        <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--accent-primary)]/10">
              <Mail className="size-8 text-[var(--accent-primary)]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
              Check your email
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              We sent a password reset link to{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {getValues("email")}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-sm text-[var(--text-muted)]">
              Didn&apos;t receive the email? Check your spam folder or try again
              with a different email address.
            </p>

            <Button
              variant="outline"
              size="lg"
              className="w-full border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={() => setIsEmailSent(false)}
            >
              Try again
            </Button>
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="mb-8">
        <Image
          src="/logo-dark.png"
          alt="ManyHandz"
          width={280}
          height={87}
          className="h-16 w-auto"
          priority
        />
      </div>
      <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
            Forgot your password?
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-secondary)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[var(--accent-danger)]">
                  {errors.email.message}
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
                "Send reset link"
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
