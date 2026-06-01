import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/callback",
  "/terms",
  "/privacy",
  "/join",
];

const AUTH_ROUTES = ["/login", "/signup"];
const ALWAYS_ALLOWED = ["/billing", "/api/stripe", "/api/auth/webauthn"];

// Routes that require auth but NOT a household (used for first-time setup,
// account management, and the billing paywall).
const NO_HOUSEHOLD_REQUIRED = ["/onboarding", "/billing", "/profile"];

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com; font-src 'self'"
  );
  return response;
}

async function userHasActiveHousehold(
  request: NextRequest,
  userId: string
): Promise<boolean> {
  // Use a lightweight Supabase client (just for this read) — re-uses the
  // cookies on the request so RLS can run as the user.
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // no-op — we don't need to set cookies for this read
        },
      },
    }
  );
  const { data, error } = await client
    .from("members")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and PWA assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/screenshots") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Webhook routes skip auth but get security headers
  if (
    pathname === "/api/stripe/webhook" ||
    pathname === "/api/webhooks/supabase"
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Cron routes verify CRON_SECRET
  if (pathname.startsWith("/api/cron/")) {
    const cronSecret = request.headers.get("authorization");
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return addSecurityHeaders(NextResponse.next());
  }

  const { user, response } = await updateSession(request);

  // Redirect authenticated users away from auth routes
  if (user && AUTH_ROUTES.some((r) => pathname === r)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return addSecurityHeaders(NextResponse.redirect(url));
  }

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isAlwaysAllowed = ALWAYS_ALLOWED.some((r) => pathname.startsWith(r));
  const isApi = pathname.startsWith("/api/");

  if (!isPublic && !isAlwaysAllowed && !isApi) {
    // Protected route — require auth
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return addSecurityHeaders(NextResponse.redirect(url));
    }

    // Authenticated but no household? Redirect to /onboarding unless they're
    // already on a no-household-required route.
    const allowsNoHousehold =
      pathname === "/onboarding" ||
      pathname.startsWith("/onboarding/") ||
      NO_HOUSEHOLD_REQUIRED.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
      );
    if (!allowsNoHousehold) {
      const hasHousehold = await userHasActiveHousehold(request, user.id);
      if (!hasHousehold) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return addSecurityHeaders(NextResponse.redirect(url));
      }
    }
  }

  // Subscription enforcement is handled at the DB level via RLS policies.
  return addSecurityHeaders(response);
}

// Next 16 expects a default export when the file is named `proxy.ts`.
// We also keep `middleware` as a named export for backwards compatibility
// with any tooling that still scans for it.
export default proxy;
export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
