'use client';

import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { useReadAloud, textOfRegion } from '@/hooks/useReadAloud';
import { cn } from '@/lib/utils';

/**
 * Read-aloud control for the current page.
 *
 * Uses the browser's speech engine, not a server, so it works offline and
 * records nothing. The button is absent when the platform has no engine rather
 * than disabled with a lie, and the text spoken is the text on screen in the
 * language the visitor picked, taken from the live DOM rather than a second
 * copy of the copy.
 */
export function ReadAloudButton({
  selector = '#main',
  className,
  compact = false,
}: {
  selector?: string;
  className?: string;
  compact?: boolean;
}) {
  const { t, meta } = useI18n();
  const { supported, speaking, paused, speak, stop, pause, resume } = useReadAloud();

  if (!supported) return null;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        aria-pressed={speaking}
        onClick={() => (speaking ? stop() : speak(textOfRegion(selector)))}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1.5',
          'font-heading text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
          speaking
            ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/12 text-[var(--color-accent-green)]'
            : 'border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
        )}
        title={`${t('a11y.readAloud')} · ${meta.nativeName}`}
      >
        {speaking ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
        {compact ? null : <span>{speaking ? t('a11y.readAloudStop') : t('a11y.readAloud')}</span>}
        {speaking && <span className="sr-only"> ({meta.nativeName})</span>}
      </button>

      {speaking && (
        <button
          type="button"
          onClick={() => (paused ? resume() : pause())}
          className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-2 py-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
          aria-label={paused ? t('a11y.resumeReading') : t('a11y.pauseReading')}
        >
          {paused ? <Play className="w-3.5 h-3.5" aria-hidden="true" /> : <Pause className="w-3.5 h-3.5" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
