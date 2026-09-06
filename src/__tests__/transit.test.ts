/**
 * Transit reference data is hand-checked against mbta.com, so the risk is not
 * arithmetic, it is drift: a route id that stops matching the API, a stop that
 * is not inside the map's bounds, a fallback polyline that starts somewhere
 * other than the station it claims, or a degraded response that quietly looks
 * like live data. Each test below pins one of those.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL_LINES_BY_ROUTE,
  DORCHESTER_BUS_ROUTES,
  TRANSIT_DATA_AS_OF,
  TRANSIT_LINES,
  allTransitStops,
  lineById,
} from "@/data/transit";
import { hhmm } from "@/lib/hours";
import { estimateArrivals, fetchArrivals } from "@/lib/mbta";

// Saturday 5 September 2026, 10:30 in Boston — inside every service window.
const BOSTON_MORNING = new Date("2026-09-05T14:30:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BOSTON_MORNING);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("route data shape", () => {
  it("uses the ids the MBTA API itself publishes", () => {
    expect(TRANSIT_LINES.map((line) => line.routeId)).toEqual([
      "Red",
      "Red",
      "Mattapan",
      "CR-Fairmount",
    ]);
    expect(TRANSIT_LINES.map((line) => line.mode)).toEqual([
      "subway",
      "subway",
      "trolley",
      "rail",
    ]);
    expect(ALL_LINES_BY_ROUTE.Red).toHaveLength(2);
    expect(ALL_LINES_BY_ROUTE.Mattapan).toHaveLength(1);
    expect(lineById("red-ashmont")?.name).toBe("Red Line, Ashmont branch");
    expect(lineById("no-such-line")).toBeUndefined();
  });

  it("lists the Dorchester bus routes as numbers, without duplicates", () => {
    const ids = DORCHESTER_BUS_ROUTES.map((route) => route.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    for (const route of DORCHESTER_BUS_ROUTES) {
      expect(route.id).toMatch(/^\d{1,3}$/);
      expect(route.headwayMinutes).toBeGreaterThan(0);
      expect(route.longName).toContain(" - ");
      expect(route.corridors.length).toBeGreaterThan(0);
      expect(typeof route.frequent).toBe("boolean");
    }
    expect(ids).toContain("66");
    expect(ids).toContain("240");
  });

  it("exposes every stop with the line it belongs to", () => {
    const stops = allTransitStops();
    expect(stops.length).toBeGreaterThanOrEqual(16);
    for (const stop of stops) expect(stop.lineId).toBeTruthy();
    const jfk = stops.filter((stop) => stop.id === "place-jfk");
    expect(jfk.length).toBeGreaterThanOrEqual(1);
    expect(jfk.every((stop) => stop.accessible)).toBe(true);
  });
});

describe("geometry and stops", () => {
  it("keeps every Dorchester stop inside the map bounds", () => {
    for (const line of TRANSIT_LINES) {
      for (const stop of line.dorchesterStops) {
        expect(stop.lat).toBeGreaterThan(42.24);
        expect(stop.lat).toBeLessThan(42.39);
        expect(stop.lng).toBeGreaterThan(-71.13);
        expect(stop.lng).toBeLessThan(-71.02);
        expect(stop.name.length).toBeGreaterThan(1);
      }
    }
  });

  it("draws each fallback polyline inside Greater Boston, touching Dorchester", () => {
    for (const line of TRANSIT_LINES) {
      const path = line.fallbackPath;
      if (!path) continue;
      expect(path.length).toBeGreaterThan(2);
      for (const [lat, lng] of path) {
        expect(lat).toBeGreaterThan(42.15);
        expect(lat).toBeLessThan(42.45);
        expect(lng).toBeLessThan(-70.9);
        expect(lng).toBeGreaterThan(-71.3);
      }
      // At least one vertex must sit on a Dorchester stop, or the highlighted
      // segment would never reach the neighbourhood the page is about.
      const touches = line.dorchesterStops.some((stop) =>
        path.some(
          ([lat, lng]) =>
            Math.abs(lat - stop.lat) < 0.004 &&
            Math.abs(lng - stop.lng) < 0.004,
        ),
      );
      expect(touches, `${line.id} fallback path misses its own stops`).toBe(
        true,
      );
    }
  });

  it("states when the reference data was checked, and keeps the clocks parseable", () => {
    expect(TRANSIT_DATA_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const line of TRANSIT_LINES) {
      expect(line.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(line.headwayMinutes).toBeGreaterThan(0);
      expect(line.peakHeadwayMinutes).toBeLessThanOrEqual(line.headwayMinutes);
      // Parsed by the same strict reader the hours tables use.
      expect(() => hhmm(line.firstDeparts)).not.toThrow();
      expect(() => hhmm(line.lastDeparts)).not.toThrow();
      expect(line.fare.CharlieCardUsd).toBeGreaterThan(0);
    }
  });
});

describe("estimateArrivals", () => {
  it("produces departures for a Dorchester station from the published headway", () => {
    const arrivals = estimateArrivals(["place-fldcr"]);
    expect(arrivals.length).toBeGreaterThan(0);
    for (const arrival of arrivals) {
      expect(arrival.routeId).toBe("Red");
      expect(arrival.stopName).toBe("Fields Corner");
      expect(arrival.status).toBe("scheduled");
      expect(arrival.minutesAway).toBeGreaterThanOrEqual(0);
      expect(arrival.minutesAway).toBeLessThan(30);
    }
    // Both branches of the loop are populated: inbound and outbound ends named.
    const heads = new Set(arrivals.map((arrival) => arrival.headsign));
    expect(heads.size).toBe(2);
  });

  it("is deterministic, so a reload does not shuffle the board", () => {
    expect(estimateArrivals(["place-ashmt", "place-fldcr"])).toEqual(
      estimateArrivals(["place-ashmt", "place-fldcr"]),
    );
  });

  it("says nothing about a stop it has no timetable for", () => {
    expect(estimateArrivals(["place-north"])).toEqual([]);
  });

  it("stays silent outside the service window instead of inventing a train", () => {
    vi.setSystemTime(new Date("2026-09-05T08:00:00Z")); // 04:00 in Boston
    expect(estimateArrivals(["place-fldcr"])).toEqual([]);
  });
});

describe("fetchArrivals degradation", () => {
  it("falls back to the timetable and flags why", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const result = await fetchArrivals(["place-fldcr"]);
    expect(result.source).toBe("timetable");
    expect(result.degradedReason).toContain("network down");
    expect(result.arrivals.length).toBeGreaterThan(0);
    expect(
      result.arrivals.every((arrival) => arrival.status === "scheduled"),
    ).toBe(true);
    vi.unstubAllGlobals();
  });
});
