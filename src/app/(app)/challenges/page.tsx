"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, Zap, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { CreateChallengeModal } from "@/components/challenges/create-challenge-modal";
import { useChallenges } from "@/lib/hooks/use-challenges";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

export default function ChallengesPage() {
  const { activeChallenges, pastChallenges, isLoading } = useChallenges();
  const { permissions } = useHouseholdMode();
  const [modalOpen, setModalOpen] = useState(false);

  const canCreate =
    permissions?.canEditHouseholdSettings || permissions?.canCreateChores;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-sm text-muted-foreground">
            Bonus challenges to earn extra points
          </p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
              <Sparkles className="mr-1 size-4" />
              Quick
            </Button>
            <Button size="sm" asChild>
              <Link href="/challenges/new">
                <Plus className="mr-1 size-4" />
                Create
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            <Zap className="mr-1 size-4" />
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            <Trophy className="mr-1 size-4" />
            Past ({pastChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {isLoading ? (
            <ChallengesSkeleton />
          ) : activeChallenges.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No active challenges"
              description="Create a challenge to motivate your household!"
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {isLoading ? (
            <ChallengesSkeleton />
          ) : pastChallenges.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No past challenges"
              description="Completed and expired challenges will appear here."
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {pastChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick-create modal */}
      <CreateChallengeModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ChallengesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
