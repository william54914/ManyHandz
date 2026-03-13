"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  Scale,
  Gift,
  Settings,
  Target,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { NavTab } from "@/lib/constants/modes";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Icon mapping: NavTab.icon string -> Lucide component
// ---------------------------------------------------------------------------
const iconMap: Record<string, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  scale: Scale,
  gift: Gift,
  settings: Settings,
  target: Target,
  "bar-chart-3": BarChart3,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface BottomNavProps {
  navTabs: NavTab[];
}

export function BottomNav({ navTabs }: BottomNavProps) {
  const pathname = usePathname();

  if (!navTabs || navTabs.length === 0) return null;

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 lg:hidden"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-around",
          "border-t border-border/50 bg-card/95 backdrop-blur-xl",
          "px-2 py-2"
        )}
      >
        {navTabs.map((tab) => {
          const Icon = iconMap[tab.icon] ?? Home;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              </div>

              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-0.5 h-0.5 w-4 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
