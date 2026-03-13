"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  CheckSquare,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHORE_TEMPLATES,
  CHORE_TEMPLATES_BY_CATEGORY,
  type ChoreTemplate,
} from "@/lib/constants/chore-templates";
import { getCategoryColor } from "@/lib/constants/categories";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChoreTemplatesProps {
  onUseTemplate: (template: ChoreTemplate) => void;
}

// ---------------------------------------------------------------------------
// Template Card
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onUse,
}: {
  template: ChoreTemplate;
  onUse: () => void;
}) {
  const categoryColor = getCategoryColor(template.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium leading-tight">{template.name}</p>
              <Badge
                variant="secondary"
                className="mt-1 text-[10px] px-1.5 py-0"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                {template.category}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">
            {template.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    i < template.difficulty
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{template.estimatedMinutes} min</span>
            </div>
            {template.checklist.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="size-3" />
                <span>{template.checklist.length}</span>
              </div>
            )}
          </div>

          {/* Checklist preview */}
          {template.checklist.length > 0 && (
            <div className="space-y-1 rounded-md bg-muted/50 p-2">
              {template.checklist.slice(0, 3).map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                >
                  <span className="mt-0.5 size-3 shrink-0 rounded-sm border border-muted-foreground/30" />
                  <span className="line-clamp-1">{step}</span>
                </div>
              ))}
              {template.checklist.length > 3 && (
                <p className="text-[10px] text-muted-foreground/60">
                  +{template.checklist.length - 3} more steps
                </p>
              )}
            </div>
          )}

          {/* Use Template Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onUse}
            className="mt-auto gap-1"
          >
            Use Template
            <ChevronRight className="size-3" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChoreTemplates({ onUseTemplate }: ChoreTemplatesProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.keys(CHORE_TEMPLATES_BY_CATEGORY);

  const filtered = useMemo(() => {
    let result = activeCategory
      ? CHORE_TEMPLATES_BY_CATEGORY[activeCategory] ?? []
      : CHORE_TEMPLATES;

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [search, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="xs"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="xs"
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((template) => (
              <TemplateCard
                key={`${template.category}-${template.name}`}
                template={template}
                onUse={() => onUseTemplate(template)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
