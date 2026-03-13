"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Trophy,
  Flame,
  Star,
  Zap,
  BarChart3,
  Heart,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHouseholdStore } from "@/lib/stores/household-store";

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

interface SlideData {
  id: string;
  render: (stats: YearInReviewStats) => React.ReactNode;
  bgGradient: string;
}

interface YearInReviewStats {
  year: number;
  totalCompleted: number;
  totalPoints: number;
  mvp: { memberId: string; name: string; points: number } | null;
  mostConsistent: {
    memberId: string;
    name: string;
    longestStreak: number;
  } | null;
  speedDemon: {
    memberId: string;
    name: string;
    avgMinutes: number;
  } | null;
  busiestMonth: { month: string; count: number } | null;
  slowestMonth: { month: string; count: number } | null;
  mostPopularChore: { name: string; count: number } | null;
  mostAvoidedChore: { name: string; overdueCount: number } | null;
  streakRecord: number;
  totalSettlements: number;
  totalSettlementAmount: number;
  memberStats: Array<{
    memberId: string;
    name: string;
    completed: number;
    points: number;
    streak: number;
    wins: number;
    losses: number;
  }>;
  totalCompetitions: number;
  totalChallenges: number;
  totalPollsCreated: number;
  totalGiftsGiven: number;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[parseInt(month, 10) - 1] ?? month;
}

// ---------------------------------------------------------------------------
// Slide Components
// ---------------------------------------------------------------------------

function IntroSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
        className="text-7xl"
      >
        {"\uD83C\uDF89"}
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-extrabold tracking-tight"
      >
        Your {stats.year} Year in Review
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-muted-foreground max-w-md"
      >
        Let&apos;s look back at everything your household accomplished!
      </motion.p>
    </div>
  );
}

function TotalCompletedSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="flex size-24 items-center justify-center rounded-full bg-green-500/20"
      >
        <Star className="size-12 text-green-400" />
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground uppercase tracking-wider mb-2"
        >
          Chores Completed
        </motion.p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="text-6xl font-extrabold tabular-nums"
        >
          {stats.totalCompleted.toLocaleString()}
        </motion.p>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-lg text-muted-foreground"
      >
        {stats.totalPoints.toLocaleString()} total points earned
      </motion.p>
    </div>
  );
}

function MvpSlide({ stats }: { stats: YearInReviewStats }) {
  if (!stats.mvp) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Trophy className="size-16 text-amber-400/40" />
        <p className="text-muted-foreground">No MVP data available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6 }}
        className="flex size-24 items-center justify-center rounded-full bg-amber-500/20"
      >
        <Trophy className="size-12 text-amber-400" />
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-amber-400 uppercase tracking-wider mb-2"
        >
          MVP of the Year
        </motion.p>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-extrabold"
        >
          {stats.mvp.name}
        </motion.p>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-lg text-muted-foreground"
      >
        {stats.mvp.points.toLocaleString()} points earned
      </motion.p>
    </div>
  );
}

function StreakSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="flex size-24 items-center justify-center rounded-full bg-orange-500/20"
      >
        <Flame className="size-12 text-orange-400" />
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground uppercase tracking-wider mb-2"
        >
          Longest Streak
        </motion.p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="text-6xl font-extrabold tabular-nums"
        >
          {stats.streakRecord}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground"
        >
          consecutive days
        </motion.p>
      </div>
      {stats.mostConsistent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground"
        >
          Most consistent: {stats.mostConsistent.name}
        </motion.p>
      )}
    </div>
  );
}

function TopChoresSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="flex size-24 items-center justify-center rounded-full bg-blue-500/20"
      >
        <BarChart3 className="size-12 text-blue-400" />
      </motion.div>
      <div className="space-y-4 w-full max-w-xs">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground uppercase tracking-wider"
        >
          Top Chores
        </motion.p>
        {stats.mostPopularChore && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-xs text-green-400 mb-1">Most Popular</p>
            <p className="font-bold">{stats.mostPopularChore.name}</p>
            <p className="text-sm text-muted-foreground">
              {stats.mostPopularChore.count} completions
            </p>
          </motion.div>
        )}
        {stats.mostAvoidedChore && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-xs text-red-400 mb-1">Most Avoided</p>
            <p className="font-bold">{stats.mostAvoidedChore.name}</p>
            <p className="text-sm text-muted-foreground">
              {stats.mostAvoidedChore.overdueCount} times overdue
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MonthlyBreakdownSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="flex size-24 items-center justify-center rounded-full bg-purple-500/20"
      >
        <Zap className="size-12 text-purple-400" />
      </motion.div>
      <div className="space-y-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground uppercase tracking-wider"
        >
          Monthly Highlights
        </motion.p>
        {stats.busiestMonth && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-3xl font-bold">
              {formatMonth(stats.busiestMonth.month)}
            </p>
            <p className="text-muted-foreground">
              was your busiest month with {stats.busiestMonth.count} completions
            </p>
          </motion.div>
        )}
        {stats.slowestMonth &&
          stats.slowestMonth.month !== stats.busiestMonth?.month && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-lg font-medium text-muted-foreground">
                {formatMonth(stats.slowestMonth.month)} was the quietest (
                {stats.slowestMonth.count})
              </p>
            </motion.div>
          )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center gap-3 text-sm text-muted-foreground"
        >
          <span>{stats.totalCompetitions} competitions</span>
          <span>{stats.totalChallenges} challenges</span>
          <span>{stats.totalGiftsGiven} gifts</span>
        </motion.div>
      </div>
    </div>
  );
}

