'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Check, ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { useAppStore, FONT_SIZE_VALUES, type FontSize } from '@/stores/appStore';
import { useResolvedPrefs } from '@/hooks/useResolvedPrefs';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

/**
 * The accessibility switches that matter most, one keystroke away from any page.
 *
 * Only people who ask for this panel see it, which is why the switches also live
 * in Settings: a quick panel is a convenience, not a substitute for the full
 * control surface. Values are the same store the settings page writes, so the
 * two can never disagree, and every label is translated.
 */
const QUICK_SWITCHES = [
  { key: 'underlineLinks', labelKey: 'a11y.underlineLinks' },
  { key: 'largeFocus', labelKey: 'a11y.largeFocus' },
  { key: 'legibleFont', labelKey: 'a11y.dyslexiaFont' },
  { key: 'textSpacing', labelKey: 'a11y.textSpacing' },
  { key: 'announceUpdates', labelKey: 'a11y.announceUpdates' },
] as const;

const SIZE_ORDER: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
const SIZE_LABEL_KEY: Record<FontSize, 'size.small' | 'size.medium' | 'size.large' | 'size.extraLarge'> = {
  small: 'size.small',
  medium: 'size.medium',
  large: 'size.large',
  'extra-large': 'size.extraLarge',
};

export function A11yQuickPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const prefs = useResolvedPrefs();
  const accessibility = useAppStore((s) => s.accessibility);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const toggleAccessibility = useAppStore((s) => s.toggleAccessibility);
  const setAccessibility = useAppStore((s) => s.setAccessibility);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (anchorRef.current && !anchorRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    const closeListener = () => setOpen(false);
    window.addEventListener(APP_EVENTS.CLOSE_EVENT, closeListener);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(APP_EVENTS.CLOSE_EVENT, closeListener);
    };
  }, [open]);

  const triStateLabel = (value: 'auto' | 'on' | 'off') =>
    value === 'auto' ? t('a11y.autoResolved') : value === 'on' ? t('a11y.highContrast') : t('a11y.contrastNormal');

  return (
    <div className="relative" ref={anchorRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="a11y-quick-panel"
        aria-label={t('a11y.openQuickPanel')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1.5',
          'font-heading text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
          open
            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
            : 'border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
        )}
      >
        <Accessibility className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('a11y.title')}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="a11y-quick-panel"
            role="group"
            aria-label={t('a11y.quickPanel')}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 0.84, 0.44, 1] }}
            className="absolute end-0 top-[calc(100%+8px)] z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-3 shadow-[var(--shadow-lg)]"
          >
            <h2 className="font-display text-sm font-bold mb-2">{t('a11y.quickPanel')}</h2>

            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
              <span className="block text-xs font-heading font-semibold text-[var(--color-text-secondary)] mb-1.5">
                {t('a11y.fontSize')}
              </span>
              <div className="grid grid-cols-4 gap-1">
                {SIZE_ORDER.map((size) => {
                  const active = size === fontSize;
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        'rounded-[var(--radius-sm)] border px-1 py-1.5 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                        active
                          ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                          : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <span className="block font-body leading-none" style={{ fontSize: `calc(${FONT_SIZE_VALUES[size]} * 0.8)` }}>
                        Aa
                      </span>
                      <span className="mt-1 block text-[10px] text-[var(--color-text-muted)] truncate">
                        {t(SIZE_LABEL_KEY[size])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <QuickTri
                label={t('a11y.reduceMotion')}
                hint={prefs.detected.reduceMotion ? t('a11y.systemDetected') : t('a11y.motionNormal')}
                value={accessibility.reduceMotion}
                onCycle={() =>
                  setAccessibility(
                    'reduceMotion',
                    accessibility.reduceMotion === 'auto' ? 'on' : accessibility.reduceMotion === 'on' ? 'off' : 'auto'
                  )
                }
                stateLabel={
                  accessibility.reduceMotion === 'auto'
                    ? t('a11y.autoResolved')
                    : accessibility.reduceMotion === 'on'
                      ? t('common.on')
                      : t('common.off')
                }
              />
              <QuickTri
                label={t('a11y.highContrast')}
                hint={prefs.detected.highContrast ? t('a11y.systemDetected') : triStateLabel(accessibility.highContrast)}
                value={accessibility.highContrast}
                onCycle={() =>
                  setAccessibility(
                    'highContrast',
                    accessibility.highContrast === 'auto' ? 'on' : accessibility.highContrast === 'on' ? 'off' : 'auto'
                  )
                }
                stateLabel={
                  accessibility.highContrast === 'auto'
                    ? t('a11y.autoResolved')
                    : accessibility.highContrast === 'on'
                      ? t('common.on')
                      : t('common.off')
                }
              />
            </div>

            <ul className="mt-2 space-y-1">
              {QUICK_SWITCHES.map((item) => {
                const on = accessibility[item.key];
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => toggleAccessibility(item.key)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-start text-xs',
                        'font-heading transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                        on ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-hair)] border',
                          on
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
                            : 'border-[var(--color-border-strong)]'
                        )}
                      >
                        {on && <Check className="w-3 h-3" />}
                      </span>
                      {t(item.labelKey)}
                    </button>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/settings#accessibility"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-xs font-heading font-semibold text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              {t('settings.section.accessibility')}
              <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickTri({
  label,
  hint,
  value,
  onCycle,
  stateLabel,
}: {
  label: string;
  hint: string;
  value: 'auto' | 'on' | 'off';
  onCycle: () => void;
  stateLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={label}
      className={cn(
        'rounded-[var(--radius-md)] border p-2 text-start transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
        value === 'on'
          ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/8'
          : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
      )}
    >
      <span className="block text-xs font-heading font-semibold leading-tight">{label}</span>
      <span className="mt-1 block text-[10px] text-[var(--color-text-muted)]">{stateLabel}</span>
      <span className="sr-only">{hint}</span>
    </button>
  );
}
