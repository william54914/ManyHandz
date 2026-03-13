-- ============================================================================
-- Add approval status to goals for kid-created goals in family mode.
-- Parents auto-approve; kid-created goals start as 'pending_approval'.
-- ============================================================================

-- 1. Expand the status CHECK to allow 'pending_approval'
alter table public.goals drop constraint if exists goals_status_check;
alter table public.goals
  add constraint goals_status_check
  check (status in ('active', 'completed', 'canceled', 'pending_approval'));

-- 2. Add approval tracking fields
alter table public.goals
  add column if not exists approved_by uuid references public.members(id),
  add column if not exists approved_at timestamptz;

-- 3. Allow 0 in auto_contribute_percentage for when it's disabled
alter table public.goals drop constraint if exists goals_auto_contribute_percentage_check;
alter table public.goals
  add constraint goals_auto_contribute_percentage_check
  check (auto_contribute_percentage in (0, 10, 25, 50, 75, 100));
