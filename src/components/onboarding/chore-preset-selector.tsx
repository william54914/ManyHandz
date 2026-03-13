"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CHORE_TEMPLATES_BY_CATEGORY,
  type ChoreTemplate,
} from "@/lib/constants/chore-templates";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChorePresetSelectorProps {
  onSubmit: (selectedTemplates: ChoreTemplate[]) => void;
  onSkip: () => void;
  isSubmitting: boolean;
  /** Hide the skip button (e.g. on the dashboard where there's nothing to skip to). */
  showSkip?: boolean;
}

// ---------------------------------------------------------------------------
// Difficulty dots
// ---------------------------------------------------------------------------

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "size-1.5 rounded-full",
            i < level ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chore card (selectable)
// ---------------------------------------------------------------------------

function ChorePresetCard({
  template,
  isSelected,
  onToggle,
}: {
  template: ChoreTemplate;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <div
            className={cn(
              "flex size-5 items-center justify-center rounded border transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {isSelected && <Check className="size-3" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {template.name}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {template.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <DifficultyDots level={template.difficulty} />
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{template.estimatedMinutes}m</span>
            </div>
            {template.checklist.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
                <span>{template.checklist.length} steps</span>
              </button>
            )}
          </div>

          {/* Expandable checklist */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="mt-2 space-y-1 border-t border-border pt-2">
                  {template.checklist.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="text-primary/60 mt-px">&#8226;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category section
// ---------------------------------------------------------------------------

function CategorySection({
  categoryName,
  templates,
  selectedNames,
  onToggleTemplate,
  onToggleAll,
  color,
  searchQuery,
}: {
  categoryName: string;
  templates: ChoreTemplate[];
  selectedNames: Set<string>;
  onToggleTemplate: (name: string) => void;
  onToggleAll: (categoryName: string, select: boolean) => void;
  color: string;
  searchQuery: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  if (filteredTemplates.length === 0) return null;

  const selectedCount = filteredTemplates.filter((t) =>
    selectedNames.has(t.name)
  ).length;
  const allSelected = selectedCount === filteredTemplates.length;

  return (
    <div className="space-y-2">
      {/* Category header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 flex-1 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <div
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-foreground">
            {categoryName}
          </span>
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0 h-5"
          >
            {filteredTemplates.length}
          </Badge>
        </button>

        {/* Select all */}
        <button
          type="button"
          className={cn(
            "text-xs transition-colors",
            allSelected
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onToggleAll(categoryName, !allSelected)}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Template grid */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
              {filteredTemplates.map((template) => (
                <ChorePresetCard
                  key={template.name}
                  template={template}
                  isSelected={selectedNames.has(template.name)}
                  onToggle={() => onToggleTemplate(template.name)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChorePresetSelector({
  onSubmit,
  onSkip,
  isSubmitting,
  showSkip = true,
}: ChorePresetSelectorProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Category color lookup
  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of DEFAULT_CATEGORIES) {
      map[cat.name] = cat.color;
    }
    return map;
  }, []);

  // Category order
  const categoryOrder = useMemo(
    () => Object.keys(CHORE_TEMPLATES_BY_CATEGORY),
    []
  );

  function toggleTemplate(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function toggleAllInCategory(categoryName: string, select: boolean) {
    const templates = CHORE_TEMPLATES_BY_CATEGORY[categoryName] || [];
    setSelectedNames((prev) => {
      const next = new Set(prev);
      for (const t of templates) {
        if (select) {
          next.add(t.name);
        } else {
          next.delete(t.name);
        }
      }
      return next;
    });
  }

  function selectAllCategories() {
    const all = new Set<string>();
    for (const templates of Object.values(CHORE_TEMPLATES_BY_CATEGORY)) {
      for (const t of templates) {
        all.add(t.name);
      }
    }
    setSelectedNames(all);
  }

  function handleSubmit() {
    const selected: ChoreTemplate[] = [];
    for (const templates of Object.values(CHORE_TEMPLATES_BY_CATEGORY)) {
      for (const t of templates) {
        if (selectedNames.has(t.name)) {
          selected.push(t);
        }
      }
    }
    onSubmit(selected);
  }

  return (
    <Card className="border-border mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-5 text-primary" />
          <CardTitle>Set Up Your Chores</CardTitle>
        </div>
        <CardDescription>
          Pick the chores your household handles. Each comes with built-in
          checklist steps. You can always add, edit, or remove them later.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search + select all */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search chores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllCategories}
            className="shrink-0"
          >
            Select All
          </Button>
        </div>

        {/* Category sections */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {categoryOrder.map((catName) => (
            <CategorySection
              key={catName}
              categoryName={catName}
              templates={CHORE_TEMPLATES_BY_CATEGORY[catName]}
              selectedNames={selectedNames}
              onToggleTemplate={toggleTemplate}
              onToggleAll={toggleAllInCategory}
              color={categoryColors[catName] || "#6b7280"}
              searchQuery={searchQuery}
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {selectedNames.size}
            </span>{" "}
            {selectedNames.size === 1 ? "chore" : "chores"} selected
          </p>
          <div className="flex gap-2">
            {showSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedNames.size === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Adding chores...
                </>
              ) : (
                `Add ${selectedNames.size} ${selectedNames.size === 1 ? "Chore" : "Chores"}`
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
