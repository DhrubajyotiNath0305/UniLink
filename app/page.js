import { getSession } from "@/lib/auth";
import Feed from "@/components/Feed";
import Landing from "@/components/Landing";

// "/" is the app's front door, and the choice between landing page and feed is
// made here rather than in client state.
//
// getSession() verifies the cookie during render, so the landing page ships in
// the initial HTML for signed-out visitors: no loader, no redirect to /login,
// and no wait on /api/auth/me -- which would cost a database round trip before
// anything could appear. Signed-in visitors get the feed, so they never see the
// landing page flash past while auth bootstraps.
export default async function Home() {
  const session = await getSession();

  return session ? <Feed /> : <Landing />;
}
