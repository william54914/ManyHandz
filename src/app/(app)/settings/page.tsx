"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import { useHouseholds } from "@/lib/hooks/use-households";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdStore } from "@/lib/stores/household-store";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ACCENT_COLORS, getAccentColorByValue } from "@/lib/constants/colors";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  User,
  Users,
  Moon,
  PartyPopper,
  Fingerprint,
  Wallet,
  Home,
  Bell,
  ShieldAlert,
  LifeBuoy,
  Loader2,
  Camera,
  RefreshCw,
  Trash2,
  LogOut,
  Plus,
  Pencil,
  X,
  Send,
  Upload,
  Check,
  Bot,
  ChevronRight,
} from "lucide-react";

import type { Member, Household, NotificationPreferences, WebauthnCredential } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Timezones list (common US/international)
// ---------------------------------------------------------------------------
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const profileSchema = z.object({
  display_name: z.string().min(1, "Name is required").max(50),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
  birthday: z.string().optional(),
  favorite_color: z.string(),
});

const awaySchema = z.object({
  away_until: z.string().optional(),
  away_reason: z.string().max(200).optional(),
});

const paymentSchema = z.object({
  venmo_handle: z.string().max(30).optional(),
  paypal_handle: z.string().max(50).optional(),
  cashapp_handle: z.string().max(20).optional(),
  apple_cash_phone: z.string().max(20).optional(),
});

const householdSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  timezone: z.string(),
  require_photo_proof: z.boolean(),
  require_approval: z.boolean(),
  leaderboard_visible: z.boolean(),
  allow_kid_gifting: z.boolean(),
  allow_kid_challenges: z.boolean(),
  allow_kid_competitions: z.boolean(),
  max_kid_competition_stakes: z.number().min(0).max(10000),
  ai_verification_enabled: z.boolean(),
  ai_verification_provider: z.enum(["openai", "anthropic"]).nullable(),
  ai_auto_approve_threshold: z.number().min(0).max(100),
  ai_auto_reject_threshold: z.number().min(0).max(100),
  ai_monthly_cost_cap_cents: z.number().min(0).max(100000),
});

const feedbackSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AwayFormData = z.infer<typeof awaySchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;
type HouseholdFormData = z.infer<typeof householdSchema>;
type FeedbackFormData = z.infer<typeof feedbackSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ---------------------------------------------------------------------------
// Notification toggle keys
// ---------------------------------------------------------------------------
const NOTIFICATION_TOGGLES: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "daily_reminder", label: "Daily Reminder" },
  { key: "overdue_alerts", label: "Overdue Alerts" },
  { key: "chore_completed", label: "Chore Completed" },
  { key: "weekly_digest", label: "Weekly Digest" },
  { key: "reward_notifications", label: "Rewards" },
  { key: "goal_milestones", label: "Goal Milestones" },
  { key: "swap_requests", label: "Swap Requests" },
  { key: "announcements", label: "Announcements" },
  { key: "birthday_notifications", label: "Birthdays" },
  { key: "gift_received", label: "Gifts Received" },
  { key: "challenge_notifications", label: "Challenges" },
  { key: "competition_notifications", label: "Competitions" },
  { key: "ai_verification_notifications", label: "AI Verification" },
  { key: "weekly_report", label: "Weekly Report" },
  { key: "settlement_notifications", label: "Settlements" },
  { key: "comment_notifications", label: "Comments" },
  { key: "shopping_list_notifications", label: "Shopping List" },
];

