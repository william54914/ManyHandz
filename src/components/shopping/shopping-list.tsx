"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { useShoppingItems } from "@/lib/hooks/use-shopping";
import { useMembers } from "@/lib/hooks/use-members";
import { AddItemInput } from "./add-item-input";
import { ShoppingItemRow } from "./shopping-item";
import type { ShoppingItemCategory, Member } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Category order and labels
// ---------------------------------------------------------------------------
const CATEGORY_ORDER: ShoppingItemCategory[] = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "frozen",
  "pantry",
  "beverages",
  "snacks",
  "cleaning",
  "household",
  "personal",
  "pets",
  "other",
];

const CATEGORY_LABELS: Record<ShoppingItemCategory, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat",
  bakery: "Bakery",
  frozen: "Frozen",
  pantry: "Pantry",
  beverages: "Beverages",
  snacks: "Snacks",
  cleaning: "Cleaning",
  household: "Household",
  personal: "Personal",
  pets: "Pets",
  other: "Other",
};

interface ShoppingListViewProps {
  listId: string;
  listName: string;
}

export function ShoppingListView({ listId, listName }: ShoppingListViewProps) {
  const { items, itemsLoading, addItem, toggleItem, deleteItem, clearChecked } =
    useShoppingItems(listId);
  const { members, currentMember } = useMembers();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  // Split into unchecked and checked
  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  // Group unchecked by category
  const grouped = useMemo(() => {
    const map = new Map<ShoppingItemCategory, typeof unchecked>();
    for (const item of unchecked) {
      const cat = item.category || "other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    // Sort by category order
    const sorted: Array<{
      category: ShoppingItemCategory;
      items: typeof unchecked;
    }> = [];
    for (const cat of CATEGORY_ORDER) {
      if (map.has(cat)) {
        sorted.push({ category: cat, items: map.get(cat)! });
      }
    }
    return sorted;
  }, [unchecked]);

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function handleAdd(params: {
    name: string;
    quantity?: string;
    category?: ShoppingItemCategory;
    assignedTo?: string;
  }) {
    if (!currentMember) return;
    addItem.mutate({
      name: params.name,
      quantity: params.quantity,
      category: params.category,
      assignedTo: params.assignedTo,
      addedBy: currentMember.id,
    });
  }

  function handleToggle(itemId: string, isChecked: boolean) {
    if (!currentMember) return;
    toggleItem.mutate({
      itemId,
      checked: isChecked,
      memberId: currentMember.id,
    });
  }

  function handleDelete(itemId: string) {
    deleteItem.mutate(itemId);
  }

  const totalCount = items.length;
  const checkedCount = checked.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            {listName}
            <Badge variant="outline" className="text-xs">
              {checkedCount}/{totalCount}
            </Badge>
          </CardTitle>
          {checkedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => clearChecked.mutate()}
              disabled={clearChecked.isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Checked
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick add */}
        <AddItemInput
          onAdd={handleAdd}
          members={members}
          disabled={addItem.isPending}
        />

        {/* Category-grouped unchecked items */}
        {grouped.length === 0 && checked.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No items yet. Add something above!
          </div>
        )}

        {grouped.map(({ category, items: catItems }) => {
          const isCollapsed = collapsedCategories.has(category);
          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors w-full text-left"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {CATEGORY_LABELS[category]}
                <Badge variant="secondary" className="text-xs ml-1">
                  {catItems.length}
                </Badge>
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {catItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      memberMap={memberMap}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Checked items at bottom */}
        {checked.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Checked ({checked.length})
              </p>
              <div className="space-y-0.5">
                {checked.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    memberMap={memberMap}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
