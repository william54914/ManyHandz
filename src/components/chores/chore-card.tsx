"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckSquare,
  ChefHat,
  Bath,
  Sofa,
  BedDouble,
  Trees,
  Shirt,
  Dog,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";
import type { Chore, ChoreCategory } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Icon lookup for categories
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Kitchen: ChefHat,
  Bathroom: Bath,
  "Living Areas": Sofa,
  Bedroom: BedDouble,
  Outdoor: Trees,
  Laundry: Shirt,
  Pets: Dog,
  General: Home,
};

// ---------------------------------------------------------------------------
// Difficulty helpers
// ---------------------------------------------------------------------------

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Simple",
  3: "Medium",
  4: "Hard",
  5: "Expert",
};

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3",
            i < difficulty
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

function DifficultyText({ difficulty }: { difficulty: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {DIFFICULTY_LABELS[difficulty] ?? "Medium"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChoreCardProps {
  chore: Chore & { chore_categories?: ChoreCategory | null };
  onEdit?: (chore: Chore) => void;
  onDelete?: (choreId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChoreCard({ chore, onEdit, onDelete }: ChoreCardProps) {
  const { permissions, ui } = useHouseholdMode();

  const categoryName = chore.chore_categories?.name ?? "General";
  const CategoryIcon = CATEGORY_ICONS[categoryName] ?? Home;

  const checklist: Array<{ id: string; label: string }> = useMemo(() => {
    if (!chore.checklist) return [];
    if (Array.isArray(chore.checklist)) return chore.checklist as Array<{ id: string; label: string }>;
    try {
      return JSON.parse(chore.checklist as unknown as string);
    } catch {
      return [];
    }
  }, [chore.checklist]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/chores/${chore.id}`}>
        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <CategoryIcon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-tight">
                    {chore.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: chore.chore_categories?.color
                        ? `${chore.chore_categories.color}20`
                        : undefined,
                      color: chore.chore_categories?.color ?? undefined,
                    }}
                  >
                    {categoryName}
                  </Badge>
                </div>
              </div>

              {/* Action buttons */}
              {(permissions.canEditChores || permissions.canDeleteChores) && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {permissions.canEditChores && onEdit && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(chore);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  )}
                  {permissions.canDeleteChores && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(chore.id);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {chore.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {chore.description}
              </p>
            )}

            {/* Reference photo thumbnail */}
            {chore.reference_photo_url && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="size-3" />
                <span>Reference photo</span>
              </div>
            )}

            {/* Footer: difficulty + time + checklist count */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {ui.difficultyDisplay === "stars" ? (
                <DifficultyStars difficulty={chore.difficulty} />
              ) : (
                <DifficultyText difficulty={chore.difficulty} />
              )}
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span>{chore.estimated_minutes} min</span>
              </div>
              {checklist.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckSquare className="size-3" />
                  <span>{checklist.length} steps</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
