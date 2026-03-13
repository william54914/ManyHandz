// ============================================================================
// ManyHandz — Database Types
// ============================================================================
// Auto-mapped from MANYHANDZ_SCHEMA.sql
// uuid -> string, timestamptz -> string, date -> string, time -> string,
// numeric -> number, jsonb -> typed or Record<string,unknown>, bytea -> string,
// text[] -> string[]
// ============================================================================

// ---------------------------------------------------------------------------
// Enum-like union types (matching SQL CHECK constraints)
// ---------------------------------------------------------------------------

export type HouseholdMode = "family" | "roommate" | "office";

export type MemberRole = "parent" | "kid" | "roommate" | "manager" | "colleague";

export type AllowancePayoutType = "money" | "treat" | "gift" | "privilege" | "experience" | "custom";

export type AssignmentStatus = "pending" | "completed" | "overdue" | "skipped" | "in_progress" | "pending_review" | "snoozed_pending_approval";

export type CompletionStatus = "pending_approval" | "approved" | "rejected" | "ai_approved";

export type RewardRedemptionStatus = "pending" | "approved" | "rejected";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";

export type GoalStatus = "active" | "completed" | "canceled" | "pending_approval";

export type GoalContributionSource = "chore_completion" | "bonus" | "manual" | "transfer";

export type GiftType = "general" | "birthday" | "thank_you" | "bonus";

export type ChallengeType = "double_points" | "complete_count" | "no_overdue" | "custom";

export type ChallengeStatus = "active" | "completed" | "failed" | "expired";

export type CompetitionType = "most_points" | "most_completions" | "first_to_target" | "specific_chore_race";

export type CompetitionStatus = "pending" | "active" | "completed" | "declined" | "expired";

export type AiProvider = "openai" | "anthropic";

export type AiDecision = "auto_approved" | "flagged_for_review" | "auto_rejected";

export type WebauthnChallengeType = "registration" | "authentication";

export type RotationType = "round_robin" | "fixed";

export type RotationFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type SettlementPayoutType = "money" | "treat" | "gift" | "privilege" | "experience" | "custom";

export type SettlementSourceType = "goal_payout" | "competition" | "reward_redemption" | "allowance" | "manual";

export type SettlementStatus = "pending" | "settled" | "forgiven" | "declined";

export type SettlementVia = "venmo" | "paypal" | "cashapp" | "apple_cash" | "cash" | "in_person" | "other";

export type ShoppingItemCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "bakery"
  | "frozen"
  | "pantry"
  | "beverages"
  | "snacks"
  | "cleaning"
  | "household"
  | "personal"
  | "pets"
  | "other";

export type SnoozeRequestStatus = "pending" | "approved" | "denied";

export type CustomBadgeCriteriaType =
  | "manual"
  | "chore_count"
  | "category_count"
  | "streak"
  | "speed_bonus_count"
  | "points_total";

export type SwapRequestStatus = "pending" | "accepted" | "declined" | "expired";

export type AnnouncementPriority = "normal" | "important" | "urgent";

export type ActivityActionType =
  | "chore_completed"
  | "chore_assigned"
  | "chore_swapped"
  | "reward_redeemed"
  | "member_joined"
  | "achievement_earned"
  | "streak_milestone"
  | "goal_progress"
  | "goal_completed"
  | "level_up"
  | "payment_sent"
  | "announcement_posted"
  | "points_gifted"
  | "birthday"
  | "household_milestone"
  | "challenge_created"
  | "challenge_completed"
  | "competition_created"
  | "competition_accepted"
  | "competition_completed"
  | "ai_verified"
  | "speed_bonus_earned"
  | "settlement_created"
  | "settlement_settled"
  | "settlement_forgiven"
  | "custom_badge_earned"
  | "bundle_completed"
  | "referral_reward"
  | "quick_task_completed"
  | "assignment_snoozed"
  | "snooze_approved"
  | "snooze_denied"
  | "poll_created"
  | "poll_closed";

// ---------------------------------------------------------------------------
// JSON sub-types (used within jsonb columns)
// ---------------------------------------------------------------------------

/** Chore checklist item stored in chores.checklist */
export interface ChecklistItem {
  id: string;
  label: string;
  required?: boolean;
}

/** Checklist progress entry stored in assignments.checklist_progress */
export interface ChecklistProgressItem {
  id: string;
  checked: boolean;
  checked_at?: string;
}

/** Poll option stored in household_polls.options */
export interface PollOption {
  id: string;
  text: string;
}

/** Poll votes stored in household_polls.votes — keyed by option id */
export type PollVotes = Record<string, string[]>;

/** Recurring item rule stored in shopping_lists.recurring_items */
export interface RecurringItem {
  item_name: string;
  category?: string;
  frequency_days: number;
  last_added?: string;
}

/** Activity feed reactions stored in activity_feed.reactions */
export type ActivityReactions = Record<string, string[]>;

