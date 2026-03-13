"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (poll: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    isAnonymous: boolean;
    closesAt: string | null;
  }) => void;
}

export function CreatePollModal({
  open,
  onOpenChange,
  onCreate,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [closesAt, setClosesAt] = useState("");

  const canAddOption = options.length < 6;
  const canRemoveOption = options.length > 2;
  const filledOptions = options.filter((o) => o.trim().length > 0);
  const isValid = question.trim().length > 0 && filledOptions.length >= 2;

  const handleAddOption = useCallback(() => {
    if (canAddOption) {
      setOptions((prev) => [...prev, ""]);
    }
  }, [canAddOption]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (canRemoveOption) {
        setOptions((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [canRemoveOption]
  );

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }, []);

  const handleCreate = () => {
    if (!isValid) return;

    onCreate({
      question: question.trim(),
      options: filledOptions,
      allowMultiple,
      isAnonymous,
      closesAt: closesAt ? new Date(closesAt).toISOString() : null,
    });

    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultiple(false);
    setIsAnonymous(false);
    setClosesAt("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Create Poll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="poll-question">Question</Label>
            <Input
              id="poll-question"
              placeholder="What should we have for dinner?"
              maxLength={200}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {question.length}/200
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  maxLength={100}
                />
                {canRemoveOption && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            ))}
            {canAddOption && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={handleAddOption}
              >
                <Plus className="size-3" />
                Add Option
              </Button>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-multiple" className="cursor-pointer">
                Allow multiple selections
              </Label>
              <Switch
                id="allow-multiple"
                checked={allowMultiple}
                onCheckedChange={setAllowMultiple}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-anonymous" className="cursor-pointer">
                Anonymous voting
              </Label>
              <Switch
                id="is-anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
          </div>

          {/* Auto-close date */}
          <div className="space-y-2">
            <Label htmlFor="closes-at">Auto-close (optional)</Label>
            <Input
              id="closes-at"
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid}>
            Create Poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
