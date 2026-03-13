"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { useShopping } from "@/lib/hooks/use-shopping";
import { useMembers } from "@/lib/hooks/use-members";
import { ShoppingListView } from "@/components/shopping/shopping-list";

export default function ShoppingPage() {
  const { lists, listsLoading, createList, archiveList } = useShopping();
  const { currentMember, isLoading: membersLoading } = useMembers();

  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Auto-select first list
  const effectiveListId = activeListId || (lists.length > 0 ? lists[0].id : null);
  const activeList = lists.find((l) => l.id === effectiveListId);

  function handleCreateList() {
    if (!newListName.trim() || !currentMember) return;
    createList.mutate(
      {
        name: newListName.trim(),
        createdBy: currentMember.id,
      },
      {
        onSuccess: (data) => {
          setActiveListId(data.id);
          setCreateOpen(false);
          setNewListName("");
        },
      }
    );
  }

  function handleArchiveList() {
    if (!effectiveListId) return;
    archiveList.mutate(effectiveListId, {
      onSuccess: () => {
        setActiveListId(null);
      },
    });
  }

  if (listsLoading || membersLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Shopping Lists</h1>
        </div>
        <div className="flex items-center gap-2">
          {effectiveListId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchiveList}
              disabled={archiveList.isPending}
              className="text-muted-foreground"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive List
            </Button>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>New Shopping List</DialogTitle>
                <DialogDescription>
                  Create a new shopping list for your household.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    placeholder="e.g. Weekly Groceries"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateList();
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || createList.isPending}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lists as tabs */}
      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold text-muted-foreground">
            No Shopping Lists
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first shopping list to get started.
          </p>
        </div>
      ) : lists.length === 1 ? (
        // Single list - no tabs needed
        <ShoppingListView
          listId={lists[0].id}
          listName={lists[0].name}
        />
      ) : (
        // Multiple lists - show tabs
        <Tabs
          value={effectiveListId || undefined}
          onValueChange={(v) => setActiveListId(v)}
        >
          <TabsList className="w-full overflow-x-auto">
            {lists.map((list) => (
              <TabsTrigger key={list.id} value={list.id} className="gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{list.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {lists.map((list) => (
            <TabsContent key={list.id} value={list.id}>
              <ShoppingListView listId={list.id} listName={list.name} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
