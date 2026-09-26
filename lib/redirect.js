// Shared by proxy.js and the login/register pages so the rule for "where may we
// send this user after authenticating" is defined exactly once.
//
// proxy.js already sanitises before it sets ?next=, but a hand-crafted
// /login?next=https://evil.example bypasses the proxy entirely, so the page that
// consumes the value has to validate it again.
const FALLBACK = "/";

export function safeNextPath(candidate, fallback = FALLBACK) {
  if (typeof candidate !== "string" || candidate === "") {
    return fallback;
  }

  // Single leading slash only: rejects absolute URLs and protocol-relative
  // "//evil.example", plus the "/\evil.example" variant some browsers normalise
  // back to a protocol-relative URL.
  if (!candidate.startsWith("/")) {
    return fallback;
  }

  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return fallback;
  }

  return candidate;
}

// Reads ?next= from the current URL. A useEffect is used rather than
// useSearchParams() because these pages are statically prerendered, and
// useSearchParams() would demand a <Suspense> boundary to build.
export function readNextParam() {
  if (typeof window === "undefined") {
    return FALLBACK;
  }

  try {
    const value = new URLSearchParams(window.location.search).get("next");
    return safeNextPath(value);
  } catch {
    return FALLBACK;
  }
}
