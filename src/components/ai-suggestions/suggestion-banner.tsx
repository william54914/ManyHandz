"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionCard } from "./suggestion-card";
import { useHouseholdStore } from "@/lib/stores/household-store";

interface AiSuggestion {
  id: string;
  icon: string;
  title: string;
  description: string;
  action_label: string;
  action_type: string;
  action_data?: Record<string, unknown>;
  priority: "high" | "medium" | "low";
}

interface SuggestionBannerProps {
  maxVisible?: number;
  onAction?: (actionType: string, actionData?: Record<string, unknown>) => void;
  className?: string;
}

export function SuggestionBanner({
  maxVisible = 3,
  onAction,
  className,
}: SuggestionBannerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-suggestions", householdId],
    queryFn: async () => {
      if (!householdId) return null;
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdId }),
      });
      if (!response.ok) return null;
      return response.json() as Promise<{
        suggestions: AiSuggestion[];
        meta: Record<string, unknown>;
      }>;
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const suggestions =
    data?.suggestions?.filter((s) => !dismissed.has(s.id)) ?? [];
  const visibleSuggestions = suggestions.slice(0, maxVisible);
  const hasMore = suggestions.length > maxVisible;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-3 pt-0">
              <AnimatePresence mode="popLayout">
                {visibleSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    id={suggestion.id}
                    icon={suggestion.icon}
                    title={suggestion.title}
                    description={suggestion.description}
                    actionLabel={suggestion.action_label}
                    actionType={suggestion.action_type}
                    actionData={suggestion.action_data}
                    priority={suggestion.priority}
                    onAction={onAction}
                    onDismiss={handleDismiss}
                  />
                ))}
              </AnimatePresence>

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    See All ({suggestions.length})
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
