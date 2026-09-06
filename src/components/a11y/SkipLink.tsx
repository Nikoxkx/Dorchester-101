'use client';

import { useI18n } from '@/i18n/hook';
import { cn } from '@/lib/utils';

/**
 * Keyboard escape hatch out of the header.
 *
 * The link is visually hidden until it receives focus, which is the one
 * pattern that works for both keyboard and screen-reader users: a permanently
 * visible "Skip to content" box is noise for sighted mouse users, while a
 * hidden-but-not-focusable element (the `div onClick` an AI pass usually
 * writes) helps nobody.
 */
export function SkipLink({ targetId = 'main', className }: { targetId?: string; className?: string }) {
  const { t } = useI18n();

  return (
    <a
      href={`#${targetId}`}
      className={cn('skip-link', className)}
      onClick={(event) => {
        // Move focus as well as scrolling, or a screen reader keeps reading the
        // header while the viewport has already jumped.
        const target = document.getElementById(targetId);
        if (target) {
          event.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: false });
          target.scrollIntoView({ block: 'start' });
        }
      }}
    >
      {t('nav.skipToContent')}
    </a>
  );
}
