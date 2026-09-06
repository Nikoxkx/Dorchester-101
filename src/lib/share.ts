'use client';

import { useToast } from '@/stores/toastStore';

/**
 * Share — Web Share API first (many households share by text), with a
 * copy-to-clipboard fallback and toast confirmation everywhere.
 */
export function useShare() {
  const toast = useToast();

  return async function share(input: { title: string; url?: string; text?: string }): Promise<void> {
    const url = input.url ?? window.location.href;
    const payload = { title: input.title, text: input.text, url };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        // User cancelled (AbortError) — not an error worth surfacing.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Otherwise fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied', 'success');
    } catch {
      toast('Could not copy the link', 'danger');
    }
  };
}

/** Print the current page (resource lists, checklists) via the print stylesheet. */
export function usePrintPage() {
  return function printPage() {
    window.print();
  };
}
