"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { AiReasoningPanel } from "./ai-reasoning-panel";
import type { AiVerification } from "@/lib/supabase/types";

interface AiVerificationBadgeProps {
  verification: AiVerification;
  className?: string;
}

function getConfidenceColor(score: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (score >= 80) {
    return {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      label: "High Confidence",
    };
  }
  if (score >= 50) {
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      label: "Medium Confidence",
    };
  }
  return {
    bg: "bg-red-500/15",
    text: "text-red-400",
    label: "Low Confidence",
  };
}

function getDecisionBadge(decision: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
} {
  switch (decision) {
    case "auto_approved":
      return { variant: "default", label: "AI Approved" };
    case "flagged_for_review":
      return { variant: "secondary", label: "Needs Review" };
    case "auto_rejected":
      return { variant: "destructive", label: "AI Rejected" };
    default:
      return { variant: "outline", label: "Unknown" };
  }
}

export function AiVerificationBadge({
  verification,
  className,
}: AiVerificationBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const confidence = getConfidenceColor(verification.confidence_score);
  const decision = getDecisionBadge(verification.decision);

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors w-full",
          confidence.bg,
          "hover:opacity-80"
        )}
      >
        <Bot className={cn("size-4", confidence.text)} />
        <span className={cn("text-sm font-medium", confidence.text)}>
          {verification.confidence_score}%
        </span>
        <Badge variant={decision.variant} className="text-[10px] h-5">
          {decision.label}
        </Badge>
        <span className="flex-1" />
        {expanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <AiReasoningPanel verification={verification} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
