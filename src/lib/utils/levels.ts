// ============================================================================
// ManyHandz — XP & Leveling Utilities
// Functions for calculating current level from XP, checking for level-ups,
// and computing progress toward the next level.
// ============================================================================

import {
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  getLevelTitle,
  getXpForLevel,
  getXpForNextLevel,
} from '../constants/levels';

/**
 * Sorted list of all defined anchor levels for binary-search style lookups.
 */
const ANCHOR_LEVELS = Object.keys(LEVEL_THRESHOLDS)
  .map(Number)
  .sort((a, b) => a - b);

/**
 * Calculates the current level for a given amount of XP.
 *
 * Walks through all possible levels (1 through MAX_LEVEL) and returns
 * the highest level whose XP threshold the player has met or exceeded.
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;

  // Start from the highest anchor and work down for efficiency
  for (let i = ANCHOR_LEVELS.length - 1; i >= 0; i--) {
    const anchorLevel = ANCHOR_LEVELS[i];
    if (xp >= LEVEL_THRESHOLDS[anchorLevel]) {
      // Check if there are interpolated levels above this anchor
      // that the player might also qualify for
      if (i < ANCHOR_LEVELS.length - 1) {
        const nextAnchor = ANCHOR_LEVELS[i + 1];
        // Check each interpolated level between this anchor and the next
        for (let level = nextAnchor - 1; level > anchorLevel; level--) {
          if (xp >= getXpForLevel(level)) {
            return Math.min(level, MAX_LEVEL);
          }
        }
      }
      return Math.min(anchorLevel, MAX_LEVEL);
    }
  }

  return 1;
}

export interface LevelProgress {
  current: number;   // XP accumulated within the current level
  required: number;  // total XP needed to advance from current level to next
  percentage: number; // 0-100 progress percentage
}

/**
 * Returns progress information toward the next level.
 *
 * @param xp - total cumulative XP
 * @param currentLevel - the player's current level
 */
export function getProgressToNextLevel(
  xp: number,
  currentLevel: number
): LevelProgress {
  if (currentLevel >= MAX_LEVEL) {
    return { current: 0, required: 0, percentage: 100 };
  }

  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForNextLevel(currentLevel);
  const required = nextLevelXp - currentLevelXp;
  const current = xp - currentLevelXp;

  if (required <= 0) {
    return { current: 0, required: 0, percentage: 100 };
  }

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((current / required) * 100 * 10) / 10)
  );

  return { current: Math.max(0, current), required, percentage };
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  title: string;
}

/**
 * Checks whether gaining XP from `previousXp` to `newXp` caused one or more
 * level ups. Returns the final new level and its title.
 */
export function checkLevelUp(
  previousXp: number,
  newXp: number
): LevelUpResult {
  const previousLevel = calculateLevel(previousXp);
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > previousLevel;

  return {
    leveledUp,
    newLevel,
    title: getLevelTitle(newLevel),
  };
}

/**
 * Returns a summary of a player's level status.
 */
export function getLevelSummary(xp: number): {
  level: number;
  title: string;
  progress: LevelProgress;
  xpToNext: number;
  isMaxLevel: boolean;
} {
  const level = calculateLevel(xp);
  const title = getLevelTitle(level);
  const progress = getProgressToNextLevel(xp, level);
  const isMaxLevel = level >= MAX_LEVEL;
  const xpToNext = isMaxLevel ? 0 : getXpForNextLevel(level) - xp;

  return { level, title, progress, xpToNext: Math.max(0, xpToNext), isMaxLevel };
}
