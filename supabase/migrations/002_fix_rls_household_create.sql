-- ============================================================================
-- Fix: households SELECT policy for INSERT...RETURNING
-- ============================================================================
-- When the Supabase client does .insert().select().single(), PostgreSQL checks
-- both the INSERT policy (WITH CHECK) *and* the SELECT policy (USING).
-- The current SELECT policy uses user_household_ids() which queries the members
-- table — but at INSERT time, the creator isn't yet a member of the new
-- household, so the SELECT policy fails with an RLS violation.
--
-- Fix: allow the household creator to also read their own household.
-- ============================================================================

drop policy if exists "households_select" on public.households;
create policy "households_select" on public.households for select
  using (
    id = any(user_household_ids())
    or created_by = auth.uid()
  );

-- ============================================================================
-- Fix: subscriptions INSERT policy for trial creation during onboarding
-- ============================================================================
-- The original schema had no INSERT policy on subscriptions (by design, it was
-- managed via service_role in the webhook handler). However during onboarding,
-- the client-side code creates a trial subscription, so we need an INSERT
-- policy that allows users to insert their own subscription.
-- ============================================================================

create policy "subscriptions_insert" on public.subscriptions for insert
  with check (
    user_id = auth.uid()
    and status = 'trialing'
  );

-- Also allow users to read subscriptions for their household (not just their own user_id).
-- This helps when checking household subscription status.
drop policy if exists "subscriptions_select" on public.subscriptions;
create policy "subscriptions_select" on public.subscriptions for select
  using (
    user_id = auth.uid()
    or household_id = any(user_household_ids())
  );

-- ============================================================================
-- Fix: members SELECT policy for INSERT...RETURNING
-- ============================================================================
-- Same pattern as households: joinHousehold() does .insert().select().single()
-- which needs the SELECT policy to pass. user_household_ids() queries the
-- members table, but the row being inserted doesn't exist yet.
--
-- Fix: allow users to always read their own member rows.
-- ============================================================================

drop policy if exists "members_select" on public.members;
create policy "members_select" on public.members for select
  using (
    household_id = any(user_household_ids())
    or user_id = auth.uid()
  );
