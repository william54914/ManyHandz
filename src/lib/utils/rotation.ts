// ============================================================================
// ManyHandz — Auto-Rotation Logic
// Handles round-robin and fixed chore assignment rotation, including
// skip-over logic for away/unavailable members.
// ============================================================================

export interface RotationGroup {
  id: string;
  choreId: string;
  memberOrder: string[];      // ordered list of member IDs
  currentIndex: number;       // index of the member who last did the chore
  rotationType: 'round_robin' | 'fixed';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  startDate: string;          // ISO date string
  isActive: boolean;
}

export interface NextAssigneeResult {
  memberId: string | null;
  newIndex: number;
}

/**
 * Determines the next assignee for a rotation group, skipping any members
 * who are currently marked as "away."
 *
 * For `fixed` rotations, the chore always belongs to the first member in
 * the order. If that member is away, no one is assigned (memberId: null).
 *
 * For `round_robin` rotations, the algorithm advances from the current
 * index and finds the next available (non-away) member. If all members
 * are away, memberId is null and the index stays unchanged.
 */
export function getNextAssignee(
  group: RotationGroup,
  awayMemberIds: string[] = []
): NextAssigneeResult {
  if (group.memberOrder.length === 0) {
    return { memberId: null, newIndex: 0 };
  }

  if (group.rotationType === 'fixed') {
    const memberId = group.memberOrder[0];
    if (awayMemberIds.includes(memberId)) {
      return { memberId: null, newIndex: 0 };
    }
    return { memberId, newIndex: 0 };
  }

  // round_robin
  const available = group.memberOrder.filter(
    (id) => !awayMemberIds.includes(id)
  );

  if (available.length === 0) {
    return { memberId: null, newIndex: group.currentIndex };
  }

  // Walk forward from current position, wrapping around
  for (let i = 0; i < group.memberOrder.length; i++) {
    const idx = (group.currentIndex + 1 + i) % group.memberOrder.length;
    if (!awayMemberIds.includes(group.memberOrder[idx])) {
      return { memberId: group.memberOrder[idx], newIndex: idx };
    }
  }

  // Fallback (should not reach here given available.length > 0 check above)
  return { memberId: null, newIndex: group.currentIndex };
}

/**
 * Determines whether a rotation group should advance based on the
 * frequency and the current date relative to the start date.
 *
 * - daily:    rotates every day
 * - weekly:   rotates every 7 days
 * - biweekly: rotates every 14 days
 * - monthly:  rotates every 30 days (approximate)
 */
export function shouldRotate(
  group: RotationGroup,
  currentDate: Date
): boolean {
  if (!group.isActive) return false;

  const start = new Date(group.startDate);
  const diffMs = currentDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return false;

  switch (group.frequency) {
    case 'daily':
      return diffDays >= 1;
    case 'weekly':
      return diffDays >= 7 && diffDays % 7 === 0;
    case 'biweekly':
      return diffDays >= 14 && diffDays % 14 === 0;
    case 'monthly':
      return diffDays >= 30 && diffDays % 30 === 0;
    default:
      return false;
  }
}

/**
 * Returns the date when the next rotation will occur.
 */
export function getNextRotationDate(
  group: RotationGroup,
  currentDate: Date
): Date {
  const start = new Date(group.startDate);
  const diffMs = currentDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let intervalDays: number;
  switch (group.frequency) {
    case 'daily':
      intervalDays = 1;
      break;
    case 'weekly':
      intervalDays = 7;
      break;
    case 'biweekly':
      intervalDays = 14;
      break;
    case 'monthly':
      intervalDays = 30;
      break;
    default:
      intervalDays = 7;
  }

  const completedIntervals = Math.floor(diffDays / intervalDays);
  const nextIntervalDays = (completedIntervals + 1) * intervalDays;

  const nextDate = new Date(start);
  nextDate.setDate(nextDate.getDate() + nextIntervalDays);
  return nextDate;
}

/**
 * Returns a human-readable label for a rotation frequency.
 */
export function getFrequencyLabel(
  frequency: RotationGroup['frequency']
): string {
  switch (frequency) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Every week';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Every month';
    default:
      return frequency;
  }
}
