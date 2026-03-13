"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApprovalQueue } from "@/components/assignments/approval-queue";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

export default function ApprovalsPage() {
  const router = useRouter();
  const { isAdmin } = useHouseholdMode();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <ShieldOff className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Only parents and admins can access the approval queue.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-24 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Approval Queue</h1>
        </div>
      </div>

      {/* Approval queue component */}
      <ApprovalQueue />
    </div>
  );
}
