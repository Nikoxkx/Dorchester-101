import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — runs on Vercel Edge Runtime before the origin is hit.
 * Free on Hobby (counts toward function invocation quota).
 *
 * 1. Strip marketing query params (utm_*, gclid, fbclid) to prevent cache busting.
 * 2. Add security/caching hints that should be on every response, even static.
 * 3. No redirects for Vercel preview alias hosts — let Vercel's automatic
 *    X-Robots-Tag handle it so previews don't accidentally 308 away from QA.
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Strip tracking params without changing page content — one redirect, then cached.
  const tracking = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  let dirty = false;
  for (const key of tracking) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      dirty = true;
    }
  }

  if (dirty) {
    // Preserve other query params (e.g., ?q=, ?place=) which are legitimate.
    const clean = url.searchParams.toString();
    const dest = `${url.pathname}${clean ? `?${clean}` : ""}${url.hash}`;
    return NextResponse.redirect(new URL(dest, request.url), 308);
  }

  // Normal pass-through with extra headers
  const res = NextResponse.next();

  // Tell CDN/proxies that language influences content (we use client-side i18n
  // but also have lang-specific metadata).
  res.headers.set("Vary", "Accept-Language, Accept-Encoding");

  // API routes should never be indexed even if robots.txt is bypassed
  if (url.pathname.startsWith("/api/")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Well-known security.txt must be served as text/plain (belt-and-braces)
  if (url.pathname === "/security.txt" || url.pathname === "/.well-known/security.txt") {
    res.headers.set("Content-Type", "text/plain; charset=utf-8");
  }

  return res;
}

export const config = {
  // Don't run on static assets or Next internals — saves invocations.
  matcher: [
    // All routes except _next/static, _next/image, favicon, icons, img, sw
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|img/|sources/).*)",
  ],
};
