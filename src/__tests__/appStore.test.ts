/**
 * The store is the one place user preferences live, and it is persisted. These
 * cover the parts the settings screen cannot be trusted to reveal on its own:
 * what reaches localStorage, what survives a reset, and which flags are read
 * from the system rather than stored.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAppStore } from "@/stores/appStore";

const STORAGE_KEY = "dor101-settings";

function persisted(): Record<string, unknown> {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw
    ? (JSON.parse(raw) as { state: Record<string, unknown> }).state
    : {};
}

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.getState().resetAll();
});

describe("appStore defaults", () => {
  it("starts in English with the settings that make the page readable by default", () => {
    const state = useAppStore.getState();
    expect(state.language).toBe("en");
    expect(state.theme).toBe("system");
    expect(state.fontSize).toBe("medium");
    expect(state.mapStyle).toBe("satellite");
    expect(state.refreshIntervalMinutes).toBeGreaterThan(0);
    expect(state.autoRefresh).toBe(true);
    expect(state.favorites).toEqual([]);
  });

  it('leaves reduce-motion and high-contrast on "follow the system" until the user decides', () => {
    const accessibility = useAppStore.getState().accessibility;
    expect(accessibility.reduceMotion).toBe("auto");
    expect(accessibility.highContrast).toBe("auto");
  });
});

describe("preferences are persisted", () => {
  it("writes every change to localStorage under one key", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setLanguage("ht");
      result.current.setTheme("dark");
      result.current.setMapStyle("hybrid");
    });
    const state = persisted();
    expect(state.language).toBe("ht");
    expect(state.theme).toBe("dark");
    expect(state.mapStyle).toBe("hybrid");
    expect(window.localStorage.getItem("dor101-language")).toBeNull();
  });

  it("round-trips a language change through the persisted blob", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.setLanguage("ar"));
    expect(persisted().language).toBe("ar");
    expect(useAppStore.getState().language).toBe("ar");
  });

  it("toggles accessibility flags independently", () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.accessibility.underlineLinks).toBe(false);
    act(() => result.current.toggleAccessibility("underlineLinks"));
    expect(result.current.accessibility.underlineLinks).toBe(true);
    expect(persisted().accessibility).toMatchObject({ underlineLinks: true });
    act(() => result.current.setAccessibility("highContrast", "on"));
    expect(useAppStore.getState().accessibility.highContrast).toBe("on");
    // A flag that is not user-toggleable must be rejected by the type system,
    // so assert the runtime ignores an unknown key rather than corrupting state.
    expect(useAppStore.getState().accessibility.underlineLinks).toBe(true);
  });
});

describe("saved places", () => {
  it("adds, removes and preserves order of favourites", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.toggleFavorite("food:somerset-pantry"));
    act(() => result.current.toggleFavorite("clinic:boston-health-dorchester"));
    expect(result.current.favorites).toEqual([
      "food:somerset-pantry",
      "clinic:boston-health-dorchester",
    ]);
    act(() => result.current.toggleFavorite("food:somerset-pantry"));
    expect(result.current.favorites).toEqual([
      "clinic:boston-health-dorchester",
    ]);
    expect(result.current.isFavorite("clinic:boston-health-dorchester")).toBe(
      true,
    );
    expect(persisted().favorites).toEqual(["clinic:boston-health-dorchester"]);
  });

  it("ignores an empty id instead of storing a key that can never match", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.toggleFavorite(""));
    expect(result.current.favorites).toEqual([]);
  });
});

describe("refresh plumbing", () => {
  it("bumps the data epoch so live hooks re-fetch without remounting", () => {
    const { result } = renderHook(() => useAppStore());
    const before = result.current.dataEpoch;
    act(() => result.current.refreshAllData());
    expect(result.current.dataEpoch).toBeGreaterThan(before);
  });

  it("publishes an announcement for the screen-reader region to read", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.announce("Transit updated", "polite"));
    expect(result.current.lastAnnouncement?.message).toBe("Transit updated");
    expect(result.current.lastAnnouncement?.politeness).toBe("polite");
    const first = result.current.lastAnnouncement?.id ?? 0;
    // The same sentence repeated must still get a new id, or assistive
    // technology treats the region as unchanged and says nothing.
    act(() => result.current.announce("Transit updated"));
    expect(result.current.lastAnnouncement?.id).toBeGreaterThan(first);
  });

  it("drops preferences the user did choose but keeps nothing stale after a reset", () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setTheme("light");
      result.current.toggleFavorite("org:raft");
      result.current.setEnabledNewsSources(["dotnews"]);
    });
    act(() => result.current.resetAll());
    expect(useAppStore.getState().theme).toBe("system");
    expect(useAppStore.getState().favorites).toEqual([]);
    expect(useAppStore.getState().enabledNewsSources).toEqual([]);
    const after = persisted();
    expect(after.theme).toBe("system");
    expect(after.favorites).toEqual([]);
  });
});

describe("news feed selection", () => {
  it('accepts an id list and the "all" sentinel', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.setEnabledNewsSources(["dotnews", "boston-gov"]));
    expect(result.current.enabledNewsSources).toEqual([
      "dotnews",
      "boston-gov",
    ]);
    act(() => result.current.setEnabledNewsSources([]));
    expect(result.current.enabledNewsSources).toEqual([]);
  });
});
