"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Swords, Clock, Trophy, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { useCompetitions } from "@/lib/hooks/use-competitions";
import { useMembers } from "@/lib/hooks/use-members";
import { useHouseholdMode } from "@/lib/hooks/use-household-mode";

export default function CompetitionsPage() {
  const {
    activeCompetitions,
    pendingCompetitions,
    pastCompetitions,
    isLoading,
    acceptCompetition,
    declineCompetition,
  } = useCompetitions();
  const { currentMember } = useMembers();
  const { permissions } = useHouseholdMode();

  const handleAccept = (competitionId: string) => {
    acceptCompetition.mutate(competitionId);
  };

  const handleDecline = (competitionId: string) => {
    declineCompetition.mutate(competitionId);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitions</h1>
          <p className="text-sm text-muted-foreground">
            Head-to-head challenges against household members
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/competitions/new">
            <Plus className="mr-1 size-4" />
            Challenge
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            <Swords className="mr-1 size-4" />
            Active ({activeCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            <Hourglass className="mr-1 size-4" />
            Pending ({pendingCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            <Trophy className="mr-1 size-4" />
            Past ({pastCompetitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {isLoading ? (
            <CompetitionsSkeleton />
          ) : activeCompetitions.length === 0 ? (
            <EmptyState
              icon={Swords}
              title="No active competitions"
              description="Challenge a household member to a head-to-head competition!"
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {activeCompetitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  currentMemberId={currentMember?.id}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {isLoading ? (
            <CompetitionsSkeleton />
          ) : pendingCompetitions.length === 0 ? (
            <EmptyState
              icon={Hourglass}
              title="No pending competitions"
              description="Sent and received challenges will appear here."
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingCompetitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  currentMemberId={currentMember?.id}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {isLoading ? (
            <CompetitionsSkeleton />
          ) : pastCompetitions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No past competitions"
              description="Completed competitions and results will show here."
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {pastCompetitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  currentMemberId={currentMember?.id}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
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
// Skeleton
// ---------------------------------------------------------------------------

function CompetitionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
