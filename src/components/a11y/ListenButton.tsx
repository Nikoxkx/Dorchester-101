'use client';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useReadAloud } from '@/hooks/useReadAloud';
import { useBadgeStore } from '@/stores/badgeStore';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function ListenButton({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const { t } = useTranslation();
  const { supported, speaking, paused, speak, stop, pause, resume } = useReadAloud();
  const earn = useBadgeStore((s) => s.earn);

  if (!supported) return null;

  const handleToggle = () => {
    if (speaking) {
      stop();
    } else {
      earn('listener');
      speak(text);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={speaking}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold transition-colors',
          speaking
            ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/12 text-[var(--color-accent-green)]'
            : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]',
        )}
      >
        {speaking ? <VolumeX className="h-3 w-3" aria-hidden="true" /> : <Volume2 className="h-3 w-3" aria-hidden="true" />}
        {speaking ? t('a11y.readAloudStop') : (label ?? t('a11y.listen'))}
      </button>
      {speaking && (
        <button
          type="button"
          onClick={() => (paused ? resume() : pause())}
          aria-label={paused ? t('a11y.resumeReading') : t('a11y.pauseReading')}
          className="inline-flex items-center rounded-full border border-[var(--color-border)] p-1 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]"
        >
          {paused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
        </button>
      )}
    </span>
  );
}
