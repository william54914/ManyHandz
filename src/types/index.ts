export type {
  // Enum / union types
  HouseholdMode,
  MemberRole,
  AllowancePayoutType,
  AssignmentStatus,
  CompletionStatus,
  RewardRedemptionStatus,
  SubscriptionStatus,
  GoalStatus,
  GoalContributionSource,
  GiftType,
  ChallengeType,
  ChallengeStatus,
  CompetitionType,
  CompetitionStatus,
  AiProvider,
  AiDecision,
  WebauthnChallengeType,
  RotationType,
  RotationFrequency,
  SettlementPayoutType,
  SettlementSourceType,
  SettlementStatus,
  SettlementVia,
  ShoppingItemCategory,
  SnoozeRequestStatus,
  CustomBadgeCriteriaType,
  SwapRequestStatus,
  AnnouncementPriority,
  ActivityActionType,

  // JSON sub-types
  ChecklistItem,
  ChecklistProgressItem,
  PollOption,
  PollVotes,
  RecurringItem,
  ActivityReactions,

  // Table row types
  Profile,
  WebauthnCredential,
  WebauthnChallenge,
  Household,
  Member,
  ChoreCategory,
  Chore,
  RotationGroup,
  Assignment,
  Completion,
  Reward,
  RewardRedemption,
  Achievement,
  ActivityFeedItem,
  Subscription,
  Goal,
  GoalContribution,
  PushSubscription,
  NotificationPreferences,
  PointGift,
  BonusChallenge,
  HouseholdMilestone,
  Competition,
  AiVerification,
  WeeklyReport,
  Settlement,
  ShoppingList,
  ShoppingItem,
  SnoozeRequest,
  AssignmentComment,
  CustomBadge,
  CustomBadgeAward,
  ChoreBundle,
  ChoreBundleItem,
  QuickTask,
  HouseholdPoll,
  ReferralCode,
  ReferralRedemption,
  SwapRequest,
  Announcement,

  // Insert types
  ProfileInsert,
  HouseholdInsert,
  MemberInsert,
  ChoreInsert,
  AssignmentInsert,
  CompletionInsert,
  RewardInsert,
  GoalInsert,
  SettlementInsert,
  AnnouncementInsert,
  QuickTaskInsert,

  // Update types
  ProfileUpdate,
  HouseholdUpdate,
  MemberUpdate,
  ChoreUpdate,
  AssignmentUpdate,
  GoalUpdate,
  SettlementUpdate,
} from '@/lib/supabase/types';

// ============================================================================
// Additional app-level types (not directly mapped to DB tables)
// ============================================================================

export type PayoutType = 'money' | 'treat' | 'gift' | 'privilege' | 'experience' | 'custom';

export interface FairnessResult {
  memberId: string;
  points: number;
  percentage: number;
  deviation: number;
  idealShare: number;
  status: 'balanced' | 'slightly_off' | 'significantly_off';
}

export interface PointsBreakdown {
  base: number;
  streakBonus: number;
  speedBonus: number;
  photoBonus: number;
  earlyBonus: number;
  challengeMultiplier: number;
  total: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForNextLevel: number;
  progressPercentage: number;
}
