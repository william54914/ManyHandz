"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Trash2,
  ListChecks,
  User,
  CalendarDays,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuickTasks } from "@/lib/hooks/use-quick-tasks";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

// ---------------------------------------------------------------------------
// Filter type
// ---------------------------------------------------------------------------

type TaskFilter = "all" | "mine" | "unassigned" | "completed";

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function TasksSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ filter }: { filter: TaskFilter }) {
  const messages: Record<TaskFilter, { title: string; description: string }> = {
    all: {
      title: "No quick tasks yet",
      description: "Add a task above to get started!",
    },
    mine: {
      title: "No tasks assigned to you",
      description: "Grab an unassigned task or create a new one.",
    },
    unassigned: {
      title: "No unassigned tasks",
      description: "All tasks have been claimed!",
    },
    completed: {
      title: "No completed tasks",
      description: "Complete some tasks to see them here.",
    },
  };

  const { title, description } = messages[filter];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <ListChecks className="size-6 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Task Row
// ---------------------------------------------------------------------------

function TaskRow({
  task,
  members,
  memberId,
  onToggle,
  onDelete,
  isDeleting,
}: {
  task: any;
  members: any[];
  memberId: string | null;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  isDeleting: boolean;
}) {
  const [swiped, setSwiped] = useState(false);
  const assignee = members.find((m) => m.id === task.assigned_to);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200 }}
      className="group relative"
    >
      {/* Swipe-to-delete background */}
      <div className="absolute inset-0 flex items-center justify-end rounded-xl bg-red-500/10 px-4">
        <Trash2 className="size-5 text-red-500" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            setSwiped(true);
            onDelete(task.id);
          }
        }}
        className="relative"
      >
        <Card
          className={cn(
            "transition-colors",
            task.is_completed && "opacity-60"
          )}
        >
          <CardContent className="flex items-center gap-3 py-3">
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={(checked) => {
                onToggle(task.id, !!checked);
              }}
            />

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  task.is_completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.due_date && (
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
                {task.note && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                    {task.note}
                  </span>
                )}
              </div>
            </div>

            {assignee ? (
              <Avatar className="size-6">
                {assignee.avatar_url && (
                  <AvatarImage
                    src={assignee.avatar_url}
                    alt={assignee.display_name}
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {assignee.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Anyone
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Add Task Form
// ---------------------------------------------------------------------------

function AddTaskForm({
  members,
  memberId,
  onCreate,
  isPending,
}: {
  members: any[];
  memberId: string | null;
  onCreate: (data: {
    title: string;
    assigned_to?: string | null;
    due_date?: string | null;
    created_by: string;
  }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string>("unassigned");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !memberId) return;

    onCreate({
      title: title.trim(),
      assigned_to: assignee !== "unassigned" ? assignee : null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      created_by: memberId,
    });

    setTitle("");
    setAssignee("unassigned");
    setDueDate(undefined);
    setShowOptions(false);
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Add a quick task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
            onFocus={() => setShowOptions(true)}
          />
          <Button type="submit" size="icon" disabled={!title.trim() || isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </form>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <User className="size-3 mr-1" />
                  <SelectValue placeholder="Assign to..." />
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    <CalendarDays className="size-3" />
                    {dueDate ? format(dueDate, "MMM d") : "Due date"}
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const { tasks, isLoading, createTask, toggleTask, deleteTask } =
    useQuickTasks();
  const { members } = useMembers();
  const { memberId } = useHouseholdMode();
  const [filter, setFilter] = useState<TaskFilter>("all");

  // ---- Filter tasks ----
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "mine":
        return tasks.filter((t) => t.assigned_to === memberId);
      case "unassigned":
        return tasks.filter((t) => !t.assigned_to && !t.is_completed);
      case "completed":
        return tasks.filter((t) => t.is_completed);
      default:
        return tasks;
    }
  }, [tasks, filter, memberId]);

  // ---- Handlers ----
  const handleToggle = (taskId: string, completed: boolean) => {
    if (!memberId) return;
    toggleTask.mutate({ taskId, completed, memberId });
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  const handleCreate = (data: {
    title: string;
    assigned_to?: string | null;
    due_date?: string | null;
    created_by: string;
  }) => {
    createTask.mutate({
      ...data,
      assigned_to: data.assigned_to ?? null,
      due_date: data.due_date ?? null,
      due_time: null,
      note: null,
    });
  };

  // ---- Counts ----
  const allCount = tasks.length;
  const mineCount = tasks.filter((t) => t.assigned_to === memberId).length;
  const unassignedCount = tasks.filter(
    (t) => !t.assigned_to && !t.is_completed
  ).length;
  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quick Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Lightweight one-off tasks for your household
        </p>
      </div>

      {/* Add Task */}
      <AddTaskForm
        members={members}
        memberId={memberId}
        onCreate={handleCreate}
        isPending={createTask.isPending}
      />

      {/* Filters */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as TaskFilter)}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 text-xs">
            All ({allCount})
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1 text-xs">
            Mine ({mineCount})
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="flex-1 text-xs">
            Open ({unassignedCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs">
            Done ({completedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      {isLoading ? (
        <TasksSkeleton />
      ) : filteredTasks.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                members={members}
                memberId={memberId}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isDeleting={deleteTask.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
