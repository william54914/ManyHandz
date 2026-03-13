"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Share2, UserPlus, QrCode } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface InviteModalProps {
  inviteCode: string;
  householdName: string;
  children?: React.ReactNode;
  className?: string;
}

export function InviteModal({ inviteCode, householdName, children, className }: InviteModalProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [open, setOpen] = useState(false);

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `/join/${inviteCode}`;

  async function copyToClipboard(text: string, type: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === "code" ? "Invite code copied!" : "Invite link copied!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${householdName} on ManyHandz`,
          text: `You've been invited to join "${householdName}" on ManyHandz! Use code: ${inviteCode}`,
          url: joinUrl,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      await copyToClipboard(joinUrl, "link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className={cn("gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white", className)}>
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-[var(--border-default)] bg-[var(--bg-secondary)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">Invite to {householdName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Invite Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-[var(--text-primary)]">
                {inviteCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={() => copyToClipboard(inviteCode, "code")}
              >
                {copied === "code" ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <Separator className="bg-[var(--border-default)]" />

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Share Link</label>
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
                onClick={() => copyToClipboard(joinUrl, "link")}
              >
                {copied === "link" ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <Separator className="bg-[var(--border-default)]" />

          {/* QR Code */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <QrCode className="size-4" />
              QR Code
            </label>
            <div className="flex justify-center rounded-lg border border-[var(--border-default)] bg-white p-4">
              <QRCodeSVG
                value={joinUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Share Button */}
          {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
            <Button
              variant="outline"
              className="w-full gap-2 border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              Share Invite
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
