import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "completions";
    const format = searchParams.get("format") || "csv";
    const householdId = searchParams.get("household_id");
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!householdId) return NextResponse.json({ error: "household_id required" }, { status: 400 });

    let data: any[] = [];

    if (type === "completions") {
      let query = supabase
        .from("completions")
        .select("*, assignments(*, chores(*), members!assigned_to(display_name))")
        .eq("assignments.household_id", householdId);
      if (startDate) query = query.gte("completed_at", startDate);
      if (endDate) query = query.lte("completed_at", endDate);
      const result = await query;
      data = result.data || [];
    } else if (type === "fairness") {
      const { data: members } = await supabase
        .from("members")
        .select("*")
        .eq("household_id", householdId);
      data = members || [];
    } else if (type === "full") {
      // Full JSON backup
      const [chores, assignments, completions, members] = await Promise.all([
        supabase.from("chores").select("*").eq("household_id", householdId),
        supabase.from("assignments").select("*").eq("household_id", householdId),
        supabase.from("completions").select("*, assignments!inner(household_id)").eq("assignments.household_id", householdId),
        supabase.from("members").select("*").eq("household_id", householdId),
      ]);
      data = [{ chores: chores.data, assignments: assignments.data, completions: completions.data, members: members.data }];
    }

    if (format === "csv") {
      if (data.length === 0) return new NextResponse("No data", { status: 200 });
      const headers = Object.keys(data[0] || {});
      const csv = [headers.join(","), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))].join("\n");
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename=${type}_export.csv` },
      });
    }

    return NextResponse.json(data, {
      headers: format === "json" ? { "Content-Disposition": `attachment; filename=${type}_export.json` } : {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
