-- ============================================================================
-- ManyHandz — Complete Database Schema Migration
-- ============================================================================
-- This creates all tables, indexes, functions, triggers, RLS policies,
-- and seed data for the ManyHandz application.
-- ============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- webauthn_credentials (passkeys per user)
create table public.webauthn_credentials (
  id text primary key,                          -- credential ID (base64url)
  user_id uuid references auth.users(id) on delete cascade not null,
  public_key bytea not null,
  counter bigint default 0 not null,
  device_type text,                             -- 'singleDevice' | 'multiDevice'
  backed_up boolean default false,
  transports text[],                            -- e.g. ['internal', 'hybrid']
  friendly_name text,                           -- user-assigned name: "MacBook Touch ID"
  created_at timestamptz default now() not null,
  last_used_at timestamptz
);

-- webauthn_challenges (ephemeral challenge storage)
create table public.webauthn_challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  challenge text not null,
  type text not null check (type in ('registration', 'authentication')),
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '5 minutes') not null
);

-- households
create table public.households (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  mode text not null default 'family' check (mode in ('family', 'roommate', 'office')),
  invite_code text unique not null default substring(md5(random()::text), 1, 8),
  timezone text not null default 'America/New_York',
  require_photo_proof boolean not null default false,
  require_approval boolean not null default true,
  leaderboard_visible boolean not null default true,
  allow_kid_gifting boolean not null default true,
  allow_kid_challenges boolean not null default false,
  allow_kid_competitions boolean not null default true,
  max_kid_competition_stakes integer not null default 50,
  ai_verification_enabled boolean not null default false,
  ai_verification_provider text default 'openai' check (ai_verification_provider in ('openai', 'anthropic')),
  ai_auto_approve_threshold integer not null default 85,
  ai_auto_reject_threshold integer not null default 40,
  ai_monthly_cost_cap_cents integer not null default 500,
  health_score integer not null default 100 check (health_score between 0 and 100),
  health_score_updated_at timestamptz default now() not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- members (junction between profiles and households)
create table public.members (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  display_name text not null,
  avatar_url text,
  bio text,
  birthday date,
  favorite_color text not null default '#6366f1',
  role text not null default 'roommate' check (role in ('parent', 'kid', 'roommate', 'manager', 'colleague')),
  points_balance integer not null default 0,
  total_xp integer not null default 0,
  current_level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  venmo_handle text,
  paypal_handle text,
  cashapp_handle text,
  apple_cash_phone text,
  is_active boolean not null default true,
  away_until date,
  away_reason text,
  mute_celebrations boolean not null default false,
  allowance_enabled boolean not null default false,
  allowance_payout_type text not null default 'money' check (allowance_payout_type in ('money', 'treat', 'gift', 'privilege', 'experience', 'custom')),
  allowance_amount_cents integer not null default 0,
  allowance_reward_description text,
  allowance_threshold_pct integer not null default 80 check (allowance_threshold_pct between 0 and 100),
  joined_at timestamptz default now() not null,
  unique(household_id, user_id)
);

-- chore_categories
create table public.chore_categories (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade,
  name text not null,
  icon text not null default 'home',
  color text not null default '#7aa8ff',
  is_default boolean not null default false
);

-- chores
create table public.chores (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  category_id uuid references public.chore_categories(id) on delete set null,
  name text not null,
  description text,
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  estimated_minutes integer not null default 15,
  icon text not null default 'sparkles',
  reference_photo_url text,
  ai_verification_enabled boolean not null default false,
  checklist jsonb not null default '[]',
  is_active boolean not null default true,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- rotation_groups
create table public.rotation_groups (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  chore_id uuid references public.chores(id) on delete cascade not null,
  member_order jsonb not null default '[]',
  current_index integer not null default 0,
  rotation_type text not null default 'round_robin' check (rotation_type in ('round_robin', 'fixed')),
  frequency text not null default 'weekly' check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  start_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

-- assignments
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  chore_id uuid references public.chores(id) on delete cascade not null,
  household_id uuid references public.households(id) on delete cascade not null,
  assigned_to uuid references public.members(id) on delete cascade not null,
  rotation_group_id uuid references public.rotation_groups(id) on delete set null,
  due_date date not null,
  due_time time,
  original_due_date date,
  snooze_count integer not null default 0,
  checklist_progress jsonb not null default '[]',
  status text not null default 'pending' check (status in ('pending', 'completed', 'overdue', 'skipped', 'in_progress', 'snoozed_pending_approval')),
  skip_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- completions
create table public.completions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  completed_by uuid references public.members(id) on delete cascade not null,
  completed_at timestamptz default now() not null,
  before_photo_url text,
  after_photo_url text,
  extra_photo_urls jsonb not null default '[]',
  notes text,
  points_earned integer not null default 0,
  speed_bonus integer not null default 0,
  actual_minutes integer,
  approved_by uuid references public.members(id),
  approved_at timestamptz,
  rejection_reason text,
  needs_approval boolean not null default false,
  ai_verification_id uuid,
  status text not null default 'approved' check (status in ('pending_approval', 'approved', 'rejected', 'ai_approved'))
);

-- rewards
create table public.rewards (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  description text,
  icon text not null default 'gift',
  points_cost integer not null check (points_cost > 0),
  is_active boolean not null default true,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- reward_redemptions
create table public.reward_redemptions (
  id uuid default gen_random_uuid() primary key,
  reward_id uuid references public.rewards(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  points_spent integer not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  redeemed_at timestamptz default now() not null,
  approved_by uuid references public.members(id),
  approved_at timestamptz
);

-- achievements
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) on delete cascade not null,
  badge_key text not null,
  earned_at timestamptz default now() not null,
  unique(member_id, badge_key)
);

-- activity_feed
create table public.activity_feed (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete set null,
  action_type text not null check (action_type in (
    'chore_completed', 'chore_assigned', 'chore_swapped', 'reward_redeemed',
    'member_joined', 'achievement_earned', 'streak_milestone', 'goal_progress',
    'goal_completed', 'level_up', 'payment_sent', 'announcement_posted',
    'points_gifted', 'birthday', 'household_milestone', 'challenge_created',
    'challenge_completed', 'competition_created', 'competition_accepted',
    'competition_completed', 'ai_verified', 'speed_bonus_earned',
    'settlement_created', 'settlement_settled', 'settlement_forgiven',
    'custom_badge_earned', 'bundle_completed', 'referral_reward',
    'quick_task_completed', 'assignment_snoozed', 'snooze_approved',
    'snooze_denied', 'poll_created', 'poll_closed'
  )),
  metadata jsonb not null default '{}',
  reactions jsonb not null default '{}',
  created_at timestamptz default now() not null
);

-- subscriptions (Stripe subscription state)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  household_id uuid references public.households(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz default now(),
  trial_end timestamptz default (now() + interval '14 days'),
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- goals (big-ticket goals that members work toward)
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  title text not null,
  description text,
  icon text not null default 'target',
  target_points integer not null check (target_points > 0),
  current_points integer not null default 0,
  monetary_value numeric(10,2),
  auto_contribute_enabled boolean not null default false,
  auto_contribute_percentage integer not null default 25 check (auto_contribute_percentage in (10, 25, 50, 75, 100)),
  status text not null default 'active' check (status in ('active', 'completed', 'canceled')),
  completed_at timestamptz,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- goal_contributions (tracks point deposits toward a goal)
create table public.goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  points integer not null check (points > 0),
  source text not null check (source in ('chore_completion', 'bonus', 'manual', 'transfer')),
  source_id uuid,
  created_at timestamptz default now() not null
);

-- push_subscriptions (Web Push API subscriptions per user)
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now() not null
);

-- notification_preferences
create table public.notification_preferences (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) on delete cascade not null unique,
  daily_reminder boolean not null default true,
  overdue_alerts boolean not null default true,
  chore_completed boolean not null default true,
  weekly_digest boolean not null default true,
  reward_notifications boolean not null default true,
  goal_milestones boolean not null default true,
  swap_requests boolean not null default true,
  announcements boolean not null default true,
  birthday_notifications boolean not null default true,
  gift_received boolean not null default true,
  challenge_notifications boolean not null default true,
  competition_notifications boolean not null default true,
  ai_verification_notifications boolean not null default true,
  weekly_report boolean not null default true,
  settlement_notifications boolean not null default true,
  comment_notifications boolean not null default true,
  shopping_list_notifications boolean not null default false,
  push_enabled boolean not null default false,
  email_enabled boolean not null default true,
  reminder_time time not null default '08:00',
  updated_at timestamptz default now() not null
);

-- point_gifts (member-to-member point gifting)
create table public.point_gifts (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  from_member_id uuid references public.members(id) on delete cascade not null,
  to_member_id uuid references public.members(id) on delete cascade not null,
  points integer not null check (points > 0),
  note text,
  gift_type text not null default 'general' check (gift_type in ('general', 'birthday', 'thank_you', 'bonus')),
  created_at timestamptz default now() not null
);

