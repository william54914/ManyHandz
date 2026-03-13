// ============================================================================
// ManyHandz — Common Formatting Helpers
// Date, points, duration, currency, percentage, and pluralization utilities.
// ============================================================================

import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';

/**
 * Formats a date into a human-friendly relative string.
 *
 * - "Today at 3:45 PM"
 * - "Tomorrow at 9:00 AM"
 * - "Yesterday at 7:30 PM"
 * - "Mon, Jan 15 at 2:00 PM" (within the current year)
 * - "Mon, Jan 15, 2023 at 2:00 PM" (different year)
 *
 * Falls back to relative distance (e.g. "3 days ago") for dates older
 * than a week.
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const timeStr = format(d, 'h:mm a');

  if (isToday(d)) {
    return `Today at ${timeStr}`;
  }

  if (isTomorrow(d)) {
    return `Tomorrow at ${timeStr}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${timeStr}`;
  }

  // Within the past 7 days — use relative distance
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays <= 7) {
    return formatDistanceToNow(d, { addSuffix: true });
  }

  // Same year
  if (d.getFullYear() === now.getFullYear()) {
    return format(d, `EEE, MMM d 'at' h:mm a`);
  }

  // Different year
  return format(d, `EEE, MMM d, yyyy 'at' h:mm a`);
}

/**
 * Formats a points number with locale-specific thousands separators.
 * Adds "pts" suffix.
 *
 * Examples: "42 pts", "1,250 pts", "10,000 pts"
 */
export function formatPoints(points: number): string {
  return `${points.toLocaleString()} pts`;
}

/**
 * Formats a duration in minutes into a human-readable string.
 *
 * Examples:
 * - 5 -> "5 min"
 * - 60 -> "1 hr"
 * - 90 -> "1 hr 30 min"
 * - 150 -> "2 hr 30 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min';

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/**
 * Formats a value in cents to a USD currency string.
 *
 * Example: 5125 -> "$51.25"
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Formats a numeric value as a rounded percentage string.
 *
 * Example: 72.456 -> "72%"
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Returns the correct singular or plural form of a word based on count.
 *
 * Examples:
 * - pluralize(1, 'chore') -> "1 chore"
 * - pluralize(5, 'chore') -> "5 chores"
 * - pluralize(1, 'child', 'children') -> "1 child"
 * - pluralize(3, 'child', 'children') -> "3 children"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Formats a date as a short date string (e.g. "Jan 15" or "Jan 15, 2023").
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  if (d.getFullYear() === now.getFullYear()) {
    return format(d, 'MMM d');
  }
  return format(d, 'MMM d, yyyy');
}

/**
 * Formats a number compactly (e.g. 1200 -> "1.2k", 1500000 -> "1.5M").
 * Useful for displaying large point or XP values in tight spaces.
 */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1000000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  const m = value / 1000000;
  return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
}
