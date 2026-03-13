// ============================================================================
// ManyHandz — Cron: Rotate Assignments
// Advances rotation groups whose period has elapsed, creates new assignments
// for the next member in the rotation order (skipping away members).
// Schedule: matches each rotation group's frequency (daily/weekly/biweekly/monthly)
// ============================================================================

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getNextAssignee,
  type RotationGroup as RotationGroupUtil,
} from "@/lib/utils/rotation";

export async function POST(request: Request) {
  // Double-check cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Get all active rotation groups
    const { data: rotationGroups, error: rgError } = await supabase
      .from("rotation_groups")
      .select("*, chores(*)")
      .eq("is_active", true);

    if (rgError) throw rgError;
    if (!rotationGroups?.length) {
      return NextResponse.json({
        success: true,
        created: 0,
        message: "No active rotation groups",
      });
    }

    // 2. Get all currently away members (away_until >= today or null away_until with is_active away state)
    const { data: awayMembers } = await supabase
      .from("members")
      .select("id")
      .eq("is_active", true)
      .gte("away_until", today);

    const awayMemberIds = (awayMembers || []).map((m) => m.id);

    let createdCount = 0;

    for (const rg of rotationGroups) {
      // Check if the rotation period has elapsed
      const startDate = new Date(rg.start_date);
      const diffMs = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) continue; // Not started yet

      let intervalDays: number;
      switch (rg.frequency) {
        case "daily":
          intervalDays = 1;
          break;
        case "weekly":
          intervalDays = 7;
          break;
        case "biweekly":
          intervalDays = 14;
          break;
        case "monthly":
          intervalDays = 30;
          break;
        default:
          continue;
      }

      // Check if today is a rotation day: must be on an interval boundary
      // For daily, every day qualifies; for weekly, every 7th day from start, etc.
      if (diffDays === 0 || diffDays % intervalDays !== 0) continue;

      // Check if an assignment already exists for today to prevent duplicates
      const { data: existing } = await supabase
        .from("assignments")
        .select("id")
        .eq("rotation_group_id", rg.id)
        .eq("due_date", today)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Build the rotation group utility interface
      const utilGroup: RotationGroupUtil = {
        id: rg.id,
        choreId: rg.chore_id,
        memberOrder: rg.member_order || [],
        currentIndex: rg.current_index,
        rotationType: rg.rotation_type,
        frequency: rg.frequency,
        startDate: rg.start_date,
        isActive: rg.is_active,
      };

      // Filter away members to only those in this rotation group
      const groupAwayIds = awayMemberIds.filter((id) =>
        utilGroup.memberOrder.includes(id)
      );

      const { memberId, newIndex } = getNextAssignee(utilGroup, groupAwayIds);

      if (!memberId) continue; // All members are away

      // Calculate due date based on frequency
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + intervalDays);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      // 3. Create the new assignment
      const { error: insertError } = await supabase
        .from("assignments")
        .insert({
          chore_id: rg.chore_id,
          household_id: rg.household_id,
          assigned_to: memberId,
          rotation_group_id: rg.id,
          due_date: dueDateStr,
          status: "pending",
          checklist_progress: [],
        });

      if (insertError) {
        console.error(
          `Failed to create assignment for rotation group ${rg.id}:`,
          insertError
        );
        continue;
      }

      // 4. Update the rotation group's current_index
      const { error: updateError } = await supabase
        .from("rotation_groups")
        .update({ current_index: newIndex })
        .eq("id", rg.id);

      if (updateError) {
        console.error(
          `Failed to update rotation group index ${rg.id}:`,
          updateError
        );
      }

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      created: createdCount,
      totalGroups: rotationGroups.length,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cron rotate-assignments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
