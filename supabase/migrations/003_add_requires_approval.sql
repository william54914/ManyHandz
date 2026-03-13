-- Add per-chore approval toggle. Defaults to true so existing behavior
-- (all kid completions require approval in family mode) is preserved.
-- Parents can opt specific chores out of requiring approval.
alter table public.chores
  add column requires_approval boolean not null default true;
