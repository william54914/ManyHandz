import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Look up a household by invite code.
 * Uses the service-role client to bypass RLS — new users who aren't
 * members yet need to be able to find households by invite code.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || code.length < 6 || code.length > 10) {
    return NextResponse.json(
      { error: "Invalid invite code" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("households")
    .select("id, name, mode, invite_code")
    .ilike("invite_code", code)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "No household found with this invite code" },
      { status: 404 }
    );
  }

  return NextResponse.json({ household: data });
}
