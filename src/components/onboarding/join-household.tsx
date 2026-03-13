"use client";

import { useState, useCallback } from "react";
import { LogIn, Loader2, CheckCircle2, ShieldCheck, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHouseholdByInviteCode } from "@/lib/supabase/queries/households";
import { modeConfigs } from "@/lib/constants/modes";
import type { Household } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface JoinHouseholdProps {
  onJoin: (householdId: string, role: string) => void;
  isSubmitting?: boolean;
}

export function JoinHousehold({ onJoin, isSubmitting = false }: JoinHouseholdProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [resolvedHousehold, setResolvedHousehold] = useState<Household | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate invite code when 8 characters entered
  const handleCodeChange = useCallback(
    async (value: string) => {
      // Strip whitespace & force uppercase
      const cleaned = value.replace(/\s/g, "").toUpperCase();
      setInviteCode(cleaned);
      setValidationError(null);
      setResolvedHousehold(null);
      setSelectedRole(null);

      if (cleaned.length === 8) {
        setIsValidating(true);
        try {
          const household = await getHouseholdByInviteCode(cleaned);
          if (household) {
            setResolvedHousehold(household);
            // Auto-select role for modes with only one role (e.g. roommate)
            const config = modeConfigs[household.mode];
            if (config && config.roles.length === 1) {
              setSelectedRole(config.roles[0]);
            }
          } else {
            setValidationError("No household found with this invite code.");
          }
        } catch {
          setValidationError("Unable to validate invite code. Please try again.");
        } finally {
          setIsValidating(false);
        }
      }
    },
    []
  );

  const modeLabel =
    resolvedHousehold?.mode === "family"
      ? "Family"
      : resolvedHousehold?.mode === "roommate"
        ? "Roommate"
        : resolvedHousehold?.mode ?? "";

  // Show role picker for modes with multiple roles (e.g., family: parent/kid)
  const modeConfig = resolvedHousehold ? modeConfigs[resolvedHousehold.mode] : null;
  const showRolePicker = modeConfig && modeConfig.roles.length > 1;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="size-5 text-primary" />
          Join a Household
        </CardTitle>
        <CardDescription>
          Enter the 8-character invite code shared with you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite code input */}
        <div className="space-y-2">
          <Label htmlFor="invite-code">Invite Code</Label>
          <Input
            id="invite-code"
            placeholder="e.g. ABCD1234"
            value={inviteCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={8}
            className="text-center text-lg tracking-widest font-mono uppercase"
            autoFocus
          />
          {isValidating && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Validating...
            </p>
          )}
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>

        {/* Resolved household preview */}
        {resolvedHousehold && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
            )}
          >
            <CheckCircle2 className="size-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {resolvedHousehold.name}
              </p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {modeLabel} Mode
              </Badge>
            </div>
          </div>
        )}

        {/* Role picker for family mode */}
        {showRolePicker && (
          <div className="space-y-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {modeConfig.roles.map((r) => {
                const isParentRole = r === modeConfig.creatorRole;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      selectedRole === r
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {isParentRole ? (
                      <ShieldCheck className="size-6 text-primary" />
                    ) : (
                      <Gamepad2 className="size-6 text-primary" />
                    )}
                    <span className="text-sm font-medium capitalize">{r}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {isParentRole
                        ? "Manage chores, approve tasks, and adjust settings"
                        : "Complete chores, earn points, and redeem rewards"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm join button */}
        <Button
          className="w-full"
          disabled={!resolvedHousehold || !selectedRole || isSubmitting}
          onClick={() =>
            resolvedHousehold &&
            selectedRole &&
            onJoin(resolvedHousehold.id, selectedRole)
          }
        >
          {isSubmitting ? "Joining..." : "Join Household"}
        </Button>
      </CardContent>
    </Card>
  );
}
