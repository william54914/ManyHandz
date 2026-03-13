"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder } from "framer-motion";
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBundles } from "@/lib/hooks/use-bundles";
import { useChores } from "@/lib/hooks/use-chores";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

// ---------------------------------------------------------------------------
// Emoji picker (simple subset)
// ---------------------------------------------------------------------------

const BUNDLE_ICONS = [
  "\uD83D\uDCE6",
  "\uD83E\uDDF9",
  "\uD83C\uDFE0",
  "\uD83C\uDF1F",
  "\u2728",
  "\uD83D\uDE80",
  "\uD83C\uDF3F",
  "\uD83D\uDD25",
  "\uD83C\uDFAF",
  "\uD83E\uDDFD",
  "\uD83D\uDED2",
  "\uD83C\uDF73",
] as const;

// ---------------------------------------------------------------------------
// Selected chore item (drag-reorderable)
// ---------------------------------------------------------------------------

interface SelectedChore {
  id: string;
  name: string;
  estimated_minutes: number;
  icon: string;
}

function SelectedChoreItem({
  chore,
  index,
  onRemove,
}: {
  chore: SelectedChore;
  index: number;
  onRemove: (id: string) => void;
}) {
  return (
    <Reorder.Item
      value={chore}
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="size-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-shrink-0 text-muted-foreground w-5 text-right">
        {index + 1}.
      </span>
      <span className="mr-1">{chore.icon}</span>
      <span className="text-sm flex-1 truncate">{chore.name}</span>
      {chore.estimated_minutes > 0 && (
        <Badge variant="outline" className="text-[10px] gap-0.5 flex-shrink-0">
          <Clock className="size-2.5" />
          {chore.estimated_minutes}m
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 flex-shrink-0"
        onClick={() => onRemove(chore.id)}
      >
        <Trash2 className="size-3 text-muted-foreground" />
      </Button>
    </Reorder.Item>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function NewBundlePage() {
  const router = useRouter();
  const { createBundle } = useBundles();
  const { chores, isLoading: choresLoading } = useChores();
  const { memberId } = useHouseholdMode();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>(BUNDLE_ICONS[0]);
  const [selectedChores, setSelectedChores] = useState<SelectedChore[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ---- Filter available chores ----
  const selectedIds = new Set(selectedChores.map((c) => c.id));

  const availableChores = chores
    .filter((c: any) => !selectedIds.has(c.id))
    .filter((c: any) =>
      searchQuery
        ? c.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  // ---- Handlers ----
  const handleAddChore = useCallback(
    (chore: any) => {
      setSelectedChores((prev) => [
        ...prev,
        {
          id: chore.id,
          name: chore.name,
          estimated_minutes: chore.estimated_minutes ?? 0,
          icon: chore.icon ?? "\uD83D\uDCCB",
        },
      ]);
      setSearchQuery("");
    },
    []
  );

  const handleRemoveChore = useCallback((id: string) => {
    setSelectedChores((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a bundle name.");
      return;
    }
    if (selectedChores.length === 0) {
      toast.error("Please add at least one chore.");
      return;
    }
    if (!memberId) {
      toast.error("Unable to determine your member ID.");
      return;
    }

    createBundle.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        choreIds: selectedChores.map((c) => c.id),
        created_by: memberId,
      },
      {
        onSuccess: () => {
          router.push("/bundles");
        },
      }
    );
  };

  const totalMinutes = selectedChores.reduce(
    (sum, c) => sum + c.estimated_minutes,
    0
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Bundle</h1>
          <p className="text-sm text-muted-foreground">
            Group chores that go together
          </p>
        </div>
      </div>

      {/* Bundle Info */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          {/* Icon selector */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {BUNDLE_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border text-lg transition-colors",
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="bundle-name">Bundle Name</Label>
            <Input
              id="bundle-name"
              placeholder='e.g., "Kitchen Deep Clean"'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="bundle-description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="bundle-description"
              placeholder="What is this bundle for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Selected Chores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Chores in Bundle ({selectedChores.length})
            </h2>
            {totalMinutes > 0 && (
              <p className="text-xs text-muted-foreground">
                Total estimated time: {totalMinutes} min
              </p>
            )}
          </div>
        </div>

        {selectedChores.length === 0 ? (
          <div className="rounded-xl border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Search and add chores below
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={selectedChores}
            onReorder={setSelectedChores}
            className="space-y-2"
          >
            {selectedChores.map((chore, index) => (
              <SelectedChoreItem
                key={chore.id}
                chore={chore}
                index={index}
                onRemove={handleRemoveChore}
              />
            ))}
          </Reorder.Group>
        )}
      </div>

      <Separator />

      {/* Chore Search & Add */}
      <div className="space-y-3">
        <h2 className="font-semibold">Add Chores</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search chores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {choresLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : availableChores.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {searchQuery
              ? "No matching chores found."
              : "All chores have been added."}
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-lg border p-2">
            {availableChores.map((chore: any) => (
              <button
                key={chore.id}
                onClick={() => handleAddChore(chore)}
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
              >
                <span>{chore.icon ?? "\uD83D\uDCCB"}</span>
                <span className="flex-1 truncate">{chore.name}</span>
                {chore.estimated_minutes > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {chore.estimated_minutes}m
                  </span>
                )}
                <Plus className="size-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <motion.div
        className="sticky bottom-20 sm:bottom-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          onClick={handleSave}
          disabled={
            !name.trim() ||
            selectedChores.length === 0 ||
            createBundle.isPending
          }
          className="w-full"
          size="lg"
        >
          {createBundle.isPending ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Package className="size-4 mr-2" />
          )}
          Create Bundle ({selectedChores.length} chore
          {selectedChores.length !== 1 ? "s" : ""})
        </Button>
      </motion.div>
    </div>
  );
}
