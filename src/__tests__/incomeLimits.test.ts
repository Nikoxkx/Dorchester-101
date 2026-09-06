/**
 * The auto-recovery contract: a panel that fetched "unavailable" while a
 * publisher was down must re-ask on the app-wide data epoch — the signal raised
 * by Settings → "Refresh now", by a permission being granted, and by the
 * browser coming back online. If this breaks, an empty field stays empty until
 * a full page reload, which is exactly the failure the recovery work fixed.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAppStore } from "@/stores/appStore";
import { useIncomeLimits } from "@/hooks/useIncomeLimits";

function okPayload() {
  return {
    status: "available" as const,
    fiscalYear: 2026,
    effectiveDate: "2026-05-01",
    area: "Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area",
    sourceUrl: "https://www.huduser.gov/portal/datasets/il/il26/Section8-FY26.xlsx",
    retrievedAt: new Date().toISOString(),
    table: { "4": 171400 },
    bands: {},
  };
}

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.getState().resetAll();
  vi.restoreAllMocks();
});

describe("useIncomeLimits", () => {
  it("retries automatically when the global data epoch changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ status: "unavailable", table: {}, bands: {} }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useIncomeLimits());
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // The connection recovers and something bumps the epoch (permission
    // granted, back-online listener, Settings refresh).
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => okPayload(),
    } as Response);
    act(() => {
      useAppStore.getState().refreshAllData();
    });

    await waitFor(() => expect(result.current.data?.table["4"]).toBe(171400));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });
});
