'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CircleAlert, HardDriveDownload, MapPin, ShieldCheck, X } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { readDismissed, writeDismissed, useBrowserPermissions, type PermissionValue } from '@/hooks/useBrowserPermissions';
import type { TranslationKey } from '@/i18n/en';

/**
 * The one place DOR101 asks for its optional browser permissions.
 *
 * A site that quietly fires `Notification.requestPermission()` the moment it
 * loads gets denied, and a denied permission is permanent until the visitor
 * digs through site settings. So the ask is explicit: what each feature is for,
 * what the browser currently says, and one button per row. Everything on the
 * site works with all three left off — the card says so, because that is the
 * difference between asking and nagging.
 *
 * `variant="banner"` (dashboard) can be dismissed; `variant="full"` (Settings)
 * always shows and adds the deny-path explanation.
 */
export function PermissionSetup({ variant = 'full' }: { variant?: 'banner' | 'full' }) {
  const { t } = useI18n();
  const { states, busy, requestNotifications, requestLocation, requestStorage } = useBrowserPermissions();
  const refreshAllData = useAppStore((s) => s.refreshAllData);
  const announce = useAppStore((s) => s.announce);
  const [dismissed, setDismissed] = useState(true);

  // Avoid a hydration mismatch: the banner's visibility depends on localStorage,
  // so decide after mount (deferred a tick to keep the effect body free of
  // synchronous state writes).
  useEffect(() => {
    const id = window.setTimeout(() => setDismissed(readDismissed()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Granting a permission is the moment the visitor has said "go" — so it also
  // triggers one global data refresh (the same bump Settings → "Refresh now"
  // uses). Every live panel refetches immediately, which is what turns any
  // field still showing "unavailable" into real data without a page reload.
  const granted = useCallback(() => {
    refreshAllData();
    announce(t('data.grantedRefresh'), 'polite');
  }, [announce, refreshAllData, t]);

  const enableNotifications = useCallback(() => {
    void requestNotifications().then((result) => {
      if (result === 'granted') granted();
    });
  }, [granted, requestNotifications]);

  const enableLocation = useCallback(() => {
    void requestLocation().then((ok) => {
      if (ok) granted();
    });
  }, [granted, requestLocation]);

  const enableStorage = useCallback(() => {
    void requestStorage().then((ok) => {
      if (ok) granted();
    });
  }, [granted, requestStorage]);

  if (variant === 'banner' && dismissed) return null;

  const allGranted =
    (states.notifications === 'granted' || states.notifications === 'unsupported') &&
    (states.location === 'granted' || states.location === 'unsupported') &&
    (states.storage === 'granted' || states.storage === 'unsupported');

  function dismiss() {
    writeDismissed();
    setDismissed(true);
  }

  return (
    <section
      aria-labelledby="permissions-heading"
      className={cn(
        'rounded-2xl border p-4',
        allGranted
          ? 'border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/8'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="permissions-heading" className="flex items-center gap-2 font-heading text-sm font-bold">
            {allGranted ? (
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent-green)]" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
            )}
            {t('permissions.title')}
          </h2>
          <p className="mt-1 max-w-prose text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('permissions.description')}</p>
        </div>
        {variant === 'banner' && (
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('permissions.notNow')}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <ul className="mt-3 grid gap-2 md:grid-cols-3">
        <PermissionRow
          icon={<Bell className="h-4 w-4" aria-hidden="true" />}
          label={t('permissions.notifications')}
          description={t('permissions.notifications.desc')}
          state={states.notifications}
          busy={busy.notifications}
          onEnable={enableNotifications}
        />
        <PermissionRow
          icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          label={t('permissions.location')}
          description={t('permissions.location.desc')}
          state={states.location}
          busy={busy.location}
          onEnable={enableLocation}
        />
        <PermissionRow
          icon={<HardDriveDownload className="h-4 w-4" aria-hidden="true" />}
          label={t('permissions.storage')}
          description={t('permissions.storage.desc')}
          state={states.storage}
          busy={busy.storage}
          onEnable={enableStorage}
        />
      </ul>

      {allGranted ? (
        <p role="status" className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <Check className="h-3.5 w-3.5 text-[var(--color-accent-green)]" aria-hidden="true" /> {t('permissions.allSet')}
        </p>
      ) : variant === 'full' ? (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">
          <CircleAlert className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
          {t('permissions.description')}
        </p>
      ) : null}
    </section>
  );
}

function PermissionRow({
  icon,
  label,
  description,
  state,
  busy,
  onEnable,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  state: PermissionValue;
  busy?: boolean;
  onEnable: () => void;
}) {
  const { t } = useI18n();
  const granted = state === 'granted';
  const unsupported = state === 'unsupported';
  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-heading text-xs font-bold">
          <span className="text-[var(--color-accent-primary)]" aria-hidden="true">
            {icon}
          </span>
          {label}
        </span>
        <StatusPill state={state} />
      </div>
      <p className="text-[11px] leading-snug text-[var(--color-text-secondary)]">{description}</p>
      {!granted && !unsupported && (
        <button
          type="button"
          onClick={onEnable}
          disabled={busy}
          className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-accent-primary)] px-3 py-1 font-heading text-[11px] font-bold text-[var(--color-accent-primary)] transition-colors hover:bg-[var(--color-accent-primary)] hover:text-white disabled:opacity-50"
        >
          {busy ? t('common.loading') : t('permissions.enable')}
        </button>
      )}
    </li>
  );
}

function StatusPill({ state }: { state: PermissionValue }) {
  const { t } = useI18n();
  const key: TranslationKey =
    state === 'granted'
      ? 'permissions.state.granted'
      : state === 'denied'
        ? 'permissions.state.denied'
        : state === 'unsupported'
          ? 'permissions.state.unsupported'
          : 'permissions.state.prompt';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide',
        state === 'granted'
          ? 'border-[var(--color-accent-green)]/50 text-[var(--color-accent-green)]'
          : state === 'denied'
            ? 'border-[var(--color-accent-critical)]/50 text-[var(--color-accent-critical)]'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
      )}
    >
      {state === 'granted' ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : null}
      {t(key)}
    </span>
  );
}
