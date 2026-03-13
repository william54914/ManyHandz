"use client";

import { motion } from "framer-motion";
import {
  RefreshCw,
  TrendingUp,
  Users,
  Star,
  AlertTriangle,
  Zap,
  Target,
  Gift,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ElementType> = {
  RefreshCw,
  TrendingUp,
  Users,
  Star,
  AlertTriangle,
  Zap,
  Target,
  Gift,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

export interface SuggestionCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: string;
  actionData?: Record<string, unknown>;
  priority: "high" | "medium" | "low";
  onAction?: (actionType: string, actionData?: Record<string, unknown>) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function SuggestionCard({
  id,
  icon,
  title,
  description,
  actionLabel,
  actionType,
  actionData,
  priority,
  onAction,
  onDismiss,
  className,
}: SuggestionCardProps) {
  const IconComponent = ICON_MAP[icon] ?? Sparkles;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "border-l-4 relative overflow-hidden",
          PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low,
          className
        )}
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <IconComponent className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss(id)}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[10px] gap-1 text-muted-foreground"
            >
              <Sparkles className="size-2.5" />
              Powered by AI
            </Badge>
            {onAction && (
              <Button
                size="xs"
                onClick={() => onAction(actionType, actionData)}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
