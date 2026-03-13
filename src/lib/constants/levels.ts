// ============================================================================
// ManyHandz — Level Thresholds and Titles
// Defines the XP required for each level and the titles associated with
// level ranges.
// ============================================================================

/**
 * Maps level number to the cumulative XP required to reach that level.
 * Intermediate levels not listed are interpolated by `getXpForLevel`.
 */
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 50,
  3: 120,
  4: 200,
  5: 350,
  6: 500,
  7: 700,
  8: 1000,
  9: 1300,
  10: 1700,
  15: 4000,
  20: 8000,
  25: 14000,
  30: 22000,
  40: 45000,
  50: 80000,
};

/**
 * Maps a level range string to its display title.
 */
export const LEVEL_TITLES: Record<string, string> = {
  '1-4': 'Rookie',
  '5-9': 'Helper',
  '10-14': 'Contributor',
  '15-19': 'Household Pro',
  '20-29': 'Chore Master',
  '30-39': 'Household Legend',
  '40-49': 'ManyHandz Elite',
  '50+': 'Hall of Fame',
};

/**
 * Maximum level a player can reach.
 */
export const MAX_LEVEL = 50;

// ---------------------------------------------------------------------------
// Helper: sorted anchor levels
// ---------------------------------------------------------------------------

const ANCHOR_LEVELS = Object.keys(LEVEL_THRESHOLDS)
  .map(Number)
  .sort((a, b) => a - b);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the display title for a given level number.
 *
 * Examples:
 * - Level 3  -> "Rookie"
 * - Level 12 -> "Contributor"
 * - Level 50 -> "Hall of Fame"
 */
export function getLevelTitle(level: number): string {
  if (level >= 50) return LEVEL_TITLES['50+'];
  if (level >= 40) return LEVEL_TITLES['40-49'];
  if (level >= 30) return LEVEL_TITLES['30-39'];
  if (level >= 20) return LEVEL_TITLES['20-29'];
  if (level >= 15) return LEVEL_TITLES['15-19'];
  if (level >= 10) return LEVEL_TITLES['10-14'];
  if (level >= 5) return LEVEL_TITLES['5-9'];
  return LEVEL_TITLES['1-4'];
}

/**
 * Returns the cumulative XP required to reach a given level.
 *
 * For levels that are explicitly defined in LEVEL_THRESHOLDS, the stored
 * value is returned directly. For intermediate levels (e.g. 11-14, 16-19),
 * XP is linearly interpolated between the two nearest anchor levels.
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL];

  // Direct lookup
  if (LEVEL_THRESHOLDS[level] !== undefined) {
    return LEVEL_THRESHOLDS[level];
  }

  // Find surrounding anchor levels and interpolate
  let lowerAnchor = 1;
  let upperAnchor = MAX_LEVEL;

  for (let i = 0; i < ANCHOR_LEVELS.length; i++) {
    if (ANCHOR_LEVELS[i] <= level) {
      lowerAnchor = ANCHOR_LEVELS[i];
    }
    if (ANCHOR_LEVELS[i] > level) {
      upperAnchor = ANCHOR_LEVELS[i];
      break;
    }
  }

  const lowerXp = LEVEL_THRESHOLDS[lowerAnchor];
  const upperXp = LEVEL_THRESHOLDS[upperAnchor];
  const range = upperAnchor - lowerAnchor;
  const progress = level - lowerAnchor;

  return Math.round(lowerXp + ((upperXp - lowerXp) * progress) / range);
}

/**
 * Returns the cumulative XP required to reach the next level after `level`.
 * If the player is at or beyond the max level, returns the max XP threshold.
 */
export function getXpForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL];
  return getXpForLevel(level + 1);
}

/**
 * Returns a 0-100 progress percentage representing how far through
 * the current level the player is, given their total XP and current level.
 */
export function getLevelProgress(xp: number, level: number): number {
  if (level >= MAX_LEVEL) return 100;

  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  const levelRange = nextLevelXp - currentLevelXp;

  if (levelRange <= 0) return 100;

  const progress = ((xp - currentLevelXp) / levelRange) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}
