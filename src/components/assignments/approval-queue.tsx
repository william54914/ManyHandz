"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdStore } from "@/lib/stores/household-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Clock, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeDate } from "@/lib/utils/format";
import { AiVerificationBadge } from "@/components/ai-verification/ai-verification-badge";
import type { AiVerification } from "@/lib/supabase/types";
import { useState } from "react";

export function ApprovalQueue() {
  const supabase = createClient();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({
    queryKey: ["current-approver", householdId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !householdId) return null;
      const { data } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .eq("household_id", householdId)
        .single();
      return data;
    },
    enabled: !!householdId,
  });

  const { data: pendingCompletions = [], isLoading } = useQuery({
    queryKey: ["approval-queue", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data } = await supabase
        .from("completions")
        .select(
          "*, assignments(*, chores(*)), completed_by_member:members!completed_by(*), ai_verifications(*)"
        )
        .eq("status", "pending_approval")
        .eq("needs_approval", true)
        .order("completed_at", { ascending: true });

      // Filter by household through assignments
      return (data || []).filter(
        (c: Record<string, unknown>) =>
          (c.assignments as Record<string, unknown>)?.household_id === householdId
      );
    },
    enabled: !!householdId,
  });

  const approve = useMutation({
    mutationFn: async ({
      completionId,
      memberId,
      assignmentId,
    }: {
      completionId: string;
      memberId: string;
      assignmentId: string;
    }) => {
      const { error } = await supabase
        .from("completions")
        .update({
          status: "approved",
          approved_by: memberId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", completionId);
      if (error) throw error;

      // Also update the assignment status to "completed"
      const { error: assignError } = await supabase
        .from("assignments")
        .update({ status: "completed" })
        .eq("id", assignmentId);
      if (assignError) throw assignError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Approved!");
    },
    onError: (e) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async ({
      completionId,
      reason,
      assignmentId,
    }: {
      completionId: string;
      reason: string;
      assignmentId: string;
    }) => {
      const { error: compError } = await supabase
        .from("completions")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", completionId);
      if (compError) throw compError;

      const { error: assignError } = await supabase
        .from("assignments")
        .update({ status: "in_progress" })
        .eq("id", assignmentId);
      if (assignError) throw assignError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Rejected with feedback");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pendingCompletions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Check className="h-10 w-10 text-emerald-500 mb-3" />
          <p className="font-medium">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">
            No completions waiting for review
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-amber-500" />
          Approval Queue
          <Badge variant="secondary" className="ml-auto">
            {pendingCompletions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingCompletions.map((completion: Record<string, unknown>) => (
          <ApprovalItem
            key={completion.id as string}
            completion={completion}
            onApprove={() =>
              approve.mutate({
                completionId: completion.id as string,
                memberId: currentUser?.id ?? "",
                assignmentId: (
                  completion.assignments as Record<string, unknown>
                )?.id as string,
              })
            }
            onReject={(reason: string) =>
              reject.mutate({
                completionId: completion.id as string,
                reason,
                assignmentId: (
                  completion.assignments as Record<string, unknown>
                )?.id as string,
              })
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ApprovalItem({
  completion,
  onApprove,
  onReject,
}: {
  completion: Record<string, unknown>;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const member = completion.completed_by_member as Record<string, unknown>;
  const assignment = completion.assignments as Record<string, unknown>;
  const chore = assignment?.chores as Record<string, unknown>;

  return (
    <div className="rounded-xl bg-[var(--bg-tertiary)] p-3 space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member?.avatar_url as string} />
          <AvatarFallback className="text-xs">
            {((member?.display_name as string) || "?")[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {member?.display_name as string} completed{" "}
            <span className="text-[var(--accent-primary)]">
              {chore?.name as string}
            </span>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatRelativeDate(completion.completed_at as string)}
          </p>
        </div>
      </div>

      {(completion.before_photo_url || completion.after_photo_url) ? (
        <div className="flex gap-2">
          {completion.before_photo_url ? (
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <ImageIcon className="h-3 w-3" />
              Before
            </div>
          ) : null}
          {completion.after_photo_url ? (
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <ImageIcon className="h-3 w-3" />
              After
            </div>
          ) : null}
        </div>
      ) : null}

      {completion.notes ? (
        <p className="text-xs text-[var(--text-secondary)] italic">
          &ldquo;{String(completion.notes)}&rdquo;
        </p>
      ) : null}

      {completion.ai_verifications ? (
        <AiVerificationBadge
          verification={completion.ai_verifications as unknown as AiVerification}
        />
      ) : null}

      {showReject ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="text-sm"
            maxLength={300}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onReject(rejectReason);
                setShowReject(false);
                setRejectReason("");
              }}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReject(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-[var(--accent-success)] hover:bg-[var(--accent-success)]/80"
            onClick={() => onApprove()}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setShowReject(true)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
