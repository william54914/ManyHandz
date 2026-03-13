"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  CalendarDays,
  Loader2,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useBundles, type BundleWithItems } from "@/lib/hooks/use-bundles";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function BundlesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Package className="size-6 text-primary" />
      </div>
      <div>
        <p className="font-medium">No chore bundles yet</p>
        <p className="text-sm text-muted-foreground">
          Create a bundle to group related chores together.
        </p>
      </div>
      <Button size="sm" asChild>
        <Link href="/bundles/new">
          <Plus className="mr-1 size-4" />
          Create Bundle
        </Link>
      </Button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Assign Bundle Dialog
// ---------------------------------------------------------------------------

function AssignBundleDialog({
  bundle,
  open,
  onOpenChange,
  members,
  onAssign,
  isPending,
}: {
  bundle: BundleWithItems | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  onAssign: (params: {
    bundleId: string;
    memberId: string;
    dueDate: string;
  }) => void;
  isPending: boolean;
}) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const handleAssign = () => {
    if (!bundle || !selectedMember || !dueDate) {
      toast.error("Please select a member and due date.");
      return;
    }
    onAssign({
      bundleId: bundle.id,
      memberId: selectedMember,
      dueDate: format(dueDate, "yyyy-MM-dd"),
    });
    onOpenChange(false);
    setSelectedMember("");
    setDueDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign &ldquo;{bundle?.name}&rdquo;
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to</label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <Users className="size-4 mr-2" />
                <SelectValue placeholder="Select a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        {m.avatar_url && (
                          <AvatarImage
                            src={m.avatar_url}
                            alt={m.display_name}
                          />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {m.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {m.display_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <CalendarDays className="size-4" />
                  {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {bundle && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                This will create {bundle.chore_bundle_items.length} assignment
                {bundle.chore_bundle_items.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <Button
            onClick={handleAssign}
            disabled={!selectedMember || !dueDate || isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Assign Bundle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Bundle Card
// ---------------------------------------------------------------------------

function BundleCard({
  bundle,
  onAssign,
}: {
  bundle: BundleWithItems;
  onAssign: (bundle: BundleWithItems) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const choreCount = bundle.chore_bundle_items.length;
  const totalMinutes = bundle.chore_bundle_items.reduce((sum, item) => {
    const chore = item.chores as Record<string, any>;
    return sum + (chore?.estimated_minutes ?? 0);
  }, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="space-y-3 pt-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {bundle.icon || "\uD83D\uDCE6"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{bundle.name}</h3>
              {bundle.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {bundle.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Layers className="size-3" />
              {choreCount} chore{choreCount !== 1 ? "s" : ""}
            </Badge>
            {totalMinutes > 0 && (
              <Badge variant="outline" className="text-[11px] gap-1">
                <Clock className="size-3" />
                {totalMinutes} min
              </Badge>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {expanded ? "Hide" : "Show"} chores
          </button>

          {/* Expanded chore list */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
                  {bundle.chore_bundle_items.map((item, idx) => {
                    const chore = item.chores as Record<string, any>;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-xs text-muted-foreground w-5 text-right">
                          {idx + 1}.
                        </span>
                        <span className="flex-1 truncate">
                          {chore?.name ?? "Unknown chore"}
                        </span>
                        {chore?.estimated_minutes && (
                          <span className="text-[11px] text-muted-foreground">
                            {chore.estimated_minutes}m
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Assign button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAssign(bundle)}
          >
            <Users className="size-3.5 mr-1.5" />
            Assign Bundle
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BundlesPage() {
  const { bundles, isLoading, assignBundle } = useBundles();
  const { members } = useMembers();
  const { permissions } = useHouseholdMode();
  const [assignDialogBundle, setAssignDialogBundle] =
    useState<BundleWithItems | null>(null);

  const canCreate =
    permissions?.canEditHouseholdSettings || permissions?.canCreateChores;

  const handleAssign = (params: {
    bundleId: string;
    memberId: string;
    dueDate: string;
  }) => {
    assignBundle.mutate(params);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chore Bundles</h1>
          <p className="text-sm text-muted-foreground">
            Groups of chores that can be assigned together
          </p>
        </div>
        {canCreate && (
          <Button size="sm" asChild>
            <Link href="/bundles/new">
              <Plus className="mr-1 size-4" />
              New Bundle
            </Link>
          </Button>
        )}
      </div>

      {/* Bundle Grid */}
      {isLoading ? (
        <BundlesSkeleton />
      ) : bundles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {bundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onAssign={setAssignDialogBundle}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Assign Dialog */}
      <AssignBundleDialog
        bundle={assignDialogBundle}
        open={!!assignDialogBundle}
        onOpenChange={(open) => {
          if (!open) setAssignDialogBundle(null);
        }}
        members={members}
        onAssign={handleAssign}
        isPending={assignBundle.isPending}
      />
    </div>
  );
}
