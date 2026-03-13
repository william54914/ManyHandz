// ============================================================================
// ManyHandz — Cron: Check Overdue Assignments
// Hourly: finds all pending/in_progress assignments past their due date,
// marks them overdue, resets member streaks, creates activity feed entries,
// and sends push notifications to affected members.
// ============================================================================

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPushToUser } from "@/lib/utils/push";

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

    // 1. Find all assignments that are past due and still pending or in_progress
    const { data: overdueAssignments, error: fetchError } = await supabase
      .from("assignments")
      .select("id, assigned_to, household_id, chore_id, due_date, chores(name)")
      .in("status", ["pending", "in_progress"])
      .lt("due_date", today);

    if (fetchError) throw fetchError;

    if (!overdueAssignments?.length) {
      return NextResponse.json({
        success: true,
        overdueCount: 0,
        message: "No overdue assignments found",
      });
    }

    // 2. Batch update all overdue assignments
    const overdueIds = overdueAssignments.map((a) => a.id);

    const { error: updateError } = await supabase
      .from("assignments")
      .update({
        status: "overdue",
        updated_at: now.toISOString(),
      })
      .in("id", overdueIds);

    if (updateError) throw updateError;

    // 3. Reset current_streak to 0 for all affected members
    const uniqueMemberIds = [
      ...new Set(overdueAssignments.map((a) => a.assigned_to)),
    ];

    for (const memberId of uniqueMemberIds) {
      const { error: streakError } = await supabase
        .from("members")
        .update({ current_streak: 0 })
        .eq("id", memberId);

      if (streakError) {
        console.error(
          `Failed to reset streak for member ${memberId}:`,
          streakError
        );
      }
    }

    // 4. Create activity feed entries for each overdue assignment
    const activityEntries = overdueAssignments.map((a) => ({
      household_id: a.household_id,
      member_id: a.assigned_to,
      action_type: "chore_assigned" as const,
      metadata: {
        event: "overdue",
        assignment_id: a.id,
        chore_id: a.chore_id,
        chore_name: (a.chores as any)?.name || "Unknown chore",
        due_date: a.due_date,
      },
      reactions: {},
    }));

    const { error: activityError } = await supabase
      .from("activity_feed")
      .insert(activityEntries);

    if (activityError) {
      console.error("Failed to create activity feed entries:", activityError);
    }

    // 5. Send push notifications to overdue members
    // Collect member user_ids for push notifications
    const { data: members } = await supabase
      .from("members")
      .select("id, user_id, display_name")
      .in("id", uniqueMemberIds);

    const memberMap = new Map(
      (members || []).map((m) => [m.id, m])
    );

    for (const assignment of overdueAssignments) {
      const member = memberMap.get(assignment.assigned_to);
      if (!member?.user_id) continue;

      const choreName = (assignment.chores as any)?.name || "a chore";

      try {
        await sendPushToUser(member.user_id, {
          title: "Overdue Assignment",
          body: `Your assignment "${choreName}" is now overdue. Please complete it as soon as possible!`,
          icon: "/icons/warning.png",
          tag: `overdue-${assignment.id}`,
          data: {
            url: `/assignments/${assignment.id}`,
            type: "overdue",
          },
          actions: [
            { action: "view", title: "View Assignment" },
            { action: "complete", title: "Mark Complete" },
          ],
        });
      } catch (pushError) {
        console.error(
          `Failed to send push notification to user ${member.user_id}:`,
          pushError
        );
      }
    }

    return NextResponse.json({
      success: true,
      overdueCount: overdueAssignments.length,
      membersAffected: uniqueMemberIds.length,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cron check-overdue error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
