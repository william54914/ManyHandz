"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { detectCategory } from "@/lib/hooks/use-shopping";
import type { ShoppingItemCategory } from "@/lib/supabase/types";
import type { Member } from "@/lib/supabase/types";

const CATEGORIES: { value: ShoppingItemCategory; label: string }[] = [
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy" },
  { value: "meat", label: "Meat" },
  { value: "bakery", label: "Bakery" },
  { value: "frozen", label: "Frozen" },
  { value: "pantry", label: "Pantry" },
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
  { value: "cleaning", label: "Cleaning" },
  { value: "household", label: "Household" },
  { value: "personal", label: "Personal" },
  { value: "pets", label: "Pets" },
  { value: "other", label: "Other" },
];

interface AddItemInputProps {
  onAdd: (params: {
    name: string;
    quantity?: string;
    category?: ShoppingItemCategory;
    assignedTo?: string;
  }) => void;
  members?: Member[];
  disabled?: boolean;
}

export function AddItemInput({ onAdd, members = [], disabled }: AddItemInputProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<ShoppingItemCategory | "">("");
  const [assignedTo, setAssignedTo] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectedCategory = name.trim() ? detectCategory(name) : null;
  const effectiveCategory = category || detectedCategory || "other";

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd({
      name: trimmed,
      quantity: quantity.trim() || undefined,
      category: effectiveCategory as ShoppingItemCategory,
      assignedTo: assignedTo || undefined,
    });

    setName("");
    setQuantity("");
    setCategory("");
    setAssignedTo("");
    setShowOptions(false);
    inputRef.current?.focus();
  }, [name, quantity, effectiveCategory, assignedTo, onAdd]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Add item..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowOptions(true)}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!name.trim() || disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Detected category hint */}
      {name.trim() && detectedCategory && detectedCategory !== "other" && !category && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="h-3 w-3" />
          Auto-detected:{" "}
          <Badge variant="outline" className="text-xs capitalize">
            {detectedCategory}
          </Badge>
        </div>
      )}

      {/* Optional fields */}
      {showOptions && name.trim() && (
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20"
          />
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ShoppingItemCategory)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {members.length > 0 && (
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
