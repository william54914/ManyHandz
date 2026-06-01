"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Plus, LogIn } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JoinHousehold } from "./join-household";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateHouseholdData {
  name: string;
  mode: "family" | "roommate";
}

interface CreateHouseholdProps {
  onCreateSubmit: (data: CreateHouseholdData) => void;
  onJoinSubmit: (householdId: string, role: string) => void;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Mode option cards
// ---------------------------------------------------------------------------
const modeOptions = [
  {
    value: "family" as const,
    label: "Family",
    description:
      "Perfect for families with parents and kids. Includes gamification, rewards, goals, and approval workflows.",
    icon: Home,
  },
  {
    value: "roommate" as const,
    label: "Roommate",
    description:
      "Designed for shared living spaces. Focused on fairness, rotation schedules, and payment handles.",
    icon: Users,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CreateHousehold({
  onCreateSubmit,
  onJoinSubmit,
  isSubmitting = false,
}: CreateHouseholdProps) {
  const [path, setPath] = useState<"create" | "join" | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [selectedMode, setSelectedMode] = useState<"family" | "roommate" | null>(null);

  const canSubmitCreate = householdName.trim().length > 0 && selectedMode !== null;

  // Path selection cards
  if (path === null) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo-dark.png"
              alt="ManyHandz"
              width={240}
              height={75}
              className="h-14 w-auto"
            />
          </div>
          <p className="mt-2 text-muted-foreground">
            Get started by creating a new household or joining an existing one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Create card */}
          <button
            type="button"
            onClick={() => setPath("create")}
            className={cn(
              "group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-card p-8 text-center transition-all",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            )}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Plus className="size-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Create a Household
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a new household and invite your family or roommates.
              </p>
            </div>
          </button>

          {/* Join card */}
          <button
            type="button"
            onClick={() => setPath("join")}
            className={cn(
              "group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-card p-8 text-center transition-all",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            )}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <LogIn className="size-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Join a Household
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Have an invite code? Join an existing household.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Join path
  if (path === "join") {
    return (
      <div className="w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setPath(null)}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <JoinHousehold onJoin={onJoinSubmit} isSubmitting={isSubmitting} />
      </div>
    );
  }

  // Create path
  return (
    <div className="w-full max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => setPath(null)}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back
      </button>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Create a Household</CardTitle>
          <CardDescription>
            Give your household a name and choose a mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Household name */}
          <div className="space-y-2">
            <Label htmlFor="household-name">Household Name</Label>
            <Input
              id="household-name"
              placeholder="e.g. The Smith Family"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Mode selection */}
          <div className="space-y-3">
            <Label>Household Mode</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence>
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedMode === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedMode(opt.value)}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-lg border-2 p-5 text-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {opt.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            disabled={!canSubmitCreate || isSubmitting}
            onClick={() =>
              onCreateSubmit({ name: householdName.trim(), mode: selectedMode! })
            }
          >
            {isSubmitting ? "Creating..." : "Create Household"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
