"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const MAX_CHARS = 500;

interface CommentInputProps {
  onSubmit: (body: string) => void;
  disabled?: boolean;
}

export function CommentInput({ onSubmit, disabled }: CommentInputProps) {
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = body.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = body.trim().length > 0 && !isOverLimit && !disabled;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(body.trim());
    setBody("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="shrink-0 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
