// ============================================================================
// ManyHandz — Fairness Score Calculation
// Computes how evenly chore work is distributed across household members.
// ============================================================================

export type FairnessStatus = 'balanced' | 'slightly_off' | 'significantly_off';

export interface FairnessScore {
  memberId: string;
  points: number;
  percentage: number;
  deviation: number;
  idealShare: number;
  status: FairnessStatus;
}

export interface MemberPoints {
  memberId: string;
  points: number;
}

/**
 * Calculates fairness scores for each household member based on their
 * cumulative points. Each member receives a percentage share, a deviation
 * from the ideal equal split, and a status classification.
 *
 * - "balanced": within 5 percentage points of ideal
 * - "slightly_off": within 5-15 percentage points of ideal
 * - "significantly_off": more than 15 percentage points from ideal
 */
export function calculateFairnessScores(
  memberPoints: MemberPoints[]
): FairnessScore[] {
  if (memberPoints.length === 0) return [];

  const total = memberPoints.reduce((sum, m) => sum + m.points, 0);
  const idealShare = 100 / memberPoints.length;

  return memberPoints.map((m) => {
    // When nobody has earned points yet, treat everyone as equally balanced
    const percentage = total > 0 ? (m.points / total) * 100 : idealShare;
    const deviation = percentage - idealShare;
    const absDeviation = Math.abs(deviation);

    let status: FairnessStatus;
    if (absDeviation <= 5) {
      status = 'balanced';
    } else if (absDeviation <= 15) {
      status = 'slightly_off';
    } else {
      status = 'significantly_off';
    }

    return {
      memberId: m.memberId,
      points: m.points,
      percentage,
      deviation,
      idealShare,
      status,
    };
  });
}

/**
 * Returns a hex color representing how fair the distribution is for a member.
 *
 * - Within 5pp of ideal -> green (success)
 * - Within 5-15pp -> amber (warning)
 * - Over ideal by >15pp -> indigo (accent / over-contributor)
 * - Under ideal by >15pp -> red (danger / under-contributor)
 */
export function getFairnessColor(
  percentage: number,
  memberCount: number
): string {
  const ideal = 100 / memberCount;
  const dev = Math.abs(percentage - ideal);

  if (dev <= 5) return '#34d399'; // success green
  if (dev <= 15) return '#fbbf24'; // warning amber
  return percentage > ideal ? '#6366f1' : '#f87171'; // over: accent indigo, under: danger red
}

/**
 * Returns an overall household fairness summary.
 *
 * The household score is 0-100 where 100 is perfectly balanced.
 * It is calculated as 100 minus the average absolute deviation.
 */
export function getHouseholdFairnessScore(
  memberPoints: MemberPoints[]
): { score: number; label: string } {
  if (memberPoints.length <= 1) {
    return { score: 100, label: 'Perfectly Balanced' };
  }

  const scores = calculateFairnessScores(memberPoints);
  const avgDeviation =
    scores.reduce((sum, s) => sum + Math.abs(s.deviation), 0) / scores.length;

  // Clamp score between 0 and 100
  const score = Math.max(0, Math.min(100, Math.round(100 - avgDeviation)));

  let label: string;
  if (score >= 90) label = 'Perfectly Balanced';
  else if (score >= 75) label = 'Well Balanced';
  else if (score >= 60) label = 'Slightly Uneven';
  else if (score >= 40) label = 'Needs Attention';
  else label = 'Significantly Uneven';

  return { score, label };
}