function OutroSlide({ stats }: { stats: YearInReviewStats }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="flex size-24 items-center justify-center rounded-full bg-pink-500/20"
      >
        <Heart className="size-12 text-pink-400" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-extrabold"
      >
        Here&apos;s to {stats.year + 1}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground max-w-sm"
      >
        Your household completed {stats.totalCompleted} chores, earned{" "}
        {stats.totalPoints.toLocaleString()} points, and kept things running
        smoothly. Keep it up!
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide configuration
// ---------------------------------------------------------------------------

const SLIDES: SlideData[] = [
  {
    id: "intro",
    render: (s) => <IntroSlide stats={s} />,
    bgGradient: "from-indigo-500/10 via-transparent to-purple-500/10",
  },
  {
    id: "total",
    render: (s) => <TotalCompletedSlide stats={s} />,
    bgGradient: "from-green-500/10 via-transparent to-emerald-500/10",
  },
  {
    id: "mvp",
    render: (s) => <MvpSlide stats={s} />,
    bgGradient: "from-amber-500/10 via-transparent to-yellow-500/10",
  },
  {
    id: "streak",
    render: (s) => <StreakSlide stats={s} />,
    bgGradient: "from-orange-500/10 via-transparent to-red-500/10",
  },
  {
    id: "chores",
    render: (s) => <TopChoresSlide stats={s} />,
    bgGradient: "from-blue-500/10 via-transparent to-cyan-500/10",
  },
  {
    id: "monthly",
    render: (s) => <MonthlyBreakdownSlide stats={s} />,
    bgGradient: "from-purple-500/10 via-transparent to-pink-500/10",
  },
  {
    id: "outro",
    render: (s) => <OutroSlide stats={s} />,
    bgGradient: "from-pink-500/10 via-transparent to-rose-500/10",
  },
];

// ---------------------------------------------------------------------------
// Slide transition variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function YearInReviewPage() {
  const router = useRouter();
  const householdId = useHouseholdStore((s) => s.activeHouseholdId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentYear = new Date().getFullYear();

  // ---- Fetch data ----
  const { data, isLoading, error } = useQuery({
    queryKey: ["year-in-review", householdId, currentYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/year-in-review?householdId=${householdId}&year=${currentYear}`
      );
      if (!res.ok) throw new Error("Failed to fetch year-in-review data");
      const json = await res.json();
      return json.stats as YearInReviewStats;
    },
    enabled: !!householdId,
  });

  // ---- Navigation ----
  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide]
  );

  const goNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      setAutoPlay(false);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // ---- Auto-play ----
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, goNext]);

  // ---- Keyboard navigation ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, router]);

  // ---- Share ----
  const handleShare = async () => {
    if (!data) return;
    const shareText = `Our household completed ${data.totalCompleted} chores and earned ${data.totalPoints} points in ${data.year}!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.year} Year in Review`,
          text: shareText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your year in review...</p>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-lg p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold">Year in Review</h1>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <BarChart3 className="size-10 text-muted-foreground" />
          <p className="font-medium">Unable to load data</p>
          <p className="text-sm text-muted-foreground">
            Please make sure your household has activity this year.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const slide = SLIDES[currentSlide];

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col bg-gradient-to-br",
        slide.bgGradient,
        "bg-[var(--bg-primary)]"
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoPlay(!autoPlay)}
            className="text-muted-foreground"
          >
            {autoPlay ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-muted-foreground"
          >
            <Share2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 px-4">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === currentSlide
                ? "w-8 bg-primary"
                : i < currentSlide
                  ? "w-4 bg-primary/40"
                  : "w-4 bg-muted-foreground/20"
            )}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center px-4"
          >
            {slide.render(data)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-between px-6 pb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="size-12 rounded-full"
        >
          <ChevronLeft className="size-6" />
        </Button>

        <span className="text-xs text-muted-foreground tabular-nums">
          {currentSlide + 1} / {SLIDES.length}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={currentSlide === SLIDES.length - 1}
          className="size-12 rounded-full"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </div>
  );
}
