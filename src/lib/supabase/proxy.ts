import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every matched request so Server
// Components always see a valid token. Does not redirect: pages do their own
// auth checks, and RLS is the real data boundary.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Forward refreshed cookies to Server Components (request) and to
          // the browser (response).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // No-cache headers so a CDN never serves one user's session to another.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not put code between createServerClient and getClaims(): getClaims()
  // is what triggers the token refresh. It also verifies the JWT signature,
  // unlike getSession(), which trusts the cookie as-is.
  await supabase.auth.getClaims();

  return response;
}
