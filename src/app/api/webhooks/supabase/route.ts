import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    // Verify webhook (in production, verify signature)
    const payload = await request.json();
    const supabase = createServiceClient();

    // Handle different webhook events
    const { type, table, record, old_record } = payload;

    switch (table) {
      case "completions":
        if (type === "INSERT") {
          // Could trigger push notifications here
          console.log("New completion:", record.id);
        }
        break;
      case "assignments":
        if (type === "UPDATE" && record.status === "overdue" && old_record?.status !== "overdue") {
          console.log("Assignment became overdue:", record.id);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