// ===========================================================================
// Main Settings Page
// ===========================================================================
export default function SettingsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user, profile, signOut } = useAuth();
  const { mode, role, isAdmin, features, memberId, permissions } = useHouseholdMode();
  const { activeHousehold } = useHouseholds();
  const { currentMember, members } = useMembers();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isAwayEnabled, setIsAwayEnabled] = useState(false);

  // =========================================================================
  // Profile Form
  // =========================================================================
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      birthday: "",
      favorite_color: "#6366f1",
    },
  });

  useEffect(() => {
    if (currentMember) {
      profileForm.reset({
        display_name: currentMember.display_name,
        bio: currentMember.bio ?? "",
        birthday: currentMember.birthday ?? "",
        favorite_color: currentMember.favorite_color,
      });
      setIsAwayEnabled(
        !!currentMember.away_until && new Date(currentMember.away_until) > new Date()
      );
    }
  }, [currentMember, profileForm]);

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!memberId) throw new Error("No member context");
      const { error } = await supabase
        .from("members")
        .update({
          display_name: data.display_name,
          bio: data.bio || null,
          birthday: data.birthday || null,
          favorite_color: data.favorite_color,
        })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["current-member"] });
      queryClient.invalidateQueries({ queryKey: ["member-context"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update profile"),
  });

  // =========================================================================
  // Avatar Upload
  // =========================================================================
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user || !memberId) throw new Error("No user context");
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase
        .from("members")
        .update({ avatar_url: publicUrl })
        .eq("id", memberId);
      if (updateError) throw updateError;

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    },
    onSuccess: () => {
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["current-member"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to upload avatar"),
  });

  // =========================================================================
  // Away Mode
  // =========================================================================
  const awayForm = useForm<AwayFormData>({
    resolver: zodResolver(awaySchema),
    defaultValues: { away_until: "", away_reason: "" },
  });

  useEffect(() => {
    if (currentMember) {
      awayForm.reset({
        away_until: currentMember.away_until?.split("T")[0] ?? "",
        away_reason: currentMember.away_reason ?? "",
      });
    }
  }, [currentMember, awayForm]);

  const updateAway = useMutation({
    mutationFn: async (data: AwayFormData & { enabled: boolean }) => {
      if (!memberId) throw new Error("No member context");
      const { error } = await supabase
        .from("members")
        .update({
          away_until: data.enabled && data.away_until ? new Date(data.away_until).toISOString() : null,
          away_reason: data.enabled ? data.away_reason || null : null,
        })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Away status updated");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["current-member"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update away status"),
  });

  // =========================================================================
  // Celebration Mute
  // =========================================================================
  const updateMuteCelebrations = useMutation({
    mutationFn: async (muted: boolean) => {
      if (!memberId) throw new Error("No member context");
      const { error } = await supabase
        .from("members")
        .update({ mute_celebrations: muted })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Celebration preferences updated");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update"),
  });

  // =========================================================================
  // Passkeys / WebAuthn
  // =========================================================================
  const { data: passkeys = [], isLoading: passkeysLoading } = useQuery({
    queryKey: ["passkeys", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("webauthn_credentials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data || []) as WebauthnCredential[];
    },
    enabled: !!user,
  });

  const deletePasskey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webauthn_credentials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Passkey removed");
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
    onError: () => toast.error("Failed to remove passkey"),
  });

  const [renamingPasskey, setRenamingPasskey] = useState<string | null>(null);
  const [passkeyNewName, setPasskeyNewName] = useState("");

  const renamePasskey = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("webauthn_credentials")
        .update({ friendly_name: name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Passkey renamed");
      setRenamingPasskey(null);
      setPasskeyNewName("");
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
    onError: () => toast.error("Failed to rename passkey"),
  });

  async function handleAddPasskey() {
    try {
      const res = await fetch("/api/auth/webauthn/register-options", {
        method: "POST",
      });
      if (!res.ok) {
        toast.error("Failed to start passkey registration");
        return;
      }
      const options = await res.json();

      const { startRegistration } = await import("@simplewebauthn/browser");
      const credential = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!verifyRes.ok) {
        toast.error("Passkey registration failed");
        return;
      }

      toast.success("Passkey registered successfully");
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        toast.error("Passkey registration was cancelled");
      } else {
        toast.error("Failed to register passkey");
      }
    }
  }

  // =========================================================================
  // Payment Handles
  // =========================================================================
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      venmo_handle: "",
      paypal_handle: "",
      cashapp_handle: "",
      apple_cash_phone: "",
    },
  });

  useEffect(() => {
    if (currentMember) {
      paymentForm.reset({
        venmo_handle: currentMember.venmo_handle ?? "",
        paypal_handle: currentMember.paypal_handle ?? "",
        cashapp_handle: currentMember.cashapp_handle ?? "",
        apple_cash_phone: currentMember.apple_cash_phone ?? "",
      });
    }
  }, [currentMember, paymentForm]);

  const updatePayment = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (!memberId) throw new Error("No member context");
      const { error } = await supabase
        .from("members")
        .update({
          venmo_handle: data.venmo_handle || null,
          paypal_handle: data.paypal_handle || null,
          cashapp_handle: data.cashapp_handle || null,
          apple_cash_phone: data.apple_cash_phone || null,
        })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment handles updated");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update payment handles"),
  });

  // =========================================================================
  // Household Settings (Admin)
  // =========================================================================
  const householdForm = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      name: "",
      timezone: "America/New_York",
      require_photo_proof: false,
      require_approval: false,
      leaderboard_visible: true,
      allow_kid_gifting: true,
      allow_kid_challenges: true,
      allow_kid_competitions: true,
      max_kid_competition_stakes: 500,
      ai_verification_enabled: false,
      ai_verification_provider: null,
      ai_auto_approve_threshold: 80,
      ai_auto_reject_threshold: 20,
      ai_monthly_cost_cap_cents: 1000,
    },
  });

  useEffect(() => {
    if (activeHousehold) {
      const h = activeHousehold as unknown as Household;
      householdForm.reset({
        name: h.name,
        timezone: h.timezone,
        require_photo_proof: h.require_photo_proof,
        require_approval: h.require_approval,
        leaderboard_visible: h.leaderboard_visible,
        allow_kid_gifting: h.allow_kid_gifting,
        allow_kid_challenges: h.allow_kid_challenges,
        allow_kid_competitions: h.allow_kid_competitions,
        max_kid_competition_stakes: h.max_kid_competition_stakes,
        ai_verification_enabled: h.ai_verification_enabled,
        ai_verification_provider: h.ai_verification_provider,
        ai_auto_approve_threshold: h.ai_auto_approve_threshold,
        ai_auto_reject_threshold: h.ai_auto_reject_threshold,
        ai_monthly_cost_cap_cents: h.ai_monthly_cost_cap_cents,
      });
    }
  }, [activeHousehold, householdForm]);

  const updateHousehold = useMutation({
    mutationFn: async (data: HouseholdFormData) => {
      if (!householdId) throw new Error("No household context");
      const { error } = await supabase
        .from("households")
        .update({
          name: data.name,
          timezone: data.timezone,
          require_photo_proof: data.require_photo_proof,
          require_approval: data.require_approval,
          leaderboard_visible: data.leaderboard_visible,
          allow_kid_gifting: data.allow_kid_gifting,
          allow_kid_challenges: data.allow_kid_challenges,
          allow_kid_competitions: data.allow_kid_competitions,
          max_kid_competition_stakes: data.max_kid_competition_stakes,
          ai_verification_enabled: data.ai_verification_enabled,
          ai_verification_provider: data.ai_verification_provider,
          ai_auto_approve_threshold: data.ai_auto_approve_threshold,
          ai_auto_reject_threshold: data.ai_auto_reject_threshold,
          ai_monthly_cost_cap_cents: data.ai_monthly_cost_cap_cents,
        })
        .eq("id", householdId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Household settings updated");
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update household settings"),
  });

  const regenerateInviteCode = useMutation({
    mutationFn: async () => {
      if (!householdId) throw new Error("No household context");
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase
        .from("households")
        .update({ invite_code: newCode })
        .eq("id", householdId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invite code regenerated");
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
    onError: () => toast.error("Failed to regenerate invite code"),
  });

  // =========================================================================
  // Notification Preferences
  // =========================================================================
  const { data: notificationPrefs } = useQuery({
    queryKey: ["notification-preferences", memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("member_id", memberId)
        .single();
      return data as NotificationPreferences | null;
    },
    enabled: !!memberId,
  });

  const updateNotification = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      if (!memberId) throw new Error("No member context");
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ member_id: memberId, [key]: value }, { onConflict: "member_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => toast.error("Failed to update notification preference"),
  });

  // =========================================================================
  // Change Password
  // =========================================================================
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const changePassword = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      passwordForm.reset();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to change password"),
  });

  // =========================================================================
  // Delete Account
  // =========================================================================
  const deleteAccount = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
    },
    onSuccess: () => {
      toast.success("Account deleted");
      signOut();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete account"),
  });

  // =========================================================================
  // Feedback
  // =========================================================================
  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { subject: "", message: "" },
  });

  const [feedbackScreenshot, setFeedbackScreenshot] = useState<File | null>(null);

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      let screenshotUrl: string | null = null;
      if (feedbackScreenshot && user) {
        const ext = feedbackScreenshot.name.split(".").pop();
        const path = `feedback/${user.id}/${Date.now()}.${ext}`;
        await supabase.storage.from("feedback").upload(path, feedbackScreenshot);
        const { data: { publicUrl } } = supabase.storage.from("feedback").getPublicUrl(path);
        screenshotUrl = publicUrl;
      }

      const res = await fetch("/api/support/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, screenshotUrl }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
    },
    onSuccess: () => {
      toast.success("Feedback submitted, thank you!");
      feedbackForm.reset();
      setFeedbackScreenshot(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to submit feedback"),
  });

  // =========================================================================
  // Bio character count
  // =========================================================================
  const bioValue = profileForm.watch("bio") ?? "";

  // =========================================================================
  // Render Helpers
  // =========================================================================
  const household = activeHousehold as unknown as Household | undefined;
  const isFamily = mode === "family";
  const isRoommate = mode === "roommate";

  const initials = currentMember
    ? currentMember.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24 px-4">
      <div className="pt-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your account and preferences</p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {/* ================================================================
            PROFILE SECTION
        ================================================================ */}
        <AccordionItem value="profile" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <User className="size-5 text-[var(--accent-primary)]" />
              <span className="font-semibold">Profile</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="size-16">
                    <AvatarImage src={currentMember?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-lg font-semibold text-white bg-[var(--accent-primary)]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="size-5 text-white" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar.mutate(f);
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{currentMember?.display_name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Display Name</Label>
                <Input
                  {...profileForm.register("display_name")}
                  className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                />
                {profileForm.formState.errors.display_name && (
                  <p className="text-xs text-[var(--accent-danger)]">{profileForm.formState.errors.display_name.message}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Email</Label>
                <Input
                  value={user?.email ?? ""}
                  readOnly
                  className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>

              {/* Birthday */}
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Birthday</Label>
                <Input
                  type="date"
                  {...profileForm.register("birthday")}
                  className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--text-secondary)]">Bio</Label>
                  <span className={cn("text-xs", bioValue.length > 200 ? "text-[var(--accent-danger)]" : "text-[var(--text-muted)]")}>
                    {bioValue.length}/200
                  </span>
                </div>
                <Textarea
                  {...profileForm.register("bio")}
                  placeholder="Tell your household a bit about you..."
                  className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] resize-none h-20"
                  maxLength={200}
                />
              </div>

              {/* Favorite Color */}
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Favorite Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      className={cn(
                        "size-10 rounded-full border-2 transition-all",
                        profileForm.watch("favorite_color") === color.value
                          ? "border-white scale-110 ring-2 ring-white/30"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => profileForm.setValue("favorite_color", color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Timezone</Label>
                <Select
                  value={household?.timezone ?? "America/New_York"}
                  disabled
                >
                  <SelectTrigger className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--text-muted)]">Timezone is set at the household level</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Profile"}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            AWAY MODE
        ================================================================ */}
        <AccordionItem value="away" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <Moon className="size-5 text-amber-400" />
              <span className="font-semibold">Away Mode</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Enable Away Mode</p>
                  <p className="text-xs text-[var(--text-muted)]">Pause chore assignments while you're away</p>
                </div>
                <Switch
                  checked={isAwayEnabled}
                  onCheckedChange={(checked) => {
                    setIsAwayEnabled(checked);
                    if (!checked) {
                      updateAway.mutate({ enabled: false });
                    }
                  }}
                />
              </div>

              {isAwayEnabled && (
                <form
                  onSubmit={awayForm.handleSubmit((d) =>
                    updateAway.mutate({ ...d, enabled: true })
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">Away Until</Label>
                    <Input
                      type="date"
                      {...awayForm.register("away_until")}
                      className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">Reason (optional)</Label>
                    <Input
                      {...awayForm.register("away_reason")}
                      placeholder="Vacation, business trip..."
                      className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                    disabled={updateAway.isPending}
                  >
                    {updateAway.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                  </Button>
                </form>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            CELEBRATION PREFERENCES
        ================================================================ */}
        <AccordionItem value="celebrations" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <PartyPopper className="size-5 text-pink-400" />
              <span className="font-semibold">Celebrations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Mute Celebrations</p>
                <p className="text-xs text-[var(--text-muted)]">Disable confetti and celebration animations</p>
              </div>
              <Switch
                checked={currentMember?.mute_celebrations ?? false}
                onCheckedChange={(checked) => updateMuteCelebrations.mutate(checked)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            PASSKEYS / WEBAUTHN
        ================================================================ */}
        <AccordionItem value="passkeys" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <Fingerprint className="size-5 text-emerald-400" />
              <span className="font-semibold">Passkeys</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-muted)]">
                Use biometrics or security keys to sign in without a password.
              </p>

              {passkeysLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-[var(--text-muted)]" />
                </div>
              ) : passkeys.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] py-2">No passkeys registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {passkeys.map((pk) => (
                    <div
                      key={pk.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <Fingerprint className="size-4 text-[var(--text-muted)]" />
                        <div>
                          {renamingPasskey === pk.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={passkeyNewName}
                                onChange={(e) => setPasskeyNewName(e.target.value)}
                                className="h-7 w-40 text-sm border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    renamePasskey.mutate({ id: pk.id, name: passkeyNewName });
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => renamePasskey.mutate({ id: pk.id, name: passkeyNewName })}
                              >
                                <Check className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => setRenamingPasskey(null)}
                              >
                                <X className="size-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {pk.friendly_name || pk.device_type || "Passkey"}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                Added {new Date(pk.created_at).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {renamingPasskey !== pk.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            onClick={() => {
                              setRenamingPasskey(pk.id);
                              setPasskeyNewName(pk.friendly_name ?? "");
                            }}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-[var(--text-muted)] hover:text-red-400"
                            onClick={() => deletePasskey.mutate(pk.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={handleAddPasskey}
              >
                <Plus className="size-4" />
                Add Passkey
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            PAYMENT HANDLES
        ================================================================ */}
        {features.paymentHandles && (
          <AccordionItem value="payment" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
            <AccordionTrigger className="text-[var(--text-primary)]">
              <div className="flex items-center gap-3">
                <Wallet className="size-5 text-cyan-400" />
                <span className="font-semibold">Payment Handles</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={paymentForm.handleSubmit((d) => updatePayment.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Venmo</Label>
                  <Input
                    {...paymentForm.register("venmo_handle")}
                    placeholder="@username"
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">PayPal</Label>
                  <Input
                    {...paymentForm.register("paypal_handle")}
                    placeholder="paypal.me username"
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Cash App</Label>
                  <Input
                    {...paymentForm.register("cashapp_handle")}
                    placeholder="$cashtag"
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Apple Cash</Label>
                  <Input
                    {...paymentForm.register("apple_cash_phone")}
                    placeholder="Phone number"
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                  <p className="text-xs text-[var(--text-muted)]">Used for iMessage-based payments</p>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                  disabled={updatePayment.isPending}
                >
                  {updatePayment.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Payment Handles"}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ================================================================
            HOUSEHOLD SETTINGS (Admin Only)
        ================================================================ */}
        {isAdmin && household && (
          <AccordionItem value="household" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
            <AccordionTrigger className="text-[var(--text-primary)]">
              <div className="flex items-center gap-3">
                <Home className="size-5 text-violet-400" />
                <span className="font-semibold">Household</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={householdForm.handleSubmit((d) => updateHousehold.mutate(d))} className="space-y-5">
                {/* Household Name */}
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Household Name</Label>
                  <Input
                    {...householdForm.register("name")}
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                </div>

                {/* Mode Badge (read-only) */}
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--text-secondary)]">Mode</Label>
                  <Badge variant="outline" className="border-[var(--accent-primary)]/30 text-[var(--accent-primary)]">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Badge>
                </div>

                {/* Invite Code */}
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Invite Code</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={household.invite_code}
                      readOnly
                      className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono tracking-wider cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      onClick={() => regenerateInviteCode.mutate()}
                      disabled={regenerateInviteCode.isPending}
                    >
                      <RefreshCw className={cn("size-4", regenerateInviteCode.isPending && "animate-spin")} />
                    </Button>
                  </div>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Timezone</Label>
                  <Select
                    value={householdForm.watch("timezone")}
                    onValueChange={(v) => householdForm.setValue("timezone", v)}
                  >
                    <SelectTrigger className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo Proof */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Require Photo Proof</p>
                    <p className="text-xs text-[var(--text-muted)]">Members must upload photos when completing chores</p>
                  </div>
                  <Switch
                    checked={householdForm.watch("require_photo_proof")}
                    onCheckedChange={(v) => householdForm.setValue("require_photo_proof", v)}
                  />
                </div>

                {/* Family-only settings */}
                {isFamily && (
                  <>
                    <Separator className="bg-[var(--border-default)]" />
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Family Settings
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Require Approval</p>
                        <p className="text-xs text-[var(--text-muted)]">Parents must approve chore completions</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("require_approval")}
                        onCheckedChange={(v) => householdForm.setValue("require_approval", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Show Leaderboard</p>
                        <p className="text-xs text-[var(--text-muted)]">Display rankings and points leaderboard</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("leaderboard_visible")}
                        onCheckedChange={(v) => householdForm.setValue("leaderboard_visible", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Kid Gifting</p>
                        <p className="text-xs text-[var(--text-muted)]">Allow kids to gift points to each other</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("allow_kid_gifting")}
                        onCheckedChange={(v) => householdForm.setValue("allow_kid_gifting", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Kid Challenges</p>
                        <p className="text-xs text-[var(--text-muted)]">Allow kids to create bonus challenges</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("allow_kid_challenges")}
                        onCheckedChange={(v) => householdForm.setValue("allow_kid_challenges", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Kid Competitions</p>
                        <p className="text-xs text-[var(--text-muted)]">Allow kids to create head-to-head competitions</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("allow_kid_competitions")}
                        onCheckedChange={(v) => householdForm.setValue("allow_kid_competitions", v)}
                      />
                    </div>

                    {householdForm.watch("allow_kid_competitions") && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[var(--text-secondary)]">Max Competition Stakes</Label>
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {householdForm.watch("max_kid_competition_stakes")} pts
                          </span>
                        </div>
                        <Slider
                          value={[householdForm.watch("max_kid_competition_stakes")]}
                          onValueChange={([v]) => householdForm.setValue("max_kid_competition_stakes", v)}
                          min={0}
                          max={10000}
                          step={50}
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Roommate-only settings */}
                {isRoommate && (
                  <>
                    <Separator className="bg-[var(--border-default)]" />
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Roommate Settings
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Show Leaderboard</p>
                        <p className="text-xs text-[var(--text-muted)]">Display completion rankings</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("leaderboard_visible")}
                        onCheckedChange={(v) => householdForm.setValue("leaderboard_visible", v)}
                      />
                    </div>
                  </>
                )}

                {/* AI Verification */}
                {features.aiVerification && (
                  <>
                    <Separator className="bg-[var(--border-default)]" />
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                      <Bot className="size-3.5" />
                      AI Verification
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Enable AI Verification</p>
                        <p className="text-xs text-[var(--text-muted)]">Use AI to verify photo proof of chore completion</p>
                      </div>
                      <Switch
                        checked={householdForm.watch("ai_verification_enabled")}
                        onCheckedChange={(v) => householdForm.setValue("ai_verification_enabled", v)}
                      />
                    </div>

                    {householdForm.watch("ai_verification_enabled") && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-[var(--text-secondary)]">AI Provider</Label>
                          <Select
                            value={householdForm.watch("ai_verification_provider") ?? "openai"}
                            onValueChange={(v) =>
                              householdForm.setValue("ai_verification_provider", v as "openai" | "anthropic")
                            }
                          >
                            <SelectTrigger className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[var(--text-secondary)]">Auto-Approve Threshold</Label>
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {householdForm.watch("ai_auto_approve_threshold")}%
                            </span>
                          </div>
                          <Slider
                            value={[householdForm.watch("ai_auto_approve_threshold")]}
                            onValueChange={([v]) => householdForm.setValue("ai_auto_approve_threshold", v)}
                            min={50}
                            max={100}
                            step={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[var(--text-secondary)]">Auto-Reject Threshold</Label>
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {householdForm.watch("ai_auto_reject_threshold")}%
                            </span>
                          </div>
                          <Slider
                            value={[householdForm.watch("ai_auto_reject_threshold")]}
                            onValueChange={([v]) => householdForm.setValue("ai_auto_reject_threshold", v)}
                            min={0}
                            max={50}
                            step={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[var(--text-secondary)]">Monthly Cost Cap (cents)</Label>
                          <Input
                            type="number"
                            {...householdForm.register("ai_monthly_cost_cap_cents", { valueAsNumber: true })}
                            className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                          />
                          <p className="text-xs text-[var(--text-muted)]">
                            Max AI spend per month: ${(householdForm.watch("ai_monthly_cost_cap_cents") / 100).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                  disabled={updateHousehold.isPending}
                >
                  {updateHousehold.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Household Settings"}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ================================================================
            MEMBERS
        ================================================================ */}
        <Link
          href="/members"
          className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4 transition-colors hover:bg-[var(--bg-hover)]"
        >
          <Users className="size-5 text-blue-400" />
          <span className="font-semibold text-[var(--text-primary)]">Members</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m: Member) => (
                <Avatar key={m.id} className="size-6 border-2 border-[var(--bg-secondary)]">
                  <AvatarImage src={m.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {(m.display_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Badge variant="secondary" className="text-xs">{members.length}</Badge>
            <ChevronRight className="size-4 text-[var(--text-muted)]" />
          </div>
        </Link>

        {/* ================================================================
            NOTIFICATION PREFERENCES
        ================================================================ */}
        <AccordionItem value="notifications" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-yellow-400" />
              <span className="font-semibold">Notifications</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Push / Email toggles */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive push notifications on this device</p>
                </div>
                <Switch
                  checked={notificationPrefs?.push_enabled ?? true}
                  onCheckedChange={(v) => updateNotification.mutate({ key: "push_enabled", value: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive email digests and alerts</p>
                </div>
                <Switch
                  checked={notificationPrefs?.email_enabled ?? true}
                  onCheckedChange={(v) => updateNotification.mutate({ key: "email_enabled", value: v })}
                />
              </div>

              <Separator className="bg-[var(--border-default)]" />

              {/* Individual notification toggles */}
              {NOTIFICATION_TOGGLES.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-sm text-[var(--text-primary)]">{label}</p>
                  <Switch
                    checked={(notificationPrefs?.[key] as boolean) ?? true}
                    onCheckedChange={(v) => updateNotification.mutate({ key, value: v })}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            ACCOUNT
        ================================================================ */}
        <AccordionItem value="account" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-red-400" />
              <span className="font-semibold">Account</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Change Password */}
              <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">Change Password</p>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">New Password</Label>
                  <Input
                    type="password"
                    {...passwordForm.register("password")}
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-xs text-[var(--accent-danger)]">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">Confirm Password</Label>
                  <Input
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-[var(--accent-danger)]">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? <Loader2 className="size-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>

              <Separator className="bg-[var(--border-default)]" />

              {/* Sign Out */}
              <Button
                variant="outline"
                className="w-full gap-2 border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>

              <Separator className="bg-[var(--border-default)]" />

              {/* Delete Account */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-400">Danger Zone</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-[var(--border-default)] bg-[var(--bg-secondary)]">
                    <DialogHeader>
                      <DialogTitle className="text-red-400">Delete Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--text-secondary)]">
                        This will permanently delete your account and remove you from all households.
                        Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm.
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="border-red-500/30 bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={deleteConfirmText !== "DELETE" || deleteAccount.isPending}
                        onClick={() => deleteAccount.mutate()}
                      >
                        {deleteAccount.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Permanently Delete Account"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================================================================
            SUPPORT
        ================================================================ */}
        <AccordionItem value="support" className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6">
          <AccordionTrigger className="text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <LifeBuoy className="size-5 text-blue-400" />
              <span className="font-semibold">Support</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={feedbackForm.handleSubmit((d) => submitFeedback.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Subject</Label>
                <Select
                  value={feedbackForm.watch("subject")}
                  onValueChange={(v) => feedbackForm.setValue("subject", v)}
                >
                  <SelectTrigger className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="billing">Billing Issue</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {feedbackForm.formState.errors.subject && (
                  <p className="text-xs text-[var(--accent-danger)]">{feedbackForm.formState.errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Message</Label>
                <Textarea
                  {...feedbackForm.register("message")}
                  placeholder="Describe your issue or suggestion..."
                  className="border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] resize-none h-28"
                />
                {feedbackForm.formState.errors.message && (
                  <p className="text-xs text-[var(--accent-danger)]">{feedbackForm.formState.errors.message.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Screenshot (optional)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    onClick={() => document.getElementById("screenshot-input")?.click()}
                  >
                    <Upload className="size-4" />
                    Upload
                  </Button>
                  {feedbackScreenshot && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="truncate max-w-[150px]">{feedbackScreenshot.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-5"
                        onClick={() => setFeedbackScreenshot(null)}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  )}
                  <input
                    id="screenshot-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFeedbackScreenshot(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
