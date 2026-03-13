"use client";

import { cn } from "@/lib/utils/cn";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholds } from "@/lib/hooks/use-households";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MemberCard } from "@/components/members/member-card";
import { InviteModal } from "@/components/members/invite-modal";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useState } from "react";
import type { Household } from "@/lib/supabase/types";

export default function MembersPage() {
  const { members, isLoading } = useMembers();
  const { activeHousehold } = useHouseholds();
  const { permissions, features, mode } = useHouseholdMode();
  const [codeCopied, setCodeCopied] = useState(false);

  const household = activeHousehold as unknown as Household | undefined;
  const inviteCode = household?.invite_code ?? "";
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `/join/${inviteCode}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
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
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Members</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {members.length} {members.length === 1 ? "member" : "members"} in{" "}
            {household?.name ?? "your household"}
          </p>
        </div>
        {permissions.canInviteMembers && household && (
          <InviteModal
            inviteCode={inviteCode}
            householdName={household.name}
          />
        )}
      </div>

      {/* Member Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Invite Section */}
      {permissions.canInviteMembers && household && (
        <>
          <Separator className="bg-[var(--border-default)]" />

          <Card className="border-[var(--border-default)] bg-[var(--bg-secondary)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                <Users className="size-5 text-[var(--accent-primary)]" />
                Invite a Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invite Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  Invite Code
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-[var(--text-primary)]">
                    {inviteCode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    onClick={copyCode}
                  >
                    {codeCopied ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={joinUrl}
                    className="flex-1 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(joinUrl);
                        toast.success("Link copied!");
                      } catch {
                        toast.error("Failed to copy link");
                      }
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-lg border border-[var(--border-default)] bg-white p-4">
                  <QRCodeSVG value={joinUrl} size={160} level="M" />
                </div>
              </div>

              <p className="text-center text-xs text-[var(--text-muted)]">
                Share this code, link, or QR code with anyone you want to invite
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
