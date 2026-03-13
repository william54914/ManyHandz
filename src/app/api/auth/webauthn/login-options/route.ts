import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = createServiceClient();

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: credentials } = await supabase
      .from("webauthn_credentials")
      .select("id, transports")
      .eq("user_id", profile.id);

    if (!credentials?.length) {
      return NextResponse.json(
        { error: "No passkeys registered" },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.WEBAUTHN_RP_ID!,
      allowCredentials: credentials.map((c) => ({
        id: c.id,
        transports: (c.transports || []) as AuthenticatorTransportFuture[],
      })),
      userVerification: "preferred",
    });

    await supabase.from("webauthn_challenges").insert({
      user_id: profile.id,
      challenge: options.challenge,
      type: "authentication",
    });

    return NextResponse.json({ ...options, userId: profile.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
