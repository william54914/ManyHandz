import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { status, rejection_reason } = body;

    // Get the completion for this assignment
    const { data: completion } = await supabase
      .from("completions")
      .select("*, assignments(household_id)")
      .eq("assignment_id", id)
      .eq("status", "pending_approval")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (!completion) {
      return NextResponse.json(
        { error: "No pending completion found" },
        { status: 404 }
      );
    }

    // Verify user is an admin in this household
    const { data: member } = await supabase
      .from("members")
      .select("id, role")
      .eq(
        "household_id",
        (completion.assignments as Record<string, unknown>)
          ?.household_id as string
      )
      .eq("user_id", user.id)
      .single();

    if (!member || !["parent", "manager"].includes(member.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status === "approved") {
      const { error } = await supabase
        .from("completions")
        .update({
          status: "approved",
          approved_by: member.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", completion.id);
      if (error) throw error;
    } else if (status === "rejected") {
      const { error: compError } = await supabase
        .from("completions")
        .update({
          status: "rejected",
          rejection_reason: rejection_reason || "Needs more work",
          approved_by: member.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", completion.id);
      if (compError) throw compError;

      // Return assignment to in_progress
      await supabase
        .from("assignments")
        .update({ status: "in_progress" })
        .eq("id", id);
    }

    return NextResponse.json({ success: true, status });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