-- bonus_challenges (limited-time household challenges)
create table public.bonus_challenges (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  title text not null,
  description text,
  challenge_type text not null check (challenge_type in ('double_points', 'complete_count', 'no_overdue', 'custom')),
  target_value integer,
  bonus_points integer not null default 0,
  points_multiplier numeric(3,1) not null default 1.0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'completed', 'failed', 'expired')),
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- household_milestones (household-level achievement tracking)
create table public.household_milestones (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  milestone_key text not null,
  earned_at timestamptz default now() not null,
  unique(household_id, milestone_key)
);

-- competitions (head-to-head challenges between two members)
create table public.competitions (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  challenger_id uuid references public.members(id) on delete cascade not null,
  opponent_id uuid references public.members(id) on delete cascade not null,
  title text not null,
  competition_type text not null check (competition_type in ('most_points', 'most_completions', 'first_to_target', 'specific_chore_race')),
  target_value integer,
  chore_id uuid references public.chores(id) on delete set null,
  stakes_points integer not null default 0,
  stakes_description text,
  challenger_progress integer not null default 0,
  opponent_progress integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'declined', 'expired')),
  winner_id uuid references public.members(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- ai_verifications (AI-powered photo analysis results)
create table public.ai_verifications (
  id uuid default gen_random_uuid() primary key,
  completion_id uuid references public.completions(id) on delete cascade not null,
  provider text not null default 'openai' check (provider in ('openai', 'anthropic')),
  model text not null,
  confidence_score numeric(5,2) not null check (confidence_score between 0 and 100),
  reference_match_score numeric(5,2) check (reference_match_score between 0 and 100),
  reasoning text not null,
  reference_comparison text,
  decision text not null check (decision in ('auto_approved', 'flagged_for_review', 'auto_rejected')),
  before_analysis text,
  after_analysis text,
  raw_response jsonb,
  cost_cents integer,
  created_at timestamptz default now() not null
);

-- weekly_reports (auto-generated weekly summaries)
create table public.weekly_reports (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  report_data jsonb not null default '{}',
  ai_suggestions jsonb,
  mvp_member_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now() not null,
  unique(household_id, week_start)
);

-- settlements (ledger tracking who owes whom)
create table public.settlements (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  from_member_id uuid references public.members(id) on delete cascade not null,
  to_member_id uuid references public.members(id) on delete cascade not null,
  payout_type text not null default 'money' check (payout_type in ('money', 'treat', 'gift', 'privilege', 'experience', 'custom')),
  amount_cents integer check (amount_cents > 0),
  payout_description text,
  description text not null,
  source_type text not null check (source_type in ('goal_payout', 'competition', 'reward_redemption', 'allowance', 'manual')),
  source_id uuid,
  status text not null default 'pending' check (status in ('pending', 'settled', 'forgiven', 'declined')),
  settled_at timestamptz,
  settled_via text check (settled_via in ('venmo', 'paypal', 'cashapp', 'apple_cash', 'cash', 'in_person', 'other')),
  settled_note text,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- shopping_lists (shared household shopping/supply lists)
create table public.shopping_lists (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null default 'Groceries',
  icon text not null default 'shopping-cart',
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  recurring_items jsonb not null default '[]',
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- shopping_items (individual items within a shopping list)
create table public.shopping_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.shopping_lists(id) on delete cascade not null,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text check (category in ('produce', 'dairy', 'meat', 'bakery', 'frozen', 'pantry', 'beverages', 'snacks', 'cleaning', 'household', 'personal', 'pets', 'other')),
  note text,
  is_checked boolean not null default false,
  checked_by uuid references public.members(id),
  checked_at timestamptz,
  assigned_to uuid references public.members(id),
  added_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- snooze_requests (approval-gated postpone requests for assignments)
create table public.snooze_requests (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  household_id uuid references public.households(id) on delete cascade not null,
  requested_by uuid references public.members(id) on delete cascade not null,
  reason text not null check (char_length(reason) <= 300),
  new_due_date date not null,
  new_due_time time,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  reviewed_by uuid references public.members(id),
  reviewed_at timestamptz,
  denial_reason text,
  created_at timestamptz default now() not null
);

-- assignment_comments (threaded comments on individual assignments)
create table public.assignment_comments (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  household_id uuid references public.households(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete set null not null,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz default now() not null
);

-- custom_badges (parent-created custom achievements)
create table public.custom_badges (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  description text not null,
  icon text not null default 'award',
  color text not null default '#f59e0b',
  criteria_type text not null check (criteria_type in ('manual', 'chore_count', 'category_count', 'streak', 'speed_bonus_count', 'points_total')),
  criteria_target integer,
  criteria_category_id uuid references public.chore_categories(id),
  is_active boolean not null default true,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- custom_badge_awards (tracking who earned which custom badge)
create table public.custom_badge_awards (
  id uuid default gen_random_uuid() primary key,
  badge_id uuid references public.custom_badges(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  awarded_by uuid references public.members(id),
  awarded_at timestamptz default now() not null,
  unique(badge_id, member_id)
);

-- chore_bundles (grouping multiple chores into a single assignable unit)
create table public.chore_bundles (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  description text,
  icon text not null default 'layers',
  is_active boolean not null default true,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- chore_bundle_items (which chores belong to a bundle)
create table public.chore_bundle_items (
  id uuid default gen_random_uuid() primary key,
  bundle_id uuid references public.chore_bundles(id) on delete cascade not null,
  chore_id uuid references public.chores(id) on delete cascade not null,
  sort_order integer not null default 0,
  unique(bundle_id, chore_id)
);

-- quick_tasks (lightweight one-off to-dos, not structured chores)
create table public.quick_tasks (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  title text not null,
  note text,
  assigned_to uuid references public.members(id),
  due_date date,
  due_time time,
  is_completed boolean not null default false,
  completed_by uuid references public.members(id),
  completed_at timestamptz,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- household_polls (quick votes / household polls)
create table public.household_polls (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  question text not null check (char_length(question) <= 200),
  options jsonb not null default '[]',
  votes jsonb not null default '{}',
  allow_multiple boolean not null default false,
  is_anonymous boolean not null default false,
  closes_at timestamptz,
  is_closed boolean not null default false,
  created_by uuid references public.members(id) not null,
  created_at timestamptz default now() not null
);

-- referral_codes (referral program tracking)
create table public.referral_codes (
  id uuid default gen_random_uuid() primary key,
  referrer_household_id uuid references public.households(id) on delete cascade not null,
  code text not null unique,
  uses integer not null default 0,
  max_uses integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

-- referral_redemptions (tracking who used which referral code)
create table public.referral_redemptions (
  id uuid default gen_random_uuid() primary key,
  referral_code_id uuid references public.referral_codes(id) on delete cascade not null,
  referred_household_id uuid references public.households(id) on delete cascade not null,
  referrer_credit_applied boolean not null default false,
  referred_credit_applied boolean not null default false,
  created_at timestamptz default now() not null,
  unique(referral_code_id, referred_household_id)
);

-- swap_requests (chore trade/swap system)
create table public.swap_requests (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  requester_assignment_id uuid references public.assignments(id) on delete cascade not null,
  target_assignment_id uuid references public.assignments(id) on delete cascade,
  requester_id uuid references public.members(id) on delete cascade not null,
  target_id uuid references public.members(id) on delete cascade not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

-- announcements (household pinned messages)
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  author_id uuid references public.members(id) on delete set null not null,
  title text not null,
  body text,
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  pinned boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now() not null
);


-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_webauthn_user on public.webauthn_credentials(user_id);
create index idx_webauthn_challenge_user on public.webauthn_challenges(user_id);
create index idx_members_household on public.members(household_id);
create index idx_members_user on public.members(user_id);
create index idx_chores_household on public.chores(household_id);
create index idx_assignments_household on public.assignments(household_id);
create index idx_assignments_assigned_to on public.assignments(assigned_to);
create index idx_assignments_due_date on public.assignments(due_date);
create index idx_assignments_status on public.assignments(status);
create index idx_completions_assignment on public.completions(assignment_id);
create index idx_completions_completed_by on public.completions(completed_by);
create index idx_activity_feed_household on public.activity_feed(household_id);
create index idx_activity_feed_created on public.activity_feed(created_at);
create index idx_goals_household on public.goals(household_id);
create index idx_goals_member on public.goals(member_id);
create index idx_competitions_household on public.competitions(household_id);
create index idx_settlements_household on public.settlements(household_id);
create index idx_settlements_status on public.settlements(status);
create index idx_shopping_items_list on public.shopping_items(list_id);
create index idx_snooze_requests_assignment on public.snooze_requests(assignment_id);
create index idx_assignment_comments_assignment on public.assignment_comments(assignment_id);
create index idx_quick_tasks_household on public.quick_tasks(household_id);
create index idx_polls_household on public.household_polls(household_id);
create index idx_swap_requests_household on public.swap_requests(household_id);
create index idx_announcements_household on public.announcements(household_id);
create index idx_subscriptions_household on public.subscriptions(household_id);
create index idx_rotation_groups_household on public.rotation_groups(household_id);
create index idx_bonus_challenges_household on public.bonus_challenges(household_id);
create index idx_custom_badges_household on public.custom_badges(household_id);
create index idx_chore_bundles_household on public.chore_bundles(household_id);
create index idx_point_gifts_household on public.point_gifts(household_id);


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Returns all household IDs the current user belongs to (RLS helper)
create or replace function public.user_household_ids()
returns uuid[] as $$
  select array_agg(household_id)
  from public.members
  where user_id = auth.uid() and is_active = true;
$$ language sql security definer stable;

-- Checks if a household has an active subscription (RLS helper)
create or replace function public.household_has_active_subscription(hid uuid)
returns boolean as $$
  select exists (
    select 1 from public.subscriptions
    where household_id = hid
      and (
        status in ('active', 'trialing')
        or (status = 'trialing' and trial_end > now())
      )
  );
$$ language sql security definer stable;

-- Returns effective permissions for a user in a household (RLS helper)
create or replace function public.get_member_permissions(uid uuid, hid uuid)
returns jsonb as $$
declare
  member_role text;
  household_mode text;
begin
  select m.role, h.mode into member_role, household_mode
  from public.members m
  join public.households h on h.id = m.household_id
  where m.user_id = uid and m.household_id = hid and m.is_active = true;

  if member_role is null then return null; end if;

  return jsonb_build_object(
    'role', member_role,
    'mode', household_mode,
    'is_admin', (member_role in ('parent', 'manager')),
    'can_create_chores', (member_role not in ('kid', 'colleague')),
    'can_approve', (member_role in ('parent', 'manager')),
    'needs_approval', (household_mode = 'family' and member_role = 'kid')
  );
end;
$$ language plpgsql security definer stable;

-- Fairness scores for a date range
create or replace function public.get_fairness_scores(
  hid uuid, start_date date, end_date date
)
returns table (
  member_id uuid, display_name text, total_points bigint,
  percentage numeric, chore_count bigint
) as $$
  with member_points as (
    select
      a.assigned_to as member_id,
      sum(c.points_earned) as total_points,
      count(c.id) as chore_count
    from public.assignments a
    join public.completions c on c.assignment_id = a.id
    where a.household_id = hid
      and a.due_date between start_date and end_date
      and c.status in ('approved', 'ai_approved')
    group by a.assigned_to
  )
  select
    mp.member_id,
    m.display_name,
    mp.total_points,
    case when (select sum(total_points) from member_points) > 0
      then round(mp.total_points * 100.0 / (select sum(total_points) from member_points), 1)
      else 0
    end as percentage,
    mp.chore_count
  from member_points mp
  join public.members m on m.id = mp.member_id;
$$ language sql security definer stable;

-- Calculate level from XP
create or replace function public.calculate_level(xp integer)
returns integer as $$
begin
  return case
    when xp >= 80000 then 50
    when xp >= 45000 then 40
    when xp >= 22000 then 30
    when xp >= 14000 then 25
    when xp >= 8000 then 20
    when xp >= 4000 then 15
    when xp >= 1700 then 10
    when xp >= 1300 then 9
    when xp >= 1000 then 8
    when xp >= 700 then 7
    when xp >= 500 then 6
    when xp >= 350 then 5
    when xp >= 200 then 4
    when xp >= 120 then 3
    when xp >= 50 then 2
    else 1
  end;
end;
$$ language plpgsql immutable;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — Enable on all tables
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.webauthn_credentials enable row level security;
alter table public.webauthn_challenges enable row level security;
alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.chore_categories enable row level security;
alter table public.chores enable row level security;
alter table public.rotation_groups enable row level security;
alter table public.assignments enable row level security;
alter table public.completions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.achievements enable row level security;
alter table public.activity_feed enable row level security;
alter table public.subscriptions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.point_gifts enable row level security;
alter table public.bonus_challenges enable row level security;
alter table public.household_milestones enable row level security;
alter table public.competitions enable row level security;
alter table public.ai_verifications enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.settlements enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.snooze_requests enable row level security;
alter table public.assignment_comments enable row level security;
alter table public.custom_badges enable row level security;
alter table public.custom_badge_awards enable row level security;
alter table public.chore_bundles enable row level security;
alter table public.chore_bundle_items enable row level security;
alter table public.quick_tasks enable row level security;
alter table public.household_polls enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_redemptions enable row level security;
alter table public.swap_requests enable row level security;
alter table public.announcements enable row level security;


-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create policy "profiles_select" on public.profiles for select
  using (
    id = auth.uid()
    or id in (
      select m2.user_id from public.members m1
      join public.members m2 on m2.household_id = m1.household_id
      where m1.user_id = auth.uid() and m1.is_active = true and m2.is_active = true
    )
  );

create policy "profiles_update" on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- WEBAUTHN_CREDENTIALS
-- ---------------------------------------------------------------------------
create policy "webauthn_credentials_select" on public.webauthn_credentials for select
  using (user_id = auth.uid());

create policy "webauthn_credentials_insert" on public.webauthn_credentials for insert
  with check (user_id = auth.uid());

create policy "webauthn_credentials_update" on public.webauthn_credentials for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "webauthn_credentials_delete" on public.webauthn_credentials for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- WEBAUTHN_CHALLENGES
-- ---------------------------------------------------------------------------
create policy "webauthn_challenges_select" on public.webauthn_challenges for select
  using (user_id = auth.uid());

create policy "webauthn_challenges_insert" on public.webauthn_challenges for insert
  with check (user_id = auth.uid());

create policy "webauthn_challenges_update" on public.webauthn_challenges for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "webauthn_challenges_delete" on public.webauthn_challenges for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- HOUSEHOLDS
-- ---------------------------------------------------------------------------
create policy "households_select" on public.households for select
  using (id = any(user_household_ids()));

create policy "households_insert" on public.households for insert
  with check (auth.uid() is not null);

create policy "households_update" on public.households for update
  using (
    id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), id)->>'role')::text = 'roommate'
    )
  )
  with check (
    id = any(user_household_ids())
  );

-- ---------------------------------------------------------------------------
-- MEMBERS
-- ---------------------------------------------------------------------------
create policy "members_select" on public.members for select
  using (household_id = any(user_household_ids()));

create policy "members_insert" on public.members for insert
  with check (
    user_id = auth.uid()
  );

create policy "members_update" on public.members for update
  using (
    household_id = any(user_household_ids())
    and (
      -- self: can update own profile fields
      user_id = auth.uid()
      -- admin: can update any member in the household (role changes, etc.)
      or (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
    )
  )
  with check (
    household_id = any(user_household_ids())
  );

create policy "members_delete" on public.members for delete
  using (
    household_id = any(user_household_ids())
    and (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
  );

-- ---------------------------------------------------------------------------
-- CHORE_CATEGORIES
-- ---------------------------------------------------------------------------
create policy "chore_categories_select" on public.chore_categories for select
  using (
    is_default = true
    or household_id = any(user_household_ids())
  );

create policy "chore_categories_insert" on public.chore_categories for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (get_member_permissions(auth.uid(), household_id)->>'can_create_chores')::boolean = true
  );

create policy "chore_categories_update" on public.chore_categories for update
  using (
    household_id = any(user_household_ids())
    and (get_member_permissions(auth.uid(), household_id)->>'can_create_chores')::boolean = true
  )
  with check (household_id = any(user_household_ids()));

create policy "chore_categories_delete" on public.chore_categories for delete
  using (
    household_id = any(user_household_ids())
    and (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
  );

-- ---------------------------------------------------------------------------
-- CHORES
-- ---------------------------------------------------------------------------
create policy "chores_select" on public.chores for select
  using (household_id = any(user_household_ids()));

create policy "chores_insert" on public.chores for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (get_member_permissions(auth.uid(), household_id)->>'can_create_chores')::boolean = true
  );

create policy "chores_update" on public.chores for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "chores_delete" on public.chores for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- ROTATION_GROUPS
-- ---------------------------------------------------------------------------
create policy "rotation_groups_select" on public.rotation_groups for select
  using (household_id = any(user_household_ids()));

create policy "rotation_groups_insert" on public.rotation_groups for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (get_member_permissions(auth.uid(), household_id)->>'can_create_chores')::boolean = true
  );

create policy "rotation_groups_update" on public.rotation_groups for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "rotation_groups_delete" on public.rotation_groups for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- ASSIGNMENTS
-- ---------------------------------------------------------------------------
create policy "assignments_select" on public.assignments for select
  using (household_id = any(user_household_ids()));

create policy "assignments_insert" on public.assignments for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

create policy "assignments_update_admin" on public.assignments for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

-- Kids can update their own assignments (status, checklist_progress)
create policy "assignments_update_kid_own" on public.assignments for update
  using (
    household_id = any(user_household_ids())
    and assigned_to in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "assignments_delete" on public.assignments for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- COMPLETIONS
-- ---------------------------------------------------------------------------
create policy "completions_select" on public.completions for select
  using (
    assignment_id in (
      select id from public.assignments where household_id = any(user_household_ids())
    )
  );

create policy "completions_insert" on public.completions for insert
  with check (
    -- Must be the assigned member completing their own assignment
    completed_by in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
    and assignment_id in (
      select a.id from public.assignments a
      join public.members m on m.id = a.assigned_to
      where m.user_id = auth.uid()
        and a.household_id = any(user_household_ids())
    )
  );

create policy "completions_update" on public.completions for update
  using (
    -- Admins can approve/reject completions
    assignment_id in (
      select a.id from public.assignments a
      where a.household_id = any(user_household_ids())
        and (get_member_permissions(auth.uid(), a.household_id)->>'is_admin')::boolean = true
    )
  )
  with check (
    assignment_id in (
      select id from public.assignments where household_id = any(user_household_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- REWARDS
-- ---------------------------------------------------------------------------
create policy "rewards_select" on public.rewards for select
  using (household_id = any(user_household_ids()));

create policy "rewards_insert" on public.rewards for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
  );

create policy "rewards_update" on public.rewards for update
  using (
    household_id = any(user_household_ids())
    and (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
  )
  with check (household_id = any(user_household_ids()));

create policy "rewards_delete" on public.rewards for delete
  using (
    household_id = any(user_household_ids())
    and (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
  );

-- ---------------------------------------------------------------------------
-- REWARD_REDEMPTIONS
-- ---------------------------------------------------------------------------
create policy "reward_redemptions_select" on public.reward_redemptions for select
  using (
    reward_id in (
      select id from public.rewards where household_id = any(user_household_ids())
    )
  );

create policy "reward_redemptions_insert" on public.reward_redemptions for insert
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
    and reward_id in (
      select id from public.rewards
      where household_id = any(user_household_ids())
        and household_has_active_subscription(household_id)
    )
  );

-- ---------------------------------------------------------------------------
-- ACHIEVEMENTS
-- ---------------------------------------------------------------------------
create policy "achievements_select" on public.achievements for select
  using (
    member_id in (
      select id from public.members where household_id = any(user_household_ids())
    )
  );

-- System-inserted only (via triggers using security definer functions)
create policy "achievements_insert" on public.achievements for insert
  with check (
    member_id in (
      select id from public.members where household_id = any(user_household_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- ACTIVITY_FEED
-- ---------------------------------------------------------------------------
create policy "activity_feed_select" on public.activity_feed for select
  using (household_id = any(user_household_ids()));

create policy "activity_feed_insert" on public.activity_feed for insert
  with check (household_id = any(user_household_ids()));

create policy "activity_feed_update" on public.activity_feed for update
  using (household_id = any(user_household_ids()))
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
create policy "subscriptions_select" on public.subscriptions for select
  using (user_id = auth.uid());

-- No INSERT/UPDATE from client; managed via service client (webhook handler)

-- ---------------------------------------------------------------------------
-- GOALS
-- ---------------------------------------------------------------------------
create policy "goals_select" on public.goals for select
  using (household_id = any(user_household_ids()));

create policy "goals_insert" on public.goals for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or member_id in (
        select id from public.members where user_id = auth.uid() and is_active = true
      )
    )
  );

create policy "goals_update" on public.goals for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or member_id in (
        select id from public.members where user_id = auth.uid() and is_active = true
      )
    )
  )
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- GOAL_CONTRIBUTIONS
-- ---------------------------------------------------------------------------
create policy "goal_contributions_select" on public.goal_contributions for select
  using (
    goal_id in (
      select id from public.goals where household_id = any(user_household_ids())
    )
  );

create policy "goal_contributions_insert" on public.goal_contributions for insert
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
    and goal_id in (
      select id from public.goals
      where household_id = any(user_household_ids())
        and household_has_active_subscription(household_id)
    )
  );

-- ---------------------------------------------------------------------------
-- PUSH_SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
create policy "push_subscriptions_select" on public.push_subscriptions for select
  using (user_id = auth.uid());

create policy "push_subscriptions_insert" on public.push_subscriptions for insert
  with check (user_id = auth.uid());

create policy "push_subscriptions_update" on public.push_subscriptions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "push_subscriptions_delete" on public.push_subscriptions for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- NOTIFICATION_PREFERENCES
-- ---------------------------------------------------------------------------
create policy "notification_preferences_select" on public.notification_preferences for select
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "notification_preferences_insert" on public.notification_preferences for insert
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "notification_preferences_update" on public.notification_preferences for update
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  )
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "notification_preferences_delete" on public.notification_preferences for delete
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- POINT_GIFTS
-- ---------------------------------------------------------------------------
create policy "point_gifts_select" on public.point_gifts for select
  using (household_id = any(user_household_ids()));

create policy "point_gifts_insert" on public.point_gifts for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and from_member_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  );

-- ---------------------------------------------------------------------------
-- BONUS_CHALLENGES
-- ---------------------------------------------------------------------------
create policy "bonus_challenges_select" on public.bonus_challenges for select
  using (household_id = any(user_household_ids()));

create policy "bonus_challenges_insert" on public.bonus_challenges for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

create policy "bonus_challenges_update" on public.bonus_challenges for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "bonus_challenges_delete" on public.bonus_challenges for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- HOUSEHOLD_MILESTONES
-- ---------------------------------------------------------------------------
create policy "household_milestones_select" on public.household_milestones for select
  using (household_id = any(user_household_ids()));

create policy "household_milestones_insert" on public.household_milestones for insert
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- COMPETITIONS
-- ---------------------------------------------------------------------------
create policy "competitions_select" on public.competitions for select
  using (household_id = any(user_household_ids()));

create policy "competitions_insert" on public.competitions for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and challenger_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  );

create policy "competitions_update" on public.competitions for update
  using (
    household_id = any(user_household_ids())
    and (
      challenger_id in (select id from public.members where user_id = auth.uid())
      or opponent_id in (select id from public.members where user_id = auth.uid())
    )
  )
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- AI_VERIFICATIONS
-- ---------------------------------------------------------------------------
create policy "ai_verifications_select" on public.ai_verifications for select
  using (
    completion_id in (
      select c.id from public.completions c
      join public.assignments a on a.id = c.assignment_id
      where a.household_id = any(user_household_ids())
    )
  );

-- System-inserted only (via service client or security definer triggers)
create policy "ai_verifications_insert" on public.ai_verifications for insert
  with check (
    completion_id in (
      select c.id from public.completions c
      join public.assignments a on a.id = c.assignment_id
      where a.household_id = any(user_household_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- WEEKLY_REPORTS
-- ---------------------------------------------------------------------------
create policy "weekly_reports_select" on public.weekly_reports for select
  using (household_id = any(user_household_ids()));

-- System-inserted only
create policy "weekly_reports_insert" on public.weekly_reports for insert
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- SETTLEMENTS
-- ---------------------------------------------------------------------------
create policy "settlements_select" on public.settlements for select
  using (household_id = any(user_household_ids()));

create policy "settlements_insert" on public.settlements for insert
  with check (
    household_id = any(user_household_ids())
    and (
      -- Family mode: only parents create manually
      (
        (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'family'
        and (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      )
      -- Roommate mode: any member
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
      -- Auto-created by triggers (created_by is set by trigger)
      or created_by in (
        select id from public.members where user_id = auth.uid() and is_active = true
      )
    )
  );

create policy "settlements_update" on public.settlements for update
  using (
    household_id = any(user_household_ids())
    and (
      -- from_member can mark settled
      from_member_id in (select id from public.members where user_id = auth.uid())
      -- to_member or parent can forgive
      or to_member_id in (select id from public.members where user_id = auth.uid())
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
    )
  )
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- SHOPPING_LISTS
-- ---------------------------------------------------------------------------
create policy "shopping_lists_select" on public.shopping_lists for select
  using (household_id = any(user_household_ids()));

create policy "shopping_lists_insert" on public.shopping_lists for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
  );

create policy "shopping_lists_update" on public.shopping_lists for update
  using (household_id = any(user_household_ids()))
  with check (household_id = any(user_household_ids()));

create policy "shopping_lists_delete" on public.shopping_lists for delete
  using (
    household_id = any(user_household_ids())
    and (
      -- Family mode: only parents delete lists
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      -- Roommate/office mode: any member
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text != 'family'
    )
  );

-- ---------------------------------------------------------------------------
-- SHOPPING_ITEMS
-- ---------------------------------------------------------------------------
create policy "shopping_items_select" on public.shopping_items for select
  using (household_id = any(user_household_ids()));

create policy "shopping_items_insert" on public.shopping_items for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
  );

create policy "shopping_items_update" on public.shopping_items for update
  using (household_id = any(user_household_ids()))
  with check (household_id = any(user_household_ids()));

create policy "shopping_items_delete" on public.shopping_items for delete
  using (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- SNOOZE_REQUESTS
-- ---------------------------------------------------------------------------
create policy "snooze_requests_select" on public.snooze_requests for select
  using (household_id = any(user_household_ids()));

create policy "snooze_requests_insert" on public.snooze_requests for insert
  with check (
    household_id = any(user_household_ids())
    and requested_by in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  );

create policy "snooze_requests_update" on public.snooze_requests for update
  using (
    household_id = any(user_household_ids())
    and (
      -- Family: only parents approve/deny
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      -- Roommate: any member
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- ASSIGNMENT_COMMENTS
-- ---------------------------------------------------------------------------
create policy "assignment_comments_select" on public.assignment_comments for select
  using (household_id = any(user_household_ids()));

create policy "assignment_comments_insert" on public.assignment_comments for insert
  with check (
    household_id = any(user_household_ids())
    and member_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  );

create policy "assignment_comments_delete" on public.assignment_comments for delete
  using (
    household_id = any(user_household_ids())
    and (
      -- Author can delete own comments
      member_id in (select id from public.members where user_id = auth.uid())
      -- Admin can delete any comment
      or (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
    )
  );

-- ---------------------------------------------------------------------------
-- CUSTOM_BADGES
-- ---------------------------------------------------------------------------
create policy "custom_badges_select" on public.custom_badges for select
  using (household_id = any(user_household_ids()));

create policy "custom_badges_insert" on public.custom_badges for insert
  with check (
    household_id = any(user_household_ids())
    and (
      -- Family: parents only
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      -- Roommate: any member
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
    )
  );

create policy "custom_badges_update" on public.custom_badges for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "custom_badges_delete" on public.custom_badges for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- CUSTOM_BADGE_AWARDS
-- ---------------------------------------------------------------------------
create policy "custom_badge_awards_select" on public.custom_badge_awards for select
  using (
    badge_id in (
      select id from public.custom_badges where household_id = any(user_household_ids())
    )
  );

create policy "custom_badge_awards_insert" on public.custom_badge_awards for insert
  with check (
    badge_id in (
      select id from public.custom_badges cb
      where cb.household_id = any(user_household_ids())
        and (
          -- Parents can award in family mode
          (get_member_permissions(auth.uid(), cb.household_id)->>'role')::text = 'parent'
          -- System/trigger inserts (security definer)
          or (get_member_permissions(auth.uid(), cb.household_id)->>'mode')::text = 'roommate'
        )
    )
  );

-- ---------------------------------------------------------------------------
-- CHORE_BUNDLES
-- ---------------------------------------------------------------------------
create policy "chore_bundles_select" on public.chore_bundles for select
  using (household_id = any(user_household_ids()));

create policy "chore_bundles_insert" on public.chore_bundles for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

create policy "chore_bundles_update" on public.chore_bundles for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "chore_bundles_delete" on public.chore_bundles for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

-- ---------------------------------------------------------------------------
-- CHORE_BUNDLE_ITEMS
-- ---------------------------------------------------------------------------
create policy "chore_bundle_items_select" on public.chore_bundle_items for select
  using (
    bundle_id in (
      select id from public.chore_bundles where household_id = any(user_household_ids())
    )
  );

create policy "chore_bundle_items_insert" on public.chore_bundle_items for insert
  with check (
    bundle_id in (
      select id from public.chore_bundles cb
      where cb.household_id = any(user_household_ids())
        and household_has_active_subscription(cb.household_id)
        and (
          (get_member_permissions(auth.uid(), cb.household_id)->>'is_admin')::boolean = true
          or (get_member_permissions(auth.uid(), cb.household_id)->>'role')::text = 'roommate'
        )
    )
  );

create policy "chore_bundle_items_update" on public.chore_bundle_items for update
  using (
    bundle_id in (
      select id from public.chore_bundles cb
      where cb.household_id = any(user_household_ids())
        and (
          (get_member_permissions(auth.uid(), cb.household_id)->>'is_admin')::boolean = true
          or (get_member_permissions(auth.uid(), cb.household_id)->>'role')::text = 'roommate'
        )
    )
  );

create policy "chore_bundle_items_delete" on public.chore_bundle_items for delete
  using (
    bundle_id in (
      select id from public.chore_bundles cb
      where cb.household_id = any(user_household_ids())
        and (
          (get_member_permissions(auth.uid(), cb.household_id)->>'is_admin')::boolean = true
          or (get_member_permissions(auth.uid(), cb.household_id)->>'role')::text = 'roommate'
        )
    )
  );

-- ---------------------------------------------------------------------------
-- QUICK_TASKS
-- ---------------------------------------------------------------------------
create policy "quick_tasks_select" on public.quick_tasks for select
  using (household_id = any(user_household_ids()));

create policy "quick_tasks_insert" on public.quick_tasks for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
  );

create policy "quick_tasks_update" on public.quick_tasks for update
  using (household_id = any(user_household_ids()))
  with check (household_id = any(user_household_ids()));

create policy "quick_tasks_delete" on public.quick_tasks for delete
  using (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- HOUSEHOLD_POLLS
-- ---------------------------------------------------------------------------
create policy "household_polls_select" on public.household_polls for select
  using (household_id = any(user_household_ids()));

create policy "household_polls_insert" on public.household_polls for insert
  with check (
    household_id = any(user_household_ids())
    and household_has_active_subscription(household_id)
    and (
      -- Family: parents create
      (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'parent'
      -- Roommate: any member
      or (get_member_permissions(auth.uid(), household_id)->>'mode')::text = 'roommate'
    )
  );

create policy "household_polls_update" on public.household_polls for update
  using (household_id = any(user_household_ids()))
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- REFERRAL_CODES
-- ---------------------------------------------------------------------------
create policy "referral_codes_select" on public.referral_codes for select
  using (referrer_household_id = any(user_household_ids()));

-- System-managed only (via triggers)

-- ---------------------------------------------------------------------------
-- REFERRAL_REDEMPTIONS
-- ---------------------------------------------------------------------------
create policy "referral_redemptions_select" on public.referral_redemptions for select
  using (
    referred_household_id = any(user_household_ids())
    or referral_code_id in (
      select id from public.referral_codes where referrer_household_id = any(user_household_ids())
    )
  );

-- System-managed only

-- ---------------------------------------------------------------------------
-- SWAP_REQUESTS
-- ---------------------------------------------------------------------------
create policy "swap_requests_select" on public.swap_requests for select
  using (household_id = any(user_household_ids()));

create policy "swap_requests_insert" on public.swap_requests for insert
  with check (
    household_id = any(user_household_ids())
    and requester_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  );

create policy "swap_requests_update" on public.swap_requests for update
  using (
    household_id = any(user_household_ids())
    and target_id in (
      select id from public.members where user_id = auth.uid() and is_active = true
    )
  )
  with check (household_id = any(user_household_ids()));

-- ---------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------------
create policy "announcements_select" on public.announcements for select
  using (household_id = any(user_household_ids()));

create policy "announcements_insert" on public.announcements for insert
  with check (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );

create policy "announcements_update" on public.announcements for update
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  )
  with check (household_id = any(user_household_ids()));

create policy "announcements_delete" on public.announcements for delete
  using (
    household_id = any(user_household_ids())
    and (
      (get_member_permissions(auth.uid(), household_id)->>'is_admin')::boolean = true
      or (get_member_permissions(auth.uid(), household_id)->>'role')::text = 'roommate'
    )
  );


-- ============================================================================
-- TRIGGER FUNCTIONS & TRIGGERS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Trigger 1: on auth.users INSERT → auto-create profiles row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Trigger 2: on completions INSERT → update points, XP, streak, level,
--   activity feed, auto-contribute to goals, check challenges, milestones,
--   competitions, custom badges
-- ---------------------------------------------------------------------------
create or replace function public.handle_completion_insert()
returns trigger as $$
declare
  v_assignment record;
  v_chore record;
  v_member record;
  v_household record;
  v_base_points integer;
  v_multiplier numeric(3,1) := 1.0;
  v_total_points integer;
  v_new_xp integer;
  v_new_level integer;
  v_old_level integer;
  v_streak integer;
  v_prev_completion_date date;
  v_auto_contribute_amount integer;
  v_goal record;
  v_household_total bigint;
  v_milestone_thresholds integer[] := array[10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  v_threshold integer;
  v_comp record;
  v_badge record;
  v_member_chore_count bigint;
  v_member_cat_count bigint;
  v_member_speed_count bigint;
  v_member_points_total bigint;
begin
  -- Get the assignment
  select * into v_assignment from public.assignments where id = new.assignment_id;
  -- Get the chore
  select * into v_chore from public.chores where id = v_assignment.chore_id;
  -- Get the member
  select * into v_member from public.members where id = new.completed_by;
  -- Get the household
  select * into v_household from public.households where id = v_assignment.household_id;

  -- Calculate base points from difficulty
  v_base_points := v_chore.difficulty * 10;

  -- Check for active double_points challenge
  select points_multiplier into v_multiplier
  from public.bonus_challenges
  where household_id = v_assignment.household_id
    and status = 'active'
    and challenge_type = 'double_points'
    and now() between starts_at and ends_at
  limit 1;

  if v_multiplier is null then v_multiplier := 1.0; end if;

  v_total_points := round(v_base_points * v_multiplier)::integer + new.speed_bonus;

  -- Update the completion record with calculated points
  new.points_earned := v_total_points;

  -- Update assignment status to completed
  update public.assignments set status = 'completed', updated_at = now()
  where id = new.assignment_id;

  -- Update member points_balance and total_xp
  v_new_xp := v_member.total_xp + v_total_points;
  v_old_level := v_member.current_level;
  v_new_level := public.calculate_level(v_new_xp);

  -- Streak logic: check if previous completion was yesterday
  select max(c2.completed_at::date) into v_prev_completion_date
  from public.completions c2
  join public.assignments a2 on a2.id = c2.assignment_id
  where a2.assigned_to = new.completed_by
    and c2.id != new.id
    and c2.status in ('approved', 'ai_approved');

  if v_prev_completion_date = current_date - interval '1 day' then
    v_streak := v_member.current_streak + 1;
  elsif v_prev_completion_date = current_date then
    v_streak := v_member.current_streak; -- same day, no change
  else
    v_streak := 1; -- reset
  end if;

  update public.members set
    points_balance = points_balance + v_total_points,
    total_xp = v_new_xp,
    current_level = v_new_level,
    current_streak = v_streak,
    longest_streak = greatest(longest_streak, v_streak)
  where id = new.completed_by;

  -- Insert activity_feed entry for chore completion
  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    v_assignment.household_id,
    new.completed_by,
    'chore_completed',
    jsonb_build_object(
      'chore_name', v_chore.name,
      'points_earned', v_total_points,
      'assignment_id', new.assignment_id,
      'completion_id', new.id,
      'speed_bonus', new.speed_bonus
    )
  );

  -- Check for level-up
  if v_new_level > v_old_level then
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      v_assignment.household_id,
      new.completed_by,
      'level_up',
      jsonb_build_object('new_level', v_new_level, 'old_level', v_old_level)
    );
  end if;

  -- Speed bonus activity
  if new.speed_bonus > 0 then
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      v_assignment.household_id,
      new.completed_by,
      'speed_bonus_earned',
      jsonb_build_object('bonus', new.speed_bonus, 'chore_name', v_chore.name)
    );
  end if;

  -- Streak milestone check (every 7 days)
  if v_streak > 0 and v_streak % 7 = 0 then
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      v_assignment.household_id,
      new.completed_by,
      'streak_milestone',
      jsonb_build_object('streak', v_streak)
    );
  end if;

  -- Achievement checks
  -- First completion
  if not exists (select 1 from public.achievements where member_id = new.completed_by and badge_key = 'first_chore') then
    insert into public.achievements (member_id, badge_key)
    values (new.completed_by, 'first_chore')
    on conflict (member_id, badge_key) do nothing;

    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (v_assignment.household_id, new.completed_by, 'achievement_earned',
      jsonb_build_object('badge_key', 'first_chore'));
  end if;

  -- Streak achievements
  if v_streak >= 7 and not exists (select 1 from public.achievements where member_id = new.completed_by and badge_key = 'streak_7') then
    insert into public.achievements (member_id, badge_key) values (new.completed_by, 'streak_7') on conflict do nothing;
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (v_assignment.household_id, new.completed_by, 'achievement_earned', jsonb_build_object('badge_key', 'streak_7'));
  end if;
  if v_streak >= 30 and not exists (select 1 from public.achievements where member_id = new.completed_by and badge_key = 'streak_30') then
    insert into public.achievements (member_id, badge_key) values (new.completed_by, 'streak_30') on conflict do nothing;
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (v_assignment.household_id, new.completed_by, 'achievement_earned', jsonb_build_object('badge_key', 'streak_30'));
  end if;

  -- Auto-contribute to active goals
  for v_goal in
    select * from public.goals
    where member_id = new.completed_by
      and status = 'active'
      and auto_contribute_enabled = true
  loop
    v_auto_contribute_amount := round(v_total_points * v_goal.auto_contribute_percentage / 100.0)::integer;
    if v_auto_contribute_amount > 0 then
      insert into public.goal_contributions (goal_id, member_id, points, source, source_id)
      values (v_goal.id, new.completed_by, v_auto_contribute_amount, 'chore_completion', new.id);
    end if;
  end loop;

  -- Check household total completions for milestones
  select count(*) into v_household_total
  from public.completions c
  join public.assignments a on a.id = c.assignment_id
  where a.household_id = v_assignment.household_id
    and c.status in ('approved', 'ai_approved');

  foreach v_threshold in array v_milestone_thresholds loop
    if v_household_total >= v_threshold then
      insert into public.household_milestones (household_id, milestone_key)
      values (v_assignment.household_id, 'completions_' || v_threshold)
      on conflict (household_id, milestone_key) do nothing;
    end if;
  end loop;

  -- Check active competitions
  for v_comp in
    select * from public.competitions
    where household_id = v_assignment.household_id
      and status = 'active'
      and now() between starts_at and ends_at
      and (challenger_id = new.completed_by or opponent_id = new.completed_by)
  loop
    if v_comp.competition_type in ('most_points', 'most_completions', 'first_to_target') then
      if v_comp.challenger_id = new.completed_by then
        update public.competitions set
          challenger_progress = challenger_progress + case when v_comp.competition_type = 'most_points' then v_total_points else 1 end
        where id = v_comp.id;
      elsif v_comp.opponent_id = new.completed_by then
        update public.competitions set
          opponent_progress = opponent_progress + case when v_comp.competition_type = 'most_points' then v_total_points else 1 end
        where id = v_comp.id;
      end if;
    elsif v_comp.competition_type = 'specific_chore_race' and v_comp.chore_id = v_chore.id then
      if v_comp.challenger_id = new.completed_by then
        update public.competitions set challenger_progress = challenger_progress + 1 where id = v_comp.id;
      elsif v_comp.opponent_id = new.completed_by then
        update public.competitions set opponent_progress = opponent_progress + 1 where id = v_comp.id;
      end if;
    end if;
  end loop;

  -- Check custom badges with automatic criteria
  for v_badge in
    select * from public.custom_badges
    where household_id = v_assignment.household_id
      and is_active = true
      and criteria_type != 'manual'
      and not exists (
        select 1 from public.custom_badge_awards cba
        where cba.badge_id = custom_badges.id and cba.member_id = new.completed_by
      )
  loop
    case v_badge.criteria_type
      when 'chore_count' then
        select count(*) into v_member_chore_count
        from public.completions c2
        join public.assignments a2 on a2.id = c2.assignment_id
        where a2.assigned_to = new.completed_by and c2.status in ('approved', 'ai_approved');
        if v_member_chore_count >= coalesce(v_badge.criteria_target, 0) then
          insert into public.custom_badge_awards (badge_id, member_id)
          values (v_badge.id, new.completed_by) on conflict do nothing;
        end if;
      when 'category_count' then
        select count(*) into v_member_cat_count
        from public.completions c2
        join public.assignments a2 on a2.id = c2.assignment_id
        join public.chores ch on ch.id = a2.chore_id
        where a2.assigned_to = new.completed_by
          and ch.category_id = v_badge.criteria_category_id
          and c2.status in ('approved', 'ai_approved');
        if v_member_cat_count >= coalesce(v_badge.criteria_target, 0) then
          insert into public.custom_badge_awards (badge_id, member_id)
          values (v_badge.id, new.completed_by) on conflict do nothing;
        end if;
      when 'streak' then
        if v_streak >= coalesce(v_badge.criteria_target, 0) then
          insert into public.custom_badge_awards (badge_id, member_id)
          values (v_badge.id, new.completed_by) on conflict do nothing;
        end if;
      when 'speed_bonus_count' then
        select count(*) into v_member_speed_count
        from public.completions c2
        join public.assignments a2 on a2.id = c2.assignment_id
        where a2.assigned_to = new.completed_by and c2.speed_bonus > 0;
        if v_member_speed_count >= coalesce(v_badge.criteria_target, 0) then
          insert into public.custom_badge_awards (badge_id, member_id)
          values (v_badge.id, new.completed_by) on conflict do nothing;
        end if;
      when 'points_total' then
        select total_xp into v_member_points_total from public.members where id = new.completed_by;
        if v_member_points_total >= coalesce(v_badge.criteria_target, 0) then
          insert into public.custom_badge_awards (badge_id, member_id)
          values (v_badge.id, new.completed_by) on conflict do nothing;
        end if;
    end case;
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_completion_insert
  before insert on public.completions
  for each row execute procedure public.handle_completion_insert();

-- ---------------------------------------------------------------------------
-- Trigger 3: on reward_redemptions INSERT → deduct points, activity feed,
--   auto-create settlement
-- ---------------------------------------------------------------------------
create or replace function public.handle_reward_redemption()
returns trigger as $$
declare
  v_reward record;
  v_member record;
  v_household record;
  v_parent_member_id uuid;
begin
  -- Get reward info
  select * into v_reward from public.rewards where id = new.reward_id;
  -- Get member info
  select * into v_member from public.members where id = new.member_id;
  -- Get household
  select * into v_household from public.households where id = v_reward.household_id;

  -- Deduct points from member
  update public.members set points_balance = points_balance - new.points_spent
  where id = new.member_id;

  -- Insert activity_feed entry
  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    v_reward.household_id,
    new.member_id,
    'reward_redeemed',
    jsonb_build_object(
      'reward_name', v_reward.name,
      'points_spent', new.points_spent,
      'reward_id', new.reward_id,
      'redemption_id', new.id
    )
  );

  -- Auto-create settlement for parent to fulfill (family mode)
  if v_household.mode = 'family' then
    -- Find a parent in the household
    select id into v_parent_member_id
    from public.members
    where household_id = v_reward.household_id
      and role = 'parent'
      and is_active = true
    limit 1;

    if v_parent_member_id is not null then
      insert into public.settlements (
        household_id, from_member_id, to_member_id,
        payout_type, payout_description, description,
        source_type, source_id, created_by
      ) values (
        v_reward.household_id,
        v_parent_member_id,     -- parent owes
        new.member_id,          -- kid is owed
        'custom',
        v_reward.name,
        'Reward redeemed: ' || v_reward.name,
        'reward_redemption',
        new.id,
        new.member_id
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_reward_redemption_insert
  after insert on public.reward_redemptions
  for each row execute procedure public.handle_reward_redemption();

-- ---------------------------------------------------------------------------
-- Trigger 4: on assignments UPDATE (status→overdue) → activity feed, reset streak
-- ---------------------------------------------------------------------------
create or replace function public.handle_assignment_overdue()
returns trigger as $$
begin
  if old.status != 'overdue' and new.status = 'overdue' then
    -- Reset member streak
    update public.members set current_streak = 0
    where id = new.assigned_to;

    -- Activity feed
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.assigned_to,
      'chore_assigned',
      jsonb_build_object(
        'assignment_id', new.id,
        'status', 'overdue',
        'chore_id', new.chore_id
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_assignment_overdue
  after update on public.assignments
  for each row
  when (old.status is distinct from new.status and new.status = 'overdue')
  execute procedure public.handle_assignment_overdue();

-- ---------------------------------------------------------------------------
-- Trigger 5: on goal_contributions INSERT → update goal current_points,
--   check completion, activity feed milestones
-- ---------------------------------------------------------------------------
create or replace function public.handle_goal_contribution()
returns trigger as $$
declare
  v_goal record;
  v_new_points integer;
  v_old_pct integer;
  v_new_pct integer;
  v_milestone_pcts integer[] := array[25, 50, 75, 100];
  v_pct integer;
begin
  -- Get the goal
  select * into v_goal from public.goals where id = new.goal_id;

  v_old_pct := case when v_goal.target_points > 0
    then round(v_goal.current_points * 100.0 / v_goal.target_points)::integer
    else 0 end;

  v_new_points := v_goal.current_points + new.points;

  v_new_pct := case when v_goal.target_points > 0
    then round(v_new_points * 100.0 / v_goal.target_points)::integer
    else 0 end;

  -- Update goal current_points
  if v_new_points >= v_goal.target_points then
    update public.goals set
      current_points = v_new_points,
      status = 'completed',
      completed_at = now(),
      updated_at = now()
    where id = new.goal_id;

    -- Goal completed activity
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      v_goal.household_id,
      v_goal.member_id,
      'goal_completed',
      jsonb_build_object('goal_title', v_goal.title, 'target_points', v_goal.target_points)
    );
  else
    update public.goals set current_points = v_new_points, updated_at = now()
    where id = new.goal_id;
  end if;

  -- Check milestone percentages
  foreach v_pct in array v_milestone_pcts loop
    if v_old_pct < v_pct and v_new_pct >= v_pct and v_pct < 100 then
      insert into public.activity_feed (household_id, member_id, action_type, metadata)
      values (
        v_goal.household_id,
        v_goal.member_id,
        'goal_progress',
        jsonb_build_object('goal_title', v_goal.title, 'percentage', v_pct)
      );
    end if;
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_goal_contribution_insert
  after insert on public.goal_contributions
  for each row execute procedure public.handle_goal_contribution();

-- ---------------------------------------------------------------------------
-- Trigger 6: on members INSERT → create default notification_preferences
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_member()
returns trigger as $$
begin
  insert into public.notification_preferences (member_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_member_insert
  after insert on public.members
  for each row execute procedure public.handle_new_member();

-- ---------------------------------------------------------------------------
-- Trigger 7: on households INSERT → auto-generate referral code,
--   auto-create default shopping list
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_household()
returns trigger as $$
declare
  v_code text;
begin
  -- Generate referral code: MANYHANDZ- + 4 random uppercase chars
  v_code := 'MANYHANDZ-' || upper(substring(md5(random()::text), 1, 4));

  insert into public.referral_codes (referrer_household_id, code)
  values (new.id, v_code);

  -- Auto-create default shopping list
  -- Note: created_by requires a member_id, but the household creator hasn't
  -- joined as a member yet at INSERT time. We use the household's created_by
  -- (a profile id) to find the member once it exists. Instead, we defer this
  -- to after the first member joins (handled in handle_new_member or client).
  -- For now, skip auto-creating the shopping list here since no member exists yet.

  return new;
end;
$$ language plpgsql security definer;

create trigger on_household_insert
  after insert on public.households
  for each row execute procedure public.handle_new_household();

-- Also create default shopping list when first member joins a household
create or replace function public.handle_new_member_shopping_list()
returns trigger as $$
begin
  -- Only create if no shopping list exists for this household yet
  if not exists (select 1 from public.shopping_lists where household_id = new.household_id) then
    insert into public.shopping_lists (household_id, name, icon, created_by)
    values (new.household_id, 'Groceries', 'shopping-cart', new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_member_insert_shopping_list
  after insert on public.members
  for each row execute procedure public.handle_new_member_shopping_list();

-- ---------------------------------------------------------------------------
-- Trigger 8: on point_gifts INSERT → deduct sender, add to receiver,
--   activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_point_gift()
returns trigger as $$
declare
  v_from_name text;
  v_to_name text;
begin
  -- Deduct from sender
  update public.members set points_balance = points_balance - new.points
  where id = new.from_member_id;

  -- Add to receiver
  update public.members set points_balance = points_balance + new.points
  where id = new.to_member_id;

  -- Get names for activity feed
  select display_name into v_from_name from public.members where id = new.from_member_id;
  select display_name into v_to_name from public.members where id = new.to_member_id;

  -- Activity feed
  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    new.household_id,
    new.from_member_id,
    'points_gifted',
    jsonb_build_object(
      'from_member_id', new.from_member_id,
      'from_name', v_from_name,
      'to_member_id', new.to_member_id,
      'to_name', v_to_name,
      'points', new.points,
      'gift_type', new.gift_type,
      'note', new.note
    )
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_point_gift_insert
  after insert on public.point_gifts
  for each row execute procedure public.handle_point_gift();

-- ---------------------------------------------------------------------------
-- Trigger 9: on ai_verifications INSERT → update completion status
--   based on decision
-- ---------------------------------------------------------------------------
create or replace function public.handle_ai_verification()
returns trigger as $$
declare
  v_completion record;
  v_assignment record;
begin
  select * into v_completion from public.completions where id = new.completion_id;
  select * into v_assignment from public.assignments where id = v_completion.assignment_id;

  case new.decision
    when 'auto_approved' then
      update public.completions set
        status = 'ai_approved',
        ai_verification_id = new.id
      where id = new.completion_id;

      -- Activity feed
      insert into public.activity_feed (household_id, member_id, action_type, metadata)
      values (
        v_assignment.household_id,
        v_completion.completed_by,
        'ai_verified',
        jsonb_build_object(
          'decision', 'auto_approved',
          'confidence', new.confidence_score,
          'completion_id', new.completion_id
        )
      );

    when 'flagged_for_review' then
      update public.completions set
        status = 'pending_approval',
        needs_approval = true,
        ai_verification_id = new.id
      where id = new.completion_id;

    when 'auto_rejected' then
      update public.completions set
        status = 'rejected',
        rejection_reason = new.reasoning,
        ai_verification_id = new.id
      where id = new.completion_id;

      -- Reset assignment status so it can be re-done
      update public.assignments set status = 'pending', updated_at = now()
      where id = v_completion.assignment_id;
  end case;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_ai_verification_insert
  after insert on public.ai_verifications
  for each row execute procedure public.handle_ai_verification();

-- ---------------------------------------------------------------------------
-- Trigger 10: on settlements INSERT → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_settlement_insert()
returns trigger as $$
declare
  v_from_name text;
  v_to_name text;
begin
  select display_name into v_from_name from public.members where id = new.from_member_id;
  select display_name into v_to_name from public.members where id = new.to_member_id;

  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    new.household_id,
    new.created_by,
    'settlement_created',
    jsonb_build_object(
      'settlement_id', new.id,
      'from_name', v_from_name,
      'to_name', v_to_name,
      'description', new.description,
      'payout_type', new.payout_type,
      'amount_cents', new.amount_cents
    )
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_settlement_insert
  after insert on public.settlements
  for each row execute procedure public.handle_settlement_insert();

-- ---------------------------------------------------------------------------
-- Trigger 11: on settlements UPDATE (→settled) → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_settlement_settled()
returns trigger as $$
declare
  v_from_name text;
  v_to_name text;
begin
  if old.status != 'settled' and new.status = 'settled' then
    select display_name into v_from_name from public.members where id = new.from_member_id;
    select display_name into v_to_name from public.members where id = new.to_member_id;

    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.from_member_id,
      'settlement_settled',
      jsonb_build_object(
        'settlement_id', new.id,
        'from_name', v_from_name,
        'to_name', v_to_name,
        'settled_via', new.settled_via,
        'description', new.description
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_settlement_settled
  after update on public.settlements
  for each row
  when (old.status is distinct from new.status and new.status = 'settled')
  execute procedure public.handle_settlement_settled();

-- ---------------------------------------------------------------------------
-- Trigger 12: on settlements UPDATE (→forgiven) → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_settlement_forgiven()
returns trigger as $$
declare
  v_from_name text;
  v_to_name text;
begin
  if old.status != 'forgiven' and new.status = 'forgiven' then
    select display_name into v_from_name from public.members where id = new.from_member_id;
    select display_name into v_to_name from public.members where id = new.to_member_id;

    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.to_member_id,
      'settlement_forgiven',
      jsonb_build_object(
        'settlement_id', new.id,
        'from_name', v_from_name,
        'to_name', v_to_name,
        'description', new.description
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_settlement_forgiven
  after update on public.settlements
  for each row
  when (old.status is distinct from new.status and new.status = 'forgiven')
  execute procedure public.handle_settlement_forgiven();

-- ---------------------------------------------------------------------------
-- Trigger 13: on custom_badge_awards INSERT → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_custom_badge_award()
returns trigger as $$
declare
  v_badge record;
  v_member record;
begin
  select * into v_badge from public.custom_badges where id = new.badge_id;
  select * into v_member from public.members where id = new.member_id;

  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    v_badge.household_id,
    new.member_id,
    'custom_badge_earned',
    jsonb_build_object(
      'badge_name', v_badge.name,
      'badge_icon', v_badge.icon,
      'badge_color', v_badge.color,
      'badge_id', new.badge_id,
      'member_name', v_member.display_name
    )
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_custom_badge_award_insert
  after insert on public.custom_badge_awards
  for each row execute procedure public.handle_custom_badge_award();

-- ---------------------------------------------------------------------------
-- Trigger 14: on quick_tasks UPDATE (is_completed→true) → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_quick_task_completed()
returns trigger as $$
begin
  if old.is_completed = false and new.is_completed = true then
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.completed_by,
      'quick_task_completed',
      jsonb_build_object(
        'task_title', new.title,
        'task_id', new.id
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_quick_task_completed
  after update on public.quick_tasks
  for each row
  when (old.is_completed is distinct from new.is_completed and new.is_completed = true)
  execute procedure public.handle_quick_task_completed();

-- ---------------------------------------------------------------------------
-- Trigger 15: on assignment_comments INSERT → stub for push notification
-- ---------------------------------------------------------------------------
create or replace function public.handle_assignment_comment()
returns trigger as $$
begin
  -- Push notification is handled in the API layer.
  -- This trigger is a stub placeholder.
  return new;
end;
$$ language plpgsql security definer;

create trigger on_assignment_comment_insert
  after insert on public.assignment_comments
  for each row execute procedure public.handle_assignment_comment();

-- ---------------------------------------------------------------------------
-- Trigger 16: on snooze_requests INSERT (pending) → stub for push
-- ---------------------------------------------------------------------------
create or replace function public.handle_snooze_request_created()
returns trigger as $$
begin
  -- Push notification to parents is handled in the API layer.
  -- Insert activity feed
  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    new.household_id,
    new.requested_by,
    'assignment_snoozed',
    jsonb_build_object(
      'assignment_id', new.assignment_id,
      'reason', new.reason,
      'new_due_date', new.new_due_date,
      'snooze_request_id', new.id
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_snooze_request_insert
  after insert on public.snooze_requests
  for each row execute procedure public.handle_snooze_request_created();

-- ---------------------------------------------------------------------------
-- Trigger 17: on snooze_requests UPDATE (→approved) → update assignment,
--   activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_snooze_approved()
returns trigger as $$
begin
  if old.status != 'approved' and new.status = 'approved' then
    -- Update the assignment with new due date
    update public.assignments set
      due_date = new.new_due_date,
      due_time = new.new_due_time,
      original_due_date = coalesce(original_due_date, due_date),
      snooze_count = snooze_count + 1,
      status = 'pending',
      updated_at = now()
    where id = new.assignment_id;

    -- Activity feed
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.requested_by,
      'snooze_approved',
      jsonb_build_object(
        'assignment_id', new.assignment_id,
        'new_due_date', new.new_due_date,
        'reviewed_by', new.reviewed_by
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_snooze_approved
  after update on public.snooze_requests
  for each row
  when (old.status is distinct from new.status and new.status = 'approved')
  execute procedure public.handle_snooze_approved();

-- ---------------------------------------------------------------------------
-- Trigger 18: on snooze_requests UPDATE (→denied) → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_snooze_denied()
returns trigger as $$
begin
  if old.status != 'denied' and new.status = 'denied' then
    -- Activity feed with denial reason
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.requested_by,
      'snooze_denied',
      jsonb_build_object(
        'assignment_id', new.assignment_id,
        'denial_reason', new.denial_reason,
        'reviewed_by', new.reviewed_by
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_snooze_denied
  after update on public.snooze_requests
  for each row
  when (old.status is distinct from new.status and new.status = 'denied')
  execute procedure public.handle_snooze_denied();

-- ---------------------------------------------------------------------------
-- Trigger 19: on household_polls INSERT → activity feed
-- ---------------------------------------------------------------------------
create or replace function public.handle_poll_created()
returns trigger as $$
begin
  insert into public.activity_feed (household_id, member_id, action_type, metadata)
  values (
    new.household_id,
    new.created_by,
    'poll_created',
    jsonb_build_object(
      'poll_id', new.id,
      'question', new.question,
      'options_count', jsonb_array_length(new.options)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_poll_insert
  after insert on public.household_polls
  for each row execute procedure public.handle_poll_created();

-- ---------------------------------------------------------------------------
-- Trigger 20: on household_polls UPDATE (is_closed→true) → activity feed
--   with results
-- ---------------------------------------------------------------------------
create or replace function public.handle_poll_closed()
returns trigger as $$
begin
  if old.is_closed = false and new.is_closed = true then
    insert into public.activity_feed (household_id, member_id, action_type, metadata)
    values (
      new.household_id,
      new.created_by,
      'poll_closed',
      jsonb_build_object(
        'poll_id', new.id,
        'question', new.question,
        'votes', new.votes,
        'options', new.options
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_poll_closed
  after update on public.household_polls
  for each row
  when (old.is_closed is distinct from new.is_closed and new.is_closed = true)
  execute procedure public.handle_poll_closed();


-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default chore categories (global, household_id = null)
insert into public.chore_categories (id, household_id, name, icon, color, is_default) values
  (gen_random_uuid(), null, 'Kitchen',      'utensils',    '#f59e0b', true),
  (gen_random_uuid(), null, 'Bathroom',     'bath',        '#3b82f6', true),
  (gen_random_uuid(), null, 'Living Areas', 'sofa',        '#8b5cf6', true),
  (gen_random_uuid(), null, 'Bedroom',      'bed-double',  '#ec4899', true),
  (gen_random_uuid(), null, 'Outdoor',      'trees',       '#22c55e', true),
  (gen_random_uuid(), null, 'Laundry',      'shirt',       '#06b6d4', true),
  (gen_random_uuid(), null, 'Pets',         'dog',         '#f97316', true),
  (gen_random_uuid(), null, 'General',      'home',        '#6b7280', true);
