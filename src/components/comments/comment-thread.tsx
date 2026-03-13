"use client";

import { useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import { useComments } from "@/lib/hooks/use-comments";
import { useMembers } from "@/lib/hooks/use-members";
import { CommentInput } from "./comment-input";
import type { CommentWithMember } from "@/lib/hooks/use-comments";

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface CommentBubbleProps {
  comment: CommentWithMember;
}

function CommentBubble({ comment }: CommentBubbleProps) {
  const member = comment.member;
  const displayName = member?.display_name || "Unknown";
  const avatarUrl = member?.avatar_url || null;

  return (
    <div className="flex gap-3 py-2">
      <Avatar size="sm" className="shrink-0 mt-0.5">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>{getMemberInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

interface CommentThreadProps {
  assignmentId: string;
}

export function CommentThread({ assignmentId }: CommentThreadProps) {
  const { comments, isLoading, addComment } = useComments(assignmentId);
  const { currentMember } = useMembers();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  function handleSubmit(body: string) {
    if (!currentMember) return;
    addComment.mutate({ memberId: currentMember.id, body });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          Comments
          {comments.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Start the conversation!
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="max-h-80 overflow-y-auto space-y-0.5 divide-y divide-border/50"
          >
            {comments.map((comment) => (
              <CommentBubble key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        <Separator />

        {/* Input */}
        <CommentInput
          onSubmit={handleSubmit}
          disabled={addComment.isPending || !currentMember}
        />
      </CardContent>
    </Card>
  );
}
