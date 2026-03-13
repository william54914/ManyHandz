"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Calendar,
  Check,
  Crown,
  Goal,
  Home,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const features = [
  {
    icon: RotateCcw,
    title: "Fair Distribution",
    description: "Automatic rotation and real-time fairness scoring",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Camera,
    title: "Photo Proof",
    description: "Before & after photos with AI verification",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Points, levels, badges, and rewards",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Calendar view with auto-rotation",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Real-time",
    description: "Live activity feed and instant notifications",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Goal,
    title: "Goals & Competitions",
    description: "Big-ticket goals and head-to-head challenges",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const planFeatures = [
  "Unlimited household members",
  "Smart chore rotation",
  "Fairness scoring & analytics",
  "Photo proof with AI verification",
  "Push notifications & reminders",
  "Gamification with points & badges",
  "Goals & competitions",
  "Calendar & scheduling",
  "Data export (CSV & JSON)",
  "Priority support",
];

const faqItems = [
  {
    question: "How does the fairness scoring work?",
    answer:
      "ManyHandz tracks every chore completion, considering factors like difficulty, time spent, and frequency. Our algorithm generates a real-time fairness score for each household member, ensuring chores are distributed equitably over time. You can view detailed breakdowns in the Fairness dashboard.",
  },
  {
    question: "Can I use ManyHandz with my family and roommates?",
    answer:
      "Yes. ManyHandz is designed for any shared living situation. Whether you live with family, roommates, or a partner, you can create a household and invite members via a simple invite code or link. Each member gets their own profile with personalized assignments and stats.",
  },
  {
    question: "How does photo proof verification work?",
    answer:
      "When completing a chore, members can snap before and after photos. Our AI analyzes the images to verify the task was genuinely completed. This builds trust and accountability without anyone needing to physically inspect the work.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "You get a full 14-day free trial with access to all features. After the trial, you can choose a monthly or annual subscription to continue. If you decide not to subscribe, your data is retained for 30 days in case you change your mind.",
  },
  {
    question: "Can I customize chore schedules and rotations?",
    answer:
      "Absolutely. You can set custom schedules for each chore, define rotation patterns among members, set due dates, and configure recurring tasks. The smart scheduling feature also suggests optimal rotations based on member availability and fairness scores.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Your privacy is our priority. All data is encrypted in transit and at rest. We never sell your personal information. Photos are stored securely and only visible to household members. You can export or delete your data at any time from the settings page.",
  },
  {
    question: "How do rewards and gamification work?",
    answer:
      "Members earn points for completing chores, with bonuses for streaks, on-time completions, and tackling harder tasks. Points unlock badges and levels. Households can also set up custom rewards that members can redeem their points for, like choosing a movie night or skipping a chore.",
  },
  {
    question: "Does ManyHandz work on mobile?",
    answer:
      "ManyHandz is a Progressive Web App (PWA) that works beautifully on any device. Install it directly from your browser to your home screen for a native app experience with push notifications, offline support, and fast performance.",
  },
];

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">ManyHandz</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Now with AI-powered verification
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                ManyHandz
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-xl text-muted-foreground sm:text-2xl"
            >
              Many hands make light work.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-base text-muted-foreground/80 sm:text-lg"
            >
              The household chore coordination app that keeps everyone
              accountable with smart rotation, photo proof, fairness scoring,
              and gamification.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            </motion.div>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-sm text-muted-foreground"
            >
              14-day free trial. No credit card required.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Built for every household */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for every household
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you are coordinating with family or splitting chores with
            roommates, ManyHandz adapts to your needs.
          </p>
        </motion.div>
        <motion.div
          className="mt-12 grid gap-6 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={scaleIn}>
            <Card className="h-full border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Families</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Age-appropriate chore assignments for kids",
                    "Allowance and reward system integration",
                    "Parent approval workflows for completions",
                    "Teaching responsibility through gamification",
                    "Shared family goals and celebrations",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn}>
            <Card className="h-full border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Crown className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl">Roommates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Fair rotation so nobody gets stuck with trash duty",
                    "Transparent fairness scores to end disputes",
                    "Photo proof to verify task completion",
                    "Settle-up system for shared expenses",
                    "Head-to-head competitions for motivation",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to keep your home running smoothly
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to make chore management effortless and
            fair.
          </p>
        </motion.div>
        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Card className="group h-full transition-colors hover:border-border/80">
                <CardHeader>
                  <div
                    className={cn(
                      "mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      feature.bg
                    )}
                  >
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One plan. Every feature. No surprises.
          </p>
        </motion.div>
        <motion.div
          className="mx-auto mt-12 max-w-md"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">ManyHandz Pro</CardTitle>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span
                  className={cn(
                    "text-sm font-medium",
                    !isAnnual
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Monthly
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  aria-label="Toggle annual pricing"
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isAnnual
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Annual
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ${isAnnual ? "99.99" : "9.99"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {isAnnual && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-emerald-500/10 text-emerald-400"
                  >
                    Save ~17%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" size="lg" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                14-day free trial. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Got questions? We have answers.
          </p>
        </motion.div>
        <motion.div
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Ready to make chores fair?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              Join households who have made chore time less stressful and more
              equitable.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Home className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">ManyHandz</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="mailto:support@manyhandz.app"
                className="transition-colors hover:text-foreground"
              >
                Support
              </Link>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ManyHandz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
