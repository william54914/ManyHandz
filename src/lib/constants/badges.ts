// ============================================================================
// ManyHandz — Achievement Badge Definitions
// All badges a member can earn, organized by category.
// ============================================================================

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  threshold: number; // The number required to unlock (0 = special / one-time trigger)
}

export type BadgeCategory =
  | 'beginner'
  | 'consistency'
  | 'points'
  | 'skill'
  | 'competition'
  | 'ai'
  | 'fairness'
  | 'level'
  | 'goal'
  | 'social';

// ---------------------------------------------------------------------------
// Badge Definitions
// ---------------------------------------------------------------------------

export const BADGES: BadgeDefinition[] = [
  // --- Beginner ---
  {
    key: 'first_step',
    name: 'First Step',
    description: 'Complete your very first chore.',
    icon: 'footprints',
    category: 'beginner',
    threshold: 1,
  },
  {
    key: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 chores total.',
    icon: 'rocket',
    category: 'beginner',
    threshold: 5,
  },
  {
    key: 'snap_happy',
    name: 'Snap Happy',
    description: 'Submit your first photo proof.',
    icon: 'camera',
    category: 'beginner',
    threshold: 1,
  },

  // --- Consistency ---
  {
    key: 'on_a_roll',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak of completing chores.',
    icon: 'flame',
    category: 'consistency',
    threshold: 3,
  },
  {
    key: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak of completing chores.',
    icon: 'calendar-check',
    category: 'consistency',
    threshold: 7,
  },
  {
    key: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak of completing chores.',
    icon: 'zap',
    category: 'consistency',
    threshold: 30,
  },
  {
    key: 'iron_will',
    name: 'Iron Will',
    description: 'Maintain a 60-day streak of completing chores.',
    icon: 'shield',
    category: 'consistency',
    threshold: 60,
  },
  {
    key: 'legendary',
    name: 'Legendary',
    description: 'Maintain a 100-day streak of completing chores.',
    icon: 'crown',
    category: 'consistency',
    threshold: 100,
  },

  // --- Points ---
  {
    key: 'century_club',
    name: 'Century Club',
    description: 'Earn 100 total points.',
    icon: 'coins',
    category: 'points',
    threshold: 100,
  },
  {
    key: 'household_hero',
    name: 'Household Hero',
    description: 'Earn 500 total points.',
    icon: 'medal',
    category: 'points',
    threshold: 500,
  },
  {
    key: 'point_machine',
    name: 'Point Machine',
    description: 'Earn 1,000 total points.',
    icon: 'gauge',
    category: 'points',
    threshold: 1000,
  },
  {
    key: 'the_one_percent',
    name: 'The One Percent',
    description: 'Earn 5,000 total points.',
    icon: 'gem',
    category: 'points',
    threshold: 5000,
  },

  // --- Skill ---
  {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a chore before 8 AM.',
    icon: 'sunrise',
    category: 'skill',
    threshold: 1,
  },
  {
    key: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a chore after 10 PM.',
    icon: 'moon',
    category: 'skill',
    threshold: 1,
  },
  {
    key: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a chore in under half the estimated time.',
    icon: 'timer',
    category: 'skill',
    threshold: 1,
  },
  {
    key: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Earn speed bonuses on 10 different chores.',
    icon: 'clock',
    category: 'skill',
    threshold: 10,
  },
  {
    key: 'lightning_round',
    name: 'Lightning Round',
    description: 'Complete 3 chores in a single hour.',
    icon: 'bolt',
    category: 'skill',
    threshold: 3,
  },
  {
    key: 'photographer',
    name: 'Photographer',
    description: 'Submit 10 photo proofs.',
    icon: 'image',
    category: 'skill',
    threshold: 10,
  },
  {
    key: 'before_after_pro',
    name: 'Before & After Pro',
    description: 'Submit 5 chores with both before and after photos.',
    icon: 'images',
    category: 'skill',
    threshold: 5,
  },
  {
    key: 'all_rounder',
    name: 'All-Rounder',
    description: 'Complete chores in every category at least once.',
    icon: 'circle-dot',
    category: 'skill',
    threshold: 8, // 8 default categories
  },
  {
    key: 'team_player',
    name: 'Team Player',
    description: 'Complete 10 chores that were part of a rotation.',
    icon: 'users',
    category: 'skill',
    threshold: 10,
  },

  // --- Competition ---
  {
    key: 'challenger',
    name: 'Challenger',
    description: 'Participate in your first head-to-head competition.',
    icon: 'swords',
    category: 'competition',
    threshold: 1,
  },
  {
    key: 'victorious',
    name: 'Victorious',
    description: 'Win your first head-to-head competition.',
    icon: 'trophy',
    category: 'competition',
    threshold: 1,
  },
  {
    key: 'undefeated',
    name: 'Undefeated',
    description: 'Win 5 head-to-head competitions in a row.',
    icon: 'shield-check',
    category: 'competition',
    threshold: 5,
  },
  {
    key: 'rival',
    name: 'Rival',
    description: 'Compete against the same person 10 times.',
    icon: 'user-x',
    category: 'competition',
    threshold: 10,
  },
  {
    key: 'high_roller',
    name: 'High Roller',
    description: 'Wager 100 or more points on a single competition.',
    icon: 'dice-5',
    category: 'competition',
    threshold: 100,
  },

  // --- AI ---
  {
    key: 'ai_approved',
    name: 'AI Approved',
    description: 'Have 10 chore completions verified by AI.',
    icon: 'brain',
    category: 'ai',
    threshold: 10,
  },
  {
    key: 'perfectionist',
    name: 'Perfectionist',
    description: 'Receive a perfect AI verification score 5 times.',
    icon: 'star',
    category: 'ai',
    threshold: 5,
  },
  {
    key: 'machine_verified',
    name: 'Machine Verified',
    description: 'Have 50 chore completions verified by AI.',
    icon: 'cpu',
    category: 'ai',
    threshold: 50,
  },

  // --- Fairness ---
  {
    key: 'fairness_champion',
    name: 'Fairness Champion',
    description: 'Stay within balanced range for 4 consecutive weeks.',
    icon: 'scale',
    category: 'fairness',
    threshold: 4,
  },
  {
    key: 'balance_keeper',
    name: 'Balance Keeper',
    description: 'Stay within balanced range for 8 consecutive weeks.',
    icon: 'equal',
    category: 'fairness',
    threshold: 8,
  },

  // --- Level ---
  {
    key: 'level_5',
    name: 'Level 5',
    description: 'Reach level 5.',
    icon: 'arrow-up-circle',
    category: 'level',
    threshold: 5,
  },
  {
    key: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10.',
    icon: 'arrow-up-circle',
    category: 'level',
    threshold: 10,
  },
  {
    key: 'level_25',
    name: 'Level 25',
    description: 'Reach level 25.',
    icon: 'arrow-up-circle',
    category: 'level',
    threshold: 25,
  },
  {
    key: 'level_50',
    name: 'Level 50',
    description: 'Reach level 50 and enter the Hall of Fame.',
    icon: 'crown',
    category: 'level',
    threshold: 50,
  },

  // --- Goal ---
  {
    key: 'dream_setter',
    name: 'Dream Setter',
    description: 'Create your first savings goal.',
    icon: 'target',
    category: 'goal',
    threshold: 1,
  },
  {
    key: 'goal_getter',
    name: 'Goal Getter',
    description: 'Fully fund and complete a savings goal.',
    icon: 'check-circle',
    category: 'goal',
    threshold: 1,
  },
  {
    key: 'ambitious',
    name: 'Ambitious',
    description: 'Complete 5 savings goals.',
    icon: 'mountain',
    category: 'goal',
    threshold: 5,
  },

  // --- Social ---
  {
    key: 'birthday_star',
    name: 'Birthday Star',
    description: 'Receive a birthday bonus from ManyHandz.',
    icon: 'cake',
    category: 'social',
    threshold: 1,
  },
  {
    key: 'generous',
    name: 'Generous',
    description: 'Gift points to another member for the first time.',
    icon: 'heart-handshake',
    category: 'social',
    threshold: 1,
  },
  {
    key: 'philanthropist',
    name: 'Philanthropist',
    description: 'Gift a total of 500 points to other members.',
    icon: 'heart',
    category: 'social',
    threshold: 500,
  },
  {
    key: 'most_loved',
    name: 'Most Loved',
    description: 'Receive points from 3 or more different members.',
    icon: 'smile',
    category: 'social',
    threshold: 3,
  },
  {
    key: 'challenge_champion',
    name: 'Challenge Champion',
    description: 'Complete 10 bonus challenges.',
    icon: 'award',
    category: 'social',
    threshold: 10,
  },
];

// ---------------------------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------------------------

/**
 * Map from badge key to badge definition for O(1) lookups.
 */
export const BADGE_MAP: Record<string, BadgeDefinition> = Object.fromEntries(
  BADGES.map((b) => [b.key, b])
);

/**
 * Returns all badges in a given category.
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGES.filter((b) => b.category === category);
}

/**
 * Returns a single badge by its key, or undefined if not found.
 */
export function getBadge(key: string): BadgeDefinition | undefined {
  return BADGE_MAP[key];
}

/**
 * Returns all unique badge categories in definition order.
 */
export function getBadgeCategories(): BadgeCategory[] {
  const seen = new Set<BadgeCategory>();
  const result: BadgeCategory[] = [];
  for (const badge of BADGES) {
    if (!seen.has(badge.category)) {
      seen.add(badge.category);
      result.push(badge.category);
    }
  }
  return result;
}
