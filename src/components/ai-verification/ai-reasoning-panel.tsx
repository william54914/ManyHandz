"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Camera,
  Image as ImageIcon,
  Cpu,
  DollarSign,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AiVerification } from "@/lib/supabase/types";

interface AiReasoningPanelProps {
  verification: AiVerification;
  className?: string;
}

function ConfidenceGauge({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const rotation = (clamped / 100) * 180 - 90;

  let color: string;
  if (clamped >= 80) color = "#34d399";
  else if (clamped >= 50) color = "#fbbf24";
  else color = "#f87171";

  return (
    <div className="relative w-32 h-20 mx-auto">
      <svg viewBox="0 0 120 70" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 157} 157`}
          className="transition-all duration-700"
        />
        {/* Needle */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${rotation}, 60, 60)`}
          className="transition-all duration-700"
        />
        {/* Center dot */}
        <circle cx="60" cy="60" r="4" fill={color} />
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg font-bold" style={{ color }}>
        {clamped}%
      </div>
    </div>
  );
}

export function AiReasoningPanel({
  verification,
  className,
}: AiReasoningPanelProps) {
  const providerLabel =
    verification.provider === "openai" ? "OpenAI" : "Anthropic";

  return (
    <Card className={cn("border-muted/50", className)}>
      <CardContent className="space-y-4 pt-2">
        {/* Confidence Gauge */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
            <Target className="size-3" />
            Confidence Score
          </p>
          <ConfidenceGauge score={verification.confidence_score} />
        </div>

        <Separator />

        {/* Reasoning */}
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Brain className="size-3" />
            AI Reasoning
          </p>
          <p className="text-sm">{verification.reasoning}</p>
        </div>

        {/* Before Analysis */}
        {verification.before_analysis && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Camera className="size-3" />
              Before Photo Analysis
            </p>
            <p className="text-sm text-muted-foreground">
              {verification.before_analysis}
            </p>
          </div>
        )}

        {/* After Analysis */}
        {verification.after_analysis && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <ImageIcon className="size-3" />
              After Photo Analysis
            </p>
            <p className="text-sm text-muted-foreground">
              {verification.after_analysis}
            </p>
          </div>
        )}

        {/* Reference Comparison */}
        {verification.reference_comparison && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Target className="size-3" />
                Reference Match:{" "}
                <span className="font-semibold text-foreground">
                  {verification.reference_match_score}%
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {verification.reference_comparison}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Meta info */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Cpu className="size-3" />
            {providerLabel} / {verification.model}
          </span>
          {verification.cost_cents != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />
              {(verification.cost_cents / 100).toFixed(4)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
