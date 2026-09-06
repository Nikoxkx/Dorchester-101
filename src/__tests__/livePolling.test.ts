/**
 * useLivePolling is the single rule behind every live panel, so the two failure
 * modes a hand-rolled timer hits are pinned here:
 *
 *  1. A refresh callback whose identity churns (an inline arrow in a component
 *     that re-renders when data arrives) used to re-trigger the fetch effect on
 *     every render — fetch, setState, re-render, fetch again, forever. That
 *     loop was the news page's "constly refreshing" bug, so the guard that
 *     prevents it is a contract, not an optimisation.
 *  2. Two runs must never overlap: a slow feed cannot be allowed to pile a
 *     second request on top of the first.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAppStore } from "@/stores/appStore";
import { useLivePolling } from "@/hooks/useLivePolling";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  useAppStore.getState().resetAll();
  useAppStore.getState().setAutoRefresh(false);
  return () => vi.useRealTimers();
});

describe("useLivePolling", () => {
  it("issues exactly one fetch when the refresh callback identity churns every render", async () => {
    let pending = deferred();
    const calls = vi.fn(() => pending.promise);
    const { rerender } = renderHook(({ version }) => useLivePolling(() => calls(), { minMs: 1000 }), {
      initialProps: { version: 0 },
    });

    // Simulate what a data arrival used to do: new render, new inline arrow.
    for (let i = 1; i <= 5; i++) rerender({ version: i });
    expect(calls).toHaveBeenCalledTimes(1);

    // The pending request completes; the next render may start a new one.
    await act(async () => {
      pending.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });
    pending = deferred();
    rerender({ version: 6 });
    expect(calls).toHaveBeenCalledTimes(2);

    await act(async () => {
      pending.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });
  });

  it("never runs two refreshes concurrently", async () => {
    const first = deferred();
    const second = deferred();
    const calls = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const { rerender } = renderHook(() => useLivePolling(() => calls(), { minMs: 1000 }));

    rerender({});
    rerender({});
    rerender({});
    expect(calls).toHaveBeenCalledTimes(1);

    await act(async () => {
      first.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });
    rerender({});
    expect(calls).toHaveBeenCalledTimes(2);

    await act(async () => {
      second.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });
  });

  it("reports the interval actually in force, never below the panel minimum", () => {
    useAppStore.getState().setRefreshIntervalMinutes(1);
    const { result } = renderHook(() => useLivePolling(() => Promise.resolve(), { minMs: 300_000 }));
    expect(result.current.enabled).toBe(false); // auto-refresh off in beforeEach
    expect(result.current.intervalMs).toBe(300_000);
  });
});
