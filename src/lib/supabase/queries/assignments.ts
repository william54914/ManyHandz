import { createClient } from "../client";

export async function getAssignmentsForHousehold(householdId: string, filters?: {
  status?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from("assignments")
    .select("*, chores(*), members!assigned_to(*)")
    .eq("household_id", householdId);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.memberId) query = query.eq("assigned_to", filters.memberId);
  if (filters?.startDate) query = query.gte("due_date", filters.startDate);
  if (filters?.endDate) query = query.lte("due_date", filters.endDate);

  const { data, error } = await query.order("due_date");
  if (error) throw error;
  return data || [];
}

export async function getAssignment(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("assignments")
    .select("*, chores(*, chore_categories(*)), members!assigned_to(*), completions(*)")
    .eq("id", id)
    .single();
  return data;
}

export async function updateAssignmentStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("assignments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
