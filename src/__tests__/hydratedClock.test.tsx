import { act, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHydratedNow } from '@/hooks/useNow';
import { DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';

function ClockProbe() {
  const now = useHydratedNow(60_000);
  return <p>{now === null ? 'clock pending' : new Date(now).toISOString()}</p>;
}

afterEach(() => {
  vi.useRealTimers();
  act(() => useAppStore.getState().setLanguage('en'));
});

describe('time-dependent prerendering', () => {
  it('omits the build-time clock, hydrates at the visitor time and keeps ticking', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T12:00:00Z'));
    const html = renderToString(<ClockProbe />);
    expect(html).toContain('clock pending');
    expect(html).not.toContain('2026');

    vi.setSystemTime(new Date('2030-01-15T20:15:00Z'));
    const node = document.createElement('div');
    node.innerHTML = html;
    document.body.append(node);
    const errors: unknown[] = [];
    let root!: Root;
    await act(async () => { root = hydrateRoot(node, <ClockProbe />, { onRecoverableError: (error) => errors.push(error) }); });
    expect(errors).toEqual([]);
    expect(node.textContent).toBe('2030-01-15T20:15:00.000Z');
    await act(async () => { vi.advanceTimersByTime(60_000); });
    expect(node.textContent).toBe('2030-01-15T20:16:00.000Z');
    await act(async () => root.unmount());
    node.remove();
  });

  it('never claims an update happened before data arrives, in each language', () => {
    render(<DataRefreshIndicator lastUpdated={null} isRefreshing={false} />);
    for (const language of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(language.code));
      expect(screen.getByText(dictionaries[language.code]['common.notUpdatedYet'])).toBeTruthy();
      expect(document.querySelector('.live-dot')).toBeNull();
    }
  });
});
