"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChoreCard } from "@/components/chores/chore-card";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";
import type { Chore, ChoreCategory } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChoreListProps {
  chores: Array<Chore & { chore_categories?: ChoreCategory | null }>;
  isLoading: boolean;
  onEdit?: (chore: Chore) => void;
  onDelete?: (choreId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChoreList({ chores, isLoading, onEdit, onDelete }: ChoreListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    let result = chores;

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description?.toLowerCase().includes(lower)
      );
    }

    if (category !== "all") {
      result = result.filter(
        (c) => c.chore_categories?.name === category
      );
    }

    return result;
  }, [chores, search, category]);

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SlidersHorizontal className="mr-2 size-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DEFAULT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No chores found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || category !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first chore to get started!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
