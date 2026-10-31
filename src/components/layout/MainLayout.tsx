'use client';

import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SiteFooter } from './SiteFooter';
import { OfflineBanner } from './OfflineBanner';
import { WeatherAlertBanner } from '@/components/weather/WeatherAlertBanner';
import { WearTodayToast } from '@/components/weather/WearTodayToast';
import { ConsentNotice } from '@/components/a11y/ConsentNotice';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';
import { cn } from '@/lib/utils';

/**
 * Frame for every page.
 *
 * Theme, language direction, contrast and motion are not applied here: they are
 * written to the document once by `DorchesterProviders`, so a page mounted inside
 * or outside this frame gets identical behaviour. What stays here is geometry —
 * one CSS variable that both the rail width and the content offset read.
 */
export function MainLayout({ children }: { children: ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const mobileOpen = useAppStore((s) => s.mobileNavOpen);
  const { t } = useI18n();

  return (
    <div className="dor101-shell" data-collapsed={collapsed ? 'true' : 'false'} data-mobile-open={mobileOpen ? 'true' : 'false'}>
      <Sidebar />

      {mobileOpen && (
        <button
          type="button"
          className="dor101-scrim lg:hidden"
          aria-label={t('nav.close')}
          onClick={() => useAppStore.getState().setMobileNavOpen(false)}
        />
      )}

      <div className={cn('dor101-content')}>
        <Header />
        <OfflineBanner />
        <WeatherAlertBanner />
        {/* Renders as a floating card pinned to the bottom corner, so its place in
            the tree does not affect layout and the page stays usable underneath.
            Declining or opening any of its links dismisses it for the session. */}
        <ConsentNotice />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <div className="mx-auto w-full max-w-[86rem] px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
        <SiteFooter />
      </div>

      <WearTodayToast />
      <PWAInstaller />
    </div>
  );
}
