"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Share2,
  ClipboardList,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ListChecks,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuickTasks } from "@/lib/hooks/use-quick-tasks";
import { useChores } from "@/lib/hooks/use-chores";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ShareIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { memberId } = useHouseholdMode();
  const { members } = useMembers();
  const { createTask } = useQuickTasks();
  const { chores, createChore } = useChores();

  // ---- Read shared data from URL params ----
  const sharedTitle = searchParams.get("title") || "";
  const sharedText = searchParams.get("text") || "";
  const sharedUrl = searchParams.get("url") || "";

  // ---- Combined shared content for preview ----
  const sharedContent = useMemo(() => {
    const parts = [sharedTitle, sharedText, sharedUrl].filter(Boolean);
    return parts.join("\n");
  }, [sharedTitle, sharedText, sharedUrl]);

  // ---- Detect if there is shared content ----
  const hasContent = sharedContent.trim().length > 0;

  // ---- State for quick task form ----
  const [taskTitle, setTaskTitle] = useState(sharedTitle || sharedText || "");
  const [taskAssignee, setTaskAssignee] = useState<string>("unassigned");
  const [created, setCreated] = useState(false);

  // ---- State for chore form ----
  const [choreName, setChoreName] = useState(sharedTitle || "");
  const [choreDescription, setChoreDescription] = useState(sharedText || "");
  const [choreDifficulty, setChoreDifficulty] = useState("3");
  const [choreEstMinutes, setChoreEstMinutes] = useState("15");

  // Update form fields when search params change
  useEffect(() => {
    setTaskTitle(sharedTitle || sharedText || "");
    setChoreName(sharedTitle || "");
    setChoreDescription(sharedText || "");
  }, [sharedTitle, sharedText]);

  // ---- Handlers ----
  const handleCreateTask = () => {
    if (!taskTitle.trim() || !memberId) return;

    createTask.mutate(
      {
        title: taskTitle.trim(),
        assigned_to: taskAssignee !== "unassigned" ? taskAssignee : null,
        due_date: null,
        due_time: null,
        created_by: memberId,
        note: sharedUrl || null,
      },
      {
        onSuccess: () => {
          setCreated(true);
          toast.success("Quick task created from shared content!");
        },
      }
    );
  };

  const handleCreateChore = () => {
    if (!choreName.trim() || !memberId) return;

    createChore.mutate(
      {
        name: choreName.trim(),
        description: choreDescription.trim() || undefined,
        difficulty: parseInt(choreDifficulty, 10),
        estimated_minutes: parseInt(choreEstMinutes, 10),
        icon: "\uD83D\uDCCB",
        created_by: memberId,
      },
      {
        onSuccess: () => {
          setCreated(true);
          toast.success("Chore created from shared content!");
        },
      }
    );
  };

  // ---- Success state ----
  if (created) {
    return (
      <div className="mx-auto w-full max-w-lg p-4 pb-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="flex size-16 items-center justify-center rounded-full bg-green-500/10"
          >
            <CheckCircle2 className="size-8 text-green-500" />
          </motion.div>
          <h2 className="text-xl font-bold">Created Successfully!</h2>
          <p className="text-sm text-muted-foreground">
            Your shared content has been turned into a task.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              View Tasks
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- No content state ----
  if (!hasContent) {
    return (
      <div className="mx-auto w-full max-w-lg p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Share Intake</h1>
            <p className="text-sm text-muted-foreground">
              Create tasks from shared content
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Share2 className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">No shared content detected</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Share text or a URL from another app to create a quick task or
              chore from it.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Main form ----
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Share Intake</h1>
          <p className="text-sm text-muted-foreground">
            Turn shared content into a task
          </p>
        </div>
      </div>

      {/* Shared Content Preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Share2 className="size-4" />
            Shared Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sharedTitle && (
            <p className="text-sm font-medium">{sharedTitle}</p>
          )}
          {sharedText && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {sharedText}
            </p>
          )}
          {sharedUrl && (
            <div className="flex items-center gap-1.5">
              <ExternalLink className="size-3 text-muted-foreground flex-shrink-0" />
              <a
                href={sharedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate"
              >
                {sharedUrl}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create As... Tabs */}
      <Tabs defaultValue="task" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="task" className="flex-1">
            <ListChecks className="size-4 mr-1.5" />
            Quick Task
          </TabsTrigger>
          <TabsTrigger value="chore" className="flex-1">
            <ClipboardList className="size-4 mr-1.5" />
            Chore
          </TabsTrigger>
        </TabsList>

        {/* Quick Task Tab */}
        <TabsContent value="task" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={taskAssignee} onValueChange={setTaskAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Anyone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Anyone</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateTask}
            disabled={!taskTitle.trim() || createTask.isPending}
            className="w-full"
          >
            {createTask.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <ListChecks className="size-4 mr-2" />
            )}
            Create Quick Task
          </Button>
        </TabsContent>

        {/* Chore Tab */}
        <TabsContent value="chore" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chore-name">Chore Name</Label>
            <Input
              id="chore-name"
              value={choreName}
              onChange={(e) => setChoreName(e.target.value)}
              placeholder="Name of the chore"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chore-description">Description</Label>
            <Textarea
              id="chore-description"
              value={choreDescription}
              onChange={(e) => setChoreDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Difficulty (1-5)</Label>
              <Select value={choreDifficulty} onValueChange={setChoreDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d} - {["Easy", "Simple", "Medium", "Hard", "Expert"][d - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Est. Minutes</Label>
              <Input
                type="number"
                min={1}
                max={480}
                value={choreEstMinutes}
                onChange={(e) => setChoreEstMinutes(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleCreateChore}
            disabled={!choreName.trim() || createChore.isPending}
            className="w-full"
          >
            {createChore.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <ClipboardList className="size-4 mr-2" />
            )}
            Create Chore
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
