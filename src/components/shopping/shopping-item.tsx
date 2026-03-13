"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { ShoppingItem as ShoppingItemType, Member } from "@/lib/supabase/types";

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ShoppingItemProps {
  item: ShoppingItemType;
  memberMap: Record<string, Member>;
  onToggle: (itemId: string, checked: boolean) => void;
  onDelete: (itemId: string) => void;
}

export function ShoppingItemRow({
  item,
  memberMap,
  onToggle,
  onDelete,
}: ShoppingItemProps) {
  const [expanded, setExpanded] = useState(false);

  const assignedMember = item.assigned_to
    ? memberMap[item.assigned_to]
    : null;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-2.5 transition-all",
        item.is_checked
          ? "bg-muted/30 opacity-60"
          : "hover:bg-muted/50"
      )}
    >
      <Checkbox
        checked={item.is_checked}
        onCheckedChange={(checked) =>
          onToggle(item.id, checked === true)
        }
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium transition-all",
              item.is_checked && "line-through text-muted-foreground"
            )}
          >
            {item.name}
          </span>
          {item.quantity && (
            <Badge variant="outline" className="text-xs shrink-0">
              {item.quantity}
            </Badge>
          )}
          {item.category && item.category !== "other" && (
            <Badge variant="secondary" className="text-xs capitalize shrink-0">
              {item.category}
            </Badge>
          )}
        </div>

        {/* Note (expandable) */}
        {item.note && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Note
            </button>
            {expanded && (
              <p className="text-xs text-muted-foreground mt-1 pl-4">
                {item.note}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Assigned member */}
      {assignedMember && (
        <Avatar size="sm" className="shrink-0">
          <AvatarImage src={assignedMember.avatar_url || undefined} />
          <AvatarFallback>
            {getMemberInitials(assignedMember.display_name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
