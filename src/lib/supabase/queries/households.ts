import { createClient } from "../client";
import type { Household } from "../types";

export async function getHousehold(id: string): Promise<Household | null> {
  const supabase = createClient();
  const { data } = await supabase.from("households").select("*").eq("id", id).single();
  return data as Household | null;
}

export async function createHousehold(params: {
  name: string;
  mode: string;
  createdBy: string;
  timezone?: string;
}): Promise<Household | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("households").insert({
    name: params.name,
    mode: params.mode,
    created_by: params.createdBy,
    timezone: params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).select().single();
  if (error) throw error;
  return data as Household;
}

export async function updateHousehold(id: string, updates: Partial<Household>) {
  const supabase = createClient();
  const { error } = await supabase.from("households").update(updates).eq("id", id);
  if (error) throw error;
}

export async function getHouseholdByInviteCode(code: string): Promise<Household | null> {
  // Uses API route with service-role client to bypass RLS —
  // new users who aren't members yet can't read the households table directly
  const res = await fetch(`/api/households/lookup?code=${encodeURIComponent(code)}`);
  if (!res.ok) return null;
  const { household } = await res.json();
  return household as Household | null;
}
