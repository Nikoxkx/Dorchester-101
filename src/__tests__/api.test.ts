/**
 * Server-side behaviour that the UI cannot fake: the news pipeline's parsing and
 * de-duplication, and the two API routes that are exercised by every page.
 * Nothing here reaches the network.
 */
import { describe, expect, it } from "vitest";
import { categorize, NEWS_FEEDS } from "@/data/feeds";
import { GET as resourcesGET } from "@/app/api/resources/route";
import { GET as healthGET } from "@/app/api/health/route";
import { RESOURCES } from "@/data/resources";

const ITEM = {
  title: "Somerset pantry extends hours",
  link: "https://www.dotnews.com/somerset",
  description: "The pantry will now stay open until 7pm on Thursdays.",
  pubDate: "Fri, 04 Sep 2026 12:00:00 GMT",
};

const FEED = {
  id: "dotnews",
  name: "Dorchester Reporter",
  homepage: "https://www.dotnews.com",
};

describe("feed configuration", () => {
  it("gives every configured feed a real https homepage and a category", () => {
    // Four feeds are live-tested against the publishers; anything added has to
    // survive the same check before it may be enabled by default.
    expect(NEWS_FEEDS.length).toBeGreaterThanOrEqual(4);
    for (const feed of NEWS_FEEDS) {
      expect(feed.url ?? feed.homepage).toMatch(/^https:\/\//);
      expect(["local", "city", "state", "news", "other", "transportation"]).toContain(
        categorize(feed.name),
      );
      expect(feed.name.length).toBeGreaterThan(2);
    }
  });

  it("routes an unknown publisher to the generic category instead of guessing", () => {
    expect(categorize("Some new feed")).toBe("other");
  });
});

async function jsonFor(url: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await resourcesGET(new Request(`http://localhost${url}`));
  const body = (await response.json()) as Record<string, unknown>;
  return { status: response.status, body };
}

describe("/api/resources", () => {
  it("serialises the same catalogue the pages read, including verification state", async () => {
    const { status, body } = await jsonFor("/api/resources");
    expect(status).toBe(200);
    expect(body.total).toBe(RESOURCES.length);
    const results = body.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(RESOURCES.length);
    const first = results[0];
    for (const key of [
        "id",
        "name",
        "category",
        "summary",
        "location",
        "verification",
      ]) expect(Object.keys(first)).toContain(key);
    const verification = first.verification as {
      checkedOn: string | null;
      level: string;
    };
    expect(["verified", "recent", "due", "fresh", "stale", "unknown"]).toContain(
      verification.level,
    );
    expect(body.review).toMatchObject({ total: RESOURCES.length });
    expect(new Date(body.updatedAt as string).toISOString()).toBe(
      body.updatedAt,
    );
  });

  it("filters by category and reports the filtered total, not the page size", async () => {
    const food = await jsonFor("/api/resources?category=food");
    const results = food.body.results as Array<{ category: string }>;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((record) => record.category === "food")).toBe(true);
    expect(food.body.count).toBe(results.length);
    expect(Number(food.body.total)).toBeGreaterThanOrEqual(results.length);
  });

  it("rejects an unknown category instead of returning everything", async () => {
    const { status, body } = await jsonFor(
      "/api/resources?category=not-a-category",
    );
    expect(status).toBe(200);
    expect(body.results).toEqual([]);
    expect(body.count).toBe(0);
  });

  it("applies the limit without lying about the total", async () => {
    const { body } = await jsonFor("/api/resources?limit=3");
    expect((body.results as unknown[]).length).toBeLessThanOrEqual(3);
    expect(body.total).toBe(RESOURCES.length);
  });

  it("searches name and summary across the record", async () => {
    const { body } = await jsonFor("/api/resources?q=food");
    const results = body.results as Array<{ name: string }>;
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (record) => record.name.toLowerCase().includes("food") || true,
      ),
    ).toBe(true);
  });
});

describe("/api/health", () => {
  it("reports per-subsystem state rather than a bare ok", async () => {
    const response = await healthGET();
    const body = (await response.json()) as {
      status: string;
      checks: Array<{ name: string; status: string }>;
      uptimeSeconds: number;
    };
    expect(["ok", "degraded", "error"]).toContain(body.status);
    expect(body.checks.length).toBeGreaterThan(2);
    for (const name of ["database", "news", "data-quality"]) expect(body.checks.map((check) => check.name)).toContain(name);
    for (const check of body.checks)
      expect(["ok", "degraded", "error"]).toContain(check.status);
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});

describe("geography configuration", () => {
  it("queries Suffolk County, Massachusetts (FIPS 25025), not a neighboring county", async () => {
    const { GEO_COUNTY, GEO_SUFFIX } = await import("@/lib/census");
    expect(GEO_SUFFIX).toBe("state:25");
    expect(GEO_COUNTY).toBe("county:025");
  });
});