// ---------------------------------------------------------------------------
// Table row interfaces
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebauthnCredential {
  id: string;
  user_id: string;
  public_key: string; // bytea
  counter: number;
  device_type: string | null;
  backed_up: boolean;
  transports: string[] | null;
  friendly_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

export interface WebauthnChallenge {
  id: string;
  user_id: string | null;
  challenge: string;
  type: WebauthnChallengeType;
  created_at: string;
  expires_at: string;
}

export interface Household {
  id: string;
  name: string;
  mode: HouseholdMode;
  invite_code: string;
  timezone: string;
  require_photo_proof: boolean;
  require_approval: boolean;
  leaderboard_visible: boolean;
  allow_kid_gifting: boolean;
  allow_kid_challenges: boolean;
  allow_kid_competitions: boolean;
  max_kid_competition_stakes: number;
  ai_verification_enabled: boolean;
  ai_verification_provider: AiProvider | null;
  ai_auto_approve_threshold: number;
  ai_auto_reject_threshold: number;
  ai_monthly_cost_cap_cents: number;
  health_score: number;
  health_score_updated_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  birthday: string | null;
  favorite_color: string;
  role: MemberRole;
  points_balance: number;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  venmo_handle: string | null;
  paypal_handle: string | null;
  cashapp_handle: string | null;
  apple_cash_phone: string | null;
  is_active: boolean;
  away_until: string | null;
  away_reason: string | null;
  mute_celebrations: boolean;
  allowance_enabled: boolean;
  allowance_payout_type: AllowancePayoutType;
  allowance_amount_cents: number;
  allowance_reward_description: string | null;
  allowance_threshold_pct: number;
  joined_at: string;
}

export interface ChoreCategory {
  id: string;
  household_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

export interface Chore {
  id: string;
  household_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  difficulty: number;
  estimated_minutes: number;
  icon: string;
  reference_photo_url: string | null;
  ai_verification_enabled: boolean;
  requires_approval: boolean;
  checklist: ChecklistItem[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RotationGroup {
  id: string;
  household_id: string;
  chore_id: string;
  member_order: string[]; // jsonb array of member IDs
  current_index: number;
  rotation_type: RotationType;
  frequency: RotationFrequency;
  start_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  chore_id: string;
  household_id: string;
  assigned_to: string;
  rotation_group_id: string | null;
  due_date: string;
  due_time: string | null;
  original_due_date: string | null;
  snooze_count: number;
  checklist_progress: ChecklistProgressItem[];
  status: AssignmentStatus;
  skip_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: string;
  assignment_id: string;
  completed_by: string;
  completed_at: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  extra_photo_urls: string[];
  notes: string | null;
  points_earned: number;
  speed_bonus: number;
  actual_minutes: number | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  needs_approval: boolean;
  ai_verification_id: string | null;
  status: CompletionStatus;
}

export interface Reward {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  icon: string;
  points_cost: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  member_id: string;
  points_spent: number;
  status: RewardRedemptionStatus;
  redeemed_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

export interface Achievement {
  id: string;
  member_id: string;
  badge_key: string;
  earned_at: string;
}

export interface ActivityFeedItem {
  id: string;
  household_id: string;
  member_id: string | null;
  action_type: ActivityActionType;
  metadata: Record<string, unknown>;
  reactions: ActivityReactions;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  household_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  household_id: string;
  member_id: string;
  title: string;
  description: string | null;
  icon: string;
  target_points: number;
  current_points: number;
  monetary_value: number | null;
  auto_contribute_enabled: boolean;
  auto_contribute_percentage: number;
  status: GoalStatus;
  completed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  points: number;
  source: GoalContributionSource;
  source_id: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  member_id: string;
  daily_reminder: boolean;
  overdue_alerts: boolean;
  chore_completed: boolean;
  weekly_digest: boolean;
  reward_notifications: boolean;
  goal_milestones: boolean;
  swap_requests: boolean;
  announcements: boolean;
  birthday_notifications: boolean;
  gift_received: boolean;
  challenge_notifications: boolean;
  competition_notifications: boolean;
  ai_verification_notifications: boolean;
  weekly_report: boolean;
  settlement_notifications: boolean;
  comment_notifications: boolean;
  shopping_list_notifications: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  reminder_time: string;
  updated_at: string;
}

export interface PointGift {
  id: string;
  household_id: string;
  from_member_id: string;
  to_member_id: string;
  points: number;
  note: string | null;
  gift_type: GiftType;
  created_at: string;
}

export interface BonusChallenge {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  challenge_type: ChallengeType;
  target_value: number | null;
  bonus_points: number;
  points_multiplier: number;
  starts_at: string;
  ends_at: string;
  status: ChallengeStatus;
  created_by: string;
  created_at: string;
}

export interface HouseholdMilestone {
  id: string;
  household_id: string;
  milestone_key: string;
  earned_at: string;
}

export interface Competition {
  id: string;
  household_id: string;
  challenger_id: string;
  opponent_id: string;
  title: string;
  competition_type: CompetitionType;
  target_value: number | null;
  chore_id: string | null;
  stakes_points: number;
  stakes_description: string | null;
  challenger_progress: number;
  opponent_progress: number;
  status: CompetitionStatus;
  winner_id: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface AiVerification {
  id: string;
  completion_id: string;
  provider: AiProvider;
  model: string;
  confidence_score: number;
  reference_match_score: number | null;
  reasoning: string;
  reference_comparison: string | null;
  decision: AiDecision;
  before_analysis: string | null;
  after_analysis: string | null;
  raw_response: Record<string, unknown> | null;
  cost_cents: number | null;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  household_id: string;
  week_start: string;
  week_end: string;
  report_data: Record<string, unknown>;
  ai_suggestions: Record<string, unknown> | null;
  mvp_member_id: string | null;
  created_at: string;
}

export interface Settlement {
  id: string;
  household_id: string;
  from_member_id: string;
  to_member_id: string;
  payout_type: SettlementPayoutType;
  amount_cents: number | null;
  payout_description: string | null;
  description: string;
  source_type: SettlementSourceType;
  source_id: string | null;
  status: SettlementStatus;
  settled_at: string | null;
  settled_via: SettlementVia | null;
  settled_note: string | null;
  created_by: string;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  household_id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_archived: boolean;
  recurring_items: RecurringItem[];
  created_by: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  category: ShoppingItemCategory | null;
  note: string | null;
  is_checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
  assigned_to: string | null;
  added_by: string;
  created_at: string;
}

export interface SnoozeRequest {
  id: string;
  assignment_id: string;
  household_id: string;
  requested_by: string;
  reason: string;
  new_due_date: string;
  new_due_time: string | null;
  status: SnoozeRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  denial_reason: string | null;
  created_at: string;
}

export interface AssignmentComment {
  id: string;
  assignment_id: string;
  household_id: string;
  member_id: string;
  body: string;
  created_at: string;
}

export interface CustomBadge {
  id: string;
  household_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria_type: CustomBadgeCriteriaType;
  criteria_target: number | null;
  criteria_category_id: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface CustomBadgeAward {
  id: string;
  badge_id: string;
  member_id: string;
  awarded_by: string | null;
  awarded_at: string;
}

export interface ChoreBundle {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface ChoreBundleItem {
  id: string;
  bundle_id: string;
  chore_id: string;
  sort_order: number;
}

export interface QuickTask {
  id: string;
  household_id: string;
  title: string;
  note: string | null;
  assigned_to: string | null;
  due_date: string | null;
  due_time: string | null;
  is_completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
}

export interface HouseholdPoll {
  id: string;
  household_id: string;
  question: string;
  options: PollOption[];
  votes: PollVotes;
  allow_multiple: boolean;
  is_anonymous: boolean;
  closes_at: string | null;
  is_closed: boolean;
  created_by: string;
  created_at: string;
}

export interface ReferralCode {
  id: string;
  referrer_household_id: string;
  code: string;
  uses: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralRedemption {
  id: string;
  referral_code_id: string;
  referred_household_id: string;
  referrer_credit_applied: boolean;
  referred_credit_applied: boolean;
  created_at: string;
}

export interface SwapRequest {
  id: string;
  household_id: string;
  requester_assignment_id: string;
  target_assignment_id: string | null;
  requester_id: string;
  target_id: string;
  message: string | null;
  status: SwapRequestStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Announcement {
  id: string;
  household_id: string;
  author_id: string;
  title: string;
  body: string | null;
  priority: AnnouncementPriority;
  pinned: boolean;
  expires_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (omit server-generated fields)
// ---------------------------------------------------------------------------

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type HouseholdInsert = Omit<Household, "id" | "invite_code" | "health_score" | "health_score_updated_at" | "created_at" | "updated_at">;
export type MemberInsert = Omit<Member, "id" | "points_balance" | "total_xp" | "current_level" | "current_streak" | "longest_streak" | "joined_at">;
export type ChoreInsert = Omit<Chore, "id" | "created_at" | "updated_at">;
export type AssignmentInsert = Omit<Assignment, "id" | "snooze_count" | "created_at" | "updated_at">;
export type CompletionInsert = Omit<Completion, "id" | "completed_at">;
export type RewardInsert = Omit<Reward, "id" | "created_at">;
export type GoalInsert = Omit<Goal, "id" | "current_points" | "completed_at" | "created_at" | "updated_at">;
export type SettlementInsert = Omit<Settlement, "id" | "settled_at" | "created_at">;
export type AnnouncementInsert = Omit<Announcement, "id" | "created_at">;
export type QuickTaskInsert = Omit<QuickTask, "id" | "is_completed" | "completed_by" | "completed_at" | "created_at">;

// ---------------------------------------------------------------------------
// Update types (all fields optional except id)
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<Omit<Profile, "id">> & { id: string };
export type HouseholdUpdate = Partial<Omit<Household, "id">> & { id: string };
export type MemberUpdate = Partial<Omit<Member, "id">> & { id: string };
export type ChoreUpdate = Partial<Omit<Chore, "id">> & { id: string };
export type AssignmentUpdate = Partial<Omit<Assignment, "id">> & { id: string };
export type GoalUpdate = Partial<Omit<Goal, "id">> & { id: string };
export type SettlementUpdate = Partial<Omit<Settlement, "id">> & { id: string };
