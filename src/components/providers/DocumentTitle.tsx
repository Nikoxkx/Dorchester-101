'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/hook';
import { NAV_LABEL_KEY } from '@/i18n/pageTitles';

/** Server metadata stays crawlable in English; the reader's browser tab follows their language. */
export function DocumentTitle() {
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const path = pathname && pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    const key = path ? NAV_LABEL_KEY[path] ?? 'error.notFoundTitle' : 'nav.dashboard';
    const title = `${t(key)} · Dorchester 101`;
    const syncTitle = () => {
      if (document.title !== title) document.title = title;
    };

    syncTitle();
    // Next can stream its English server metadata after this effect runs. Keep
    // the visible tab in the reader's chosen language without changing the
    // crawlable server metadata. Comparing first avoids an observer loop.
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, t]);

  return null;
}
