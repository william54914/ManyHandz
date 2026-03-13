"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

function generateId(): string {
  return crypto.randomUUID();
}
import {
  Star,
  Plus,
  X,
  GripVertical,
  Camera,
  Loader2,
  Home,
  ChefHat,
  Bath,
  Sofa,
  BedDouble,
  Trees,
  Shirt,
  Dog,
  Trash2,
  Sparkles,
  Wind,
  Droplets,
  Flame,
  Scissors,
  Mail,
  Car,
  Zap,
  BookOpen,
  Flower2,
  Bone,
  Layers,
  Package,
  CloudRain,
  Heart,
  Music,
  Palette,
  Shield,
  Target,
  Trophy,
  Wrench,
  Coffee,
  Lightbulb,
  Brush,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";
import type { Chore } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Icon picker data
// ---------------------------------------------------------------------------

const ICON_OPTIONS: Array<{ name: string; icon: React.ElementType }> = [
  { name: "home", icon: Home },
  { name: "chef-hat", icon: ChefHat },
  { name: "bath", icon: Bath },
  { name: "sofa", icon: Sofa },
  { name: "bed-double", icon: BedDouble },
  { name: "trees", icon: Trees },
  { name: "shirt", icon: Shirt },
  { name: "dog", icon: Dog },
  { name: "trash-2", icon: Trash2 },
  { name: "sparkles", icon: Sparkles },
  { name: "wind", icon: Wind },
  { name: "droplets", icon: Droplets },
  { name: "flame", icon: Flame },
  { name: "scissors", icon: Scissors },
  { name: "mail", icon: Mail },
  { name: "car", icon: Car },
  { name: "zap", icon: Zap },
  { name: "book-open", icon: BookOpen },
  { name: "flower-2", icon: Flower2 },
  { name: "bone", icon: Bone },
  { name: "layers", icon: Layers },
  { name: "package", icon: Package },
  { name: "cloud-rain", icon: CloudRain },
  { name: "heart", icon: Heart },
  { name: "music", icon: Music },
  { name: "palette", icon: Palette },
  { name: "shield", icon: Shield },
  { name: "target", icon: Target },
  { name: "trophy", icon: Trophy },
  { name: "wrench", icon: Wrench },
  { name: "coffee", icon: Coffee },
  { name: "lightbulb", icon: Lightbulb },
  { name: "brush", icon: Brush },
  { name: "camera", icon: Camera },
  { name: "star", icon: Star },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.name, o.icon])
);

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const choreSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  estimated_minutes: z.number().min(1).max(480),
  icon: z.string().min(1, "Pick an icon"),
  checklist: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Step cannot be empty"),
      required: z.boolean(),
    })
  ),
  ai_verification_enabled: z.boolean(),
  requires_approval: z.boolean(),
});

type ChoreFormValues = z.infer<typeof choreSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChoreFormProps {
  /** Pass a chore to enable edit mode. */
  chore?: Chore | null;
  onSubmit: (values: ChoreFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChoreForm({
  chore,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ChoreFormProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const existingChecklist = (() => {
    if (!chore?.checklist) return [];
    try {
      const raw = Array.isArray(chore.checklist)
        ? chore.checklist
        : JSON.parse(chore.checklist as unknown as string);
      return raw.map((item: any) => ({
        id: item.id ?? generateId(),
        label: item.label ?? item.step ?? "",
        required: item.required ?? true,
      }));
    } catch {
      return [];
    }
  })();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChoreFormValues>({
    resolver: zodResolver(choreSchema),
    defaultValues: {
      name: chore?.name ?? "",
      description: chore?.description ?? "",
      category: chore?.category_id ?? "",
      difficulty: chore?.difficulty ?? 3,
      estimated_minutes: chore?.estimated_minutes ?? 15,
      icon: chore?.icon ?? "home",
      checklist: existingChecklist,
      ai_verification_enabled: chore?.ai_verification_enabled ?? false,
      requires_approval: chore?.requires_approval ?? true,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "checklist",
  });

  const selectedIcon = watch("icon");
  const difficulty = watch("difficulty");
  const estimatedMinutes = watch("estimated_minutes");
  const SelectedIconComponent = ICON_MAP[selectedIcon] ?? Home;

  const addChecklistStep = useCallback(() => {
    append({ id: generateId(), label: "", required: true });
  }, [append]);

  const moveStep = useCallback(
    (from: number, direction: "up" | "down") => {
      const to = direction === "up" ? from - 1 : from + 1;
      if (to < 0 || to >= fields.length) return;
      move(from, to);
    },
    [fields.length, move]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Chore Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Wash Dishes"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional details about this chore..."
          {...register("description")}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" className="gap-2">
              <SelectedIconComponent className="size-4" />
              <span className="capitalize">{selectedIcon.replace("-", " ")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Choose an Icon</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-7 gap-2">
              {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border transition-colors",
                    selectedIcon === name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => {
                    setValue("icon", name);
                    setIconPickerOpen(false);
                  }}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {errors.icon && (
          <p className="text-xs text-destructive">{errors.icon.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty ({difficulty}/5)</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValue("difficulty", i + 1)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  i < difficulty
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted hover:fill-amber-200 hover:text-amber-200"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="space-y-2">
        <Label>Estimated Time: {estimatedMinutes} min</Label>
        <Controller
          name="estimated_minutes"
          control={control}
          render={({ field }) => (
            <Slider
              min={5}
              max={120}
              step={5}
              value={[field.value]}
              onValueChange={(v) => field.onChange(v[0])}
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Checklist Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Checklist Steps</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addChecklistStep}
            className="gap-1"
          >
            <Plus className="size-3" />
            Add Step
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => moveStep(index, "up")}
                  aria-label="Move step up"
                >
                  <GripVertical className="size-3 rotate-0" />
                </button>
              </div>
              <span className="w-5 text-xs text-muted-foreground text-center">
                {index + 1}
              </span>
              <Input
                placeholder={`Step ${index + 1}...`}
                {...register(`checklist.${index}.label`)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove step"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No checklist steps yet. Add steps to help members know exactly what to do.
          </p>
        )}
      </div>

      {/* Reference Photo Upload */}
      <div className="space-y-2">
        <Label>Reference Photo</Label>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Camera className="size-4" />
            Upload Photo
          </Button>
          <span className="text-xs text-muted-foreground">
            Show what "done" looks like
          </span>
        </div>
      </div>

      {/* AI Verification Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>AI Verification</Label>
          <p className="text-xs text-muted-foreground">
            Use AI to verify completion photos automatically
          </p>
        </div>
        <Controller
          name="ai_verification_enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Requires Approval Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Requires Approval</Label>
          <p className="text-xs text-muted-foreground">
            Parent must approve completion before points are awarded
          </p>
        </div>
        <Controller
          name="requires_approval"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {chore ? "Save Changes" : "Create Chore"}
        </Button>
      </div>
    </form>
  );
}
