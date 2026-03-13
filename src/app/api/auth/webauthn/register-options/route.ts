import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get existing credentials
    const { data: existingCreds } = await supabase
      .from("webauthn_credentials")
      .select("id")
      .eq("user_id", user.id);

    const options = await generateRegistrationOptions({
      rpName: process.env.WEBAUTHN_RP_NAME!,
      rpID: process.env.WEBAUTHN_RP_ID!,
      userName: user.email!,
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      excludeCredentials: (existingCreds || []).map((c) => ({
        id: c.id,
        transports: ["internal" as const, "hybrid" as const],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Store challenge
    await supabase.from("webauthn_challenges").insert({
      user_id: user.id,
      challenge: options.challenge,
      type: "registration",
    });

    return NextResponse.json(options);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
