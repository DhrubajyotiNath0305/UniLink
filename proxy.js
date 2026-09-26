import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { safeNextPath } from "@/lib/redirect";

// Next.js 16 deprecated the middleware.js convention in favour of proxy.js.
// Proxy runs on the Node.js runtime by default; declaring a `runtime` config in
// this file would throw.
//
// This is an optimistic gate for navigation, not a security boundary. Every API
// route still authorises with requireUser() (lib/auth.js), so a forged cookie
// only ever reaches a page shell -- never data.
const AUTH_COOKIE = "token";

// Screens that exist only to authenticate. A signed-in visitor has no reason to
// see them, so they bounce to the feed.
const AUTH_PAGES = new Set(["/login", "/register"]);

// Reachable without a session. "/" serves the landing page when signed out and
// the feed when signed in, so it has to fall through untouched rather than be
// bounced to /login like every other protected path.
const PUBLIC_PATHS = new Set(["/", ...AUTH_PAGES]);

async function isSignedIn(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return false;
  }

  try {
    const payload = await verifyAccessToken(token);
    return typeof payload.userId === "number";
  } catch {
    // Expired or tampered token: treat as signed out and let the user re-auth.
    return false;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const signedIn = await isSignedIn(request);

  // Gate the auth screens themselves: a signed-in visitor has no use for the
  // login or registration form.
  if (AUTH_PAGES.has(pathname)) {
    return signedIn
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  // "/" is public by design (landing page or feed, chosen below by the client),
  // so it never reaches this branch.
  if (!signedIn && !PUBLIC_PATHS.has(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", safeNextPath(`${pathname}${search}`));

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Must stay a static literal: matcher values are statically analysed at build
// time, so a computed pattern would be ignored. The exclusions keep the gate
// off /api (which returns real 401s) and off asset requests, which would
// otherwise be redirected and break the page's CSS and JS.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpe?g|gif|webp|ico|woff2?|ttf|css|js|map|txt|xml|webmanifest)$).*)",
  ],
};
