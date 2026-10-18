import { NextResponse } from "next/server";

/**
 * Vercel Cron — daily cache warm.
 * Free on Hobby: up to 100 crons, once/day per cron.
 * Schedule in vercel.json: "0 9 * * *" (09:00 UTC = 05:00 ET).
 *
 * Vercel invokes this with `Authorization: Bearer <CRON_SECRET>` automatically
 * when CRON_SECRET is set as env var. We also accept the internal
 * `x-vercel-cron: 1` header as secondary proof.
 * If CRON_SECRET is not configured, any caller may trigger it (safe: it's just a warm).
 */
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured => allow (dev)

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  // Vercel's Cron header (documented) — only present on real cron invocations
  if (req.headers.get("x-vercel-cron") === "1") return true;

  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: { "x-robots-tag": "noindex" } });
  }

  const origin = new URL(req.url).origin;
  const routes = [
    "/api/news?limit=10&sinceHours=168",
    "/api/market-data",
    "/api/resources?limit=5",
    "/api/notifications",
  ];

  const results: Array<{ path: string; status: number | string }> = [];

  await Promise.all(
    routes.map(async (path) => {
      try {
        const res = await fetch(`${origin}${path}`, { cache: "no-store" });
        results.push({ path, status: res.status });
      } catch (e) {
        results.push({ path, status: String(e) });
      }
    }),
  );

  return NextResponse.json(
    { ok: true, refreshedAt: new Date().toISOString(), results },
    { headers: { "x-robots-tag": "noindex", "cache-control": "no-store" } },
  );
}
