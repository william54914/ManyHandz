-- Add 'pending_review' to the assignments status CHECK constraint.
-- This status is used when a kid completes a chore that requires parent approval.

alter table public.assignments
  drop constraint if exists assignments_status_check;

alter table public.assignments
  add constraint assignments_status_check
  check (status in ('pending', 'completed', 'overdue', 'skipped', 'in_progress', 'pending_review', 'snoozed_pending_approval'));
