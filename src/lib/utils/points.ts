// ============================================================================
// ManyHandz — Points Calculation
// All point formulas: base, streak bonus, speed bonus, photo bonus,
// early completion bonus, and challenge multiplier.
// ============================================================================

/**
 * Calculates the base points for a chore based on difficulty (1-5) and
 * estimated time in minutes. Formula: ceil(difficulty * (minutes / 15))
 */
export function calculateBasePoints(
  difficulty: number,
  estimatedMinutes: number
): number {
  return Math.ceil(difficulty * (estimatedMinutes / 15));
}

/**
 * Calculates the bonus points earned from a streak.
 * Each day of streak adds 10% bonus, capped at 50% of base.
 *
 * @param basePoints - the base point value of the chore
 * @param currentStreak - the member's current daily streak count
 */
export function calculateStreakBonus(
  basePoints: number,
  currentStreak: number
): number {
  if (currentStreak <= 0) return 0;
  const bonusRate = Math.min(currentStreak * 0.1, 0.5); // cap at 50%
  return Math.ceil(basePoints * bonusRate);
}

/**
 * Calculates speed bonus for finishing a chore faster than estimated.
 * Bonus scales linearly with how much time was saved, capped at 50% of base.
 *
 * - Returns 0 if actual time is >= estimated time (no bonus for slow work).
 * - Returns 0 if actual time < 2 minutes (prevents gaming with instant completions).
 *
 * @param basePoints - the base point value of the chore
 * @param estimatedMinutes - expected time in minutes
 * @param actualMinutes - how long the member actually took
 */
export function calculateSpeedBonus(
  basePoints: number,
  estimatedMinutes: number,
  actualMinutes: number
): number {
  if (actualMinutes < 2) return 0; // minimum 2 minutes to earn speed bonus
  if (actualMinutes >= estimatedMinutes) return 0;

  const ratio = (estimatedMinutes - actualMinutes) / estimatedMinutes;
  const bonus = Math.floor(ratio * basePoints * 0.5);
  return Math.min(bonus, Math.ceil(basePoints * 0.5)); // cap at 50% of base
}

/**
 * Calculates photo proof bonus points.
 * - Before photo only: 1 point
 * - After photo only: 1 point
 * - Both before + after: 3 points (1 + 1 + 1 combo bonus)
 */
export function calculatePhotoBonus(
  hasBeforePhoto: boolean,
  hasAfterPhoto: boolean
): number {
  if (hasBeforePhoto && hasAfterPhoto) return 3; // both = 1+1+1 combo
  if (hasBeforePhoto || hasAfterPhoto) return 1;
  return 0;
}

/**
 * Early completion bonus: 2 points for completing a chore before its due date.
 */
export function calculateEarlyBonus(isEarlyCompletion: boolean): number {
  return isEarlyCompletion ? 2 : 0;
}

export interface TotalPointsParams {
  difficulty: number;
  estimatedMinutes: number;
  actualMinutes?: number;
  currentStreak: number;
  hasBeforePhoto: boolean;
  hasAfterPhoto: boolean;
  isEarlyCompletion: boolean;
  challengeMultiplier: number; // 1.0 = no challenge, 1.5 = 50% bonus, 2.0 = double, etc.
}

export interface TotalPointsResult {
  base: number;
  streakBonus: number;
  speedBonus: number;
  photoBonus: number;
  earlyBonus: number;
  total: number;
}

/**
 * Calculates the total points earned for a chore completion, including
 * all applicable bonuses and the challenge multiplier.
 *
 * The challenge multiplier is applied to the sum of (base + streakBonus +
 * speedBonus) but NOT to photo or early bonuses (those are flat additions).
 */
export function calculateTotalPoints(
  params: TotalPointsParams
): TotalPointsResult {
  const base = calculateBasePoints(params.difficulty, params.estimatedMinutes);
  const streakBonus = calculateStreakBonus(base, params.currentStreak);

  const speedBonus =
    params.actualMinutes !== undefined
      ? calculateSpeedBonus(base, params.estimatedMinutes, params.actualMinutes)
      : 0;

  const photoBonus = calculatePhotoBonus(
    params.hasBeforePhoto,
    params.hasAfterPhoto
  );

  const earlyBonus = calculateEarlyBonus(params.isEarlyCompletion);

  // Challenge multiplier applies to performance-based points
  const multiplier = Math.max(1, params.challengeMultiplier);
  const performancePoints = Math.ceil(
    (base + streakBonus + speedBonus) * multiplier
  );

  const total = performancePoints + photoBonus + earlyBonus;

  return {
    base,
    streakBonus,
    speedBonus,
    photoBonus,
    earlyBonus,
    total,
  };
}
