// ============================================================================
// ManyHandz — Household Milestone Definitions
// Milestones are household-level achievements (not per-member badges).
// ============================================================================

export interface MilestoneDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
}

export const MILESTONES: MilestoneDefinition[] = [
  // --- Completion count milestones ---
  {
    key: 'completions_100',
    name: 'First Hundred',
    description: 'Your household has completed 100 chores together.',
    icon: 'party-popper',
    threshold: 100,
  },
  {
    key: 'completions_500',
    name: 'High Five Hundred',
    description: 'Your household has completed 500 chores together.',
    icon: 'trophy',
    threshold: 500,
  },
  {
    key: 'completions_1000',
    name: 'Thousandaire',
    description: 'Your household has completed 1,000 chores together.',
    icon: 'medal',
    threshold: 1000,
  },
  {
    key: 'completions_5000',
    name: 'Chore Legends',
    description: 'Your household has completed 5,000 chores together.',
    icon: 'gem',
    threshold: 5000,
  },
  {
    key: 'completions_10000',
    name: 'Ten Thousand Strong',
    description: 'Your household has completed 10,000 chores together.',
    icon: 'crown',
    threshold: 10000,
  },

  // --- Special milestones ---
  {
    key: 'zero_overdue_week',
    name: 'Zero Overdue Week',
    description: 'An entire week passed with no overdue chores in the household.',
    icon: 'calendar-check',
    threshold: 7,
  },
  {
    key: 'full_house',
    name: 'Full House',
    description: 'Every member of the household completed at least one chore in a single day.',
    icon: 'users',
    threshold: 1,
  },
  {
    key: 'perfect_month',
    name: 'Perfect Month',
    description: 'All scheduled chores were completed on time for an entire month.',
    icon: 'star',
    threshold: 30,
  },
  {
    key: 'year_strong',
    name: 'Year Strong',
    description: 'Your household has been actively using ManyHandz for 365 days.',
    icon: 'calendar-heart',
    threshold: 365,
  },
  {
    key: 'three_year_strong',
    name: 'Three Year Strong',
    description: 'Your household has been actively using ManyHandz for 1,095 days.',
    icon: 'award',
    threshold: 1095,
  },
];

/**
 * Map from milestone key to its definition for O(1) lookups.
 */
export const MILESTONE_MAP: Record<string, MilestoneDefinition> = Object.fromEntries(
  MILESTONES.map((m) => [m.key, m])
);

/**
 * Returns a single milestone by key, or undefined if not found.
 */
export function getMilestone(key: string): MilestoneDefinition | undefined {
  return MILESTONE_MAP[key];
}

/**
 * Returns all completion-count milestones sorted by threshold ascending.
 */
export function getCompletionMilestones(): MilestoneDefinition[] {
  return MILESTONES.filter((m) => m.key.startsWith('completions_')).sort(
    (a, b) => a.threshold - b.threshold
  );
}

/**
 * Given a total chore completion count, returns the next unearned completion
 * milestone, or null if all have been earned.
 */
export function getNextCompletionMilestone(
  totalCompletions: number
): MilestoneDefinition | null {
  const milestones = getCompletionMilestones();
  return milestones.find((m) => m.threshold > totalCompletions) ?? null;
}
