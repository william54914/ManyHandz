import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export async function POST(request: Request) {
  try {
    const { credential: authResponse, userId } = await request.json();
    const supabase = createServiceClient();

    const { data: challengeRow } = await supabase
      .from("webauthn_challenges")
      .select("challenge")
      .eq("user_id", userId)
      .eq("type", "authentication")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!challengeRow)
      return NextResponse.json({ error: "No challenge" }, { status: 400 });

    const { data: storedCred } = await supabase
      .from("webauthn_credentials")
      .select("*")
      .eq("id", authResponse.id)
      .eq("user_id", userId)
      .single();

    if (!storedCred)
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 400 }
      );

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
      credential: {
        id: storedCred.id,
        publicKey: Buffer.from(storedCred.public_key, "base64"),
        counter: storedCred.counter,
        transports:
          storedCred.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 }
      );
    }

    // Update counter and last used
    await supabase
      .from("webauthn_credentials")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", storedCred.id);

    // Clean up
    await supabase
      .from("webauthn_challenges")
      .delete()
      .eq("user_id", userId)
      .eq("type", "authentication");

    // Get user profile for session creation
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    return NextResponse.json({ verified: true, email: profile?.email });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
