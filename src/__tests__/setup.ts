/**
 * Vitest setup.
 *
 * jsdom gives us a real DOM, localStorage and history. What it does not give
 * us are the APIs this app leans on that only exist in browsers: matchMedia
 * (theme and font-size preferences), IntersectionObserver (scroll reveal and
 * section tracking) and ResizeObserver (the map's invalidateSize handling). Each
 * is stubbed with the smallest behaviour the components need.
 */
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (!("IntersectionObserver" in window)) {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: ObserverStub,
  });
}

if (!("ResizeObserver" in window)) {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ObserverStub,
  });
}

// framer-motion measures layout on mount; keep it from touching the DOM APIs
// jsdom leaves out.
if (!Element.prototype.animate) {
  Element.prototype.animate = vi.fn().mockImplementation(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    finished: Promise.resolve(),
  })) as unknown as typeof Element.prototype.animate;
}
