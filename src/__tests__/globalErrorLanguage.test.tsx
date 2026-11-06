import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GlobalError from '@/app/global-error';
import { dictionaries } from '@/i18n';

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.locale;
});
afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.locale;
});

describe('root error language', () => {
  it('uses the stored language even if the providers never mounted', () => {
    window.localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'es' }, version: 5 }));
    const html = renderToStaticMarkup(<GlobalError error={new Error('failed')} reset={vi.fn()} />);
    expect(html).toContain('lang="es"');
    expect(html).toContain(dictionaries.es['error.title']);
    expect(html).toContain(dictionaries.es['common.retry']);
    expect(html).toContain('background:#11181B');
    expect(html).toContain('max-width:38rem');
  });

  it('respects an explicitly saved light theme', () => {
    window.localStorage.setItem('dor101-settings', JSON.stringify({ state: { theme: 'light' }, version: 6 }));
    const html = renderToStaticMarkup(<GlobalError error={new Error('failed')} reset={vi.fn()} />);
    expect(html).toContain('background:#F2F7F7');
    expect(html).toContain('color:#152A32');
  });

  it('falls back to the document language if storage is corrupt', () => {
    window.localStorage.setItem('dor101-settings', 'not-json');
    document.documentElement.dataset.locale = 'ar';
    const html = renderToStaticMarkup(<GlobalError error={new Error('failed')} reset={vi.fn()} />);
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain(dictionaries.ar['error.title']);
  });
});
