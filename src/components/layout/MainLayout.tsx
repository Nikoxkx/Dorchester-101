'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header, ThemeToggle } from './Header';
import { SiteFooter } from './SiteFooter';
import { BottomNav } from './BottomNav';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { UpdateNotifier } from '@/components/UpdateNotifier';
import { useAppStore, FONT_SIZE_VALUES } from '@/stores/appStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ALL_SECTIONS, type SiteSection } from '@/lib/site';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { CloseIcon, SettingsIcon } from '@/components/ui/icons';
import { DOR101Mark } from '@/components/ui/Logo';

function DrawerRow({ section, onNavigate, active }: { section: SiteSection; onNavigate: () => void; active: boolean }) {
  return (
    <Link
      href={section.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-baseline gap-4 px-1 py-3.5 border-b border-[var(--line)] group',
        active ? 'text-[var(--blue)]' : 'text-[var(--charcoal)] hover:text-[var(--blue)]',
      )}
    >
      <span className="font-mono text-[11px] text-[var(--muted)]">{section.num}</span>
      <span className="flex-1">
        <span className="block font-display font-bold uppercase text-[1.45rem] leading-none tracking-[0.03em] group-hover:translate-x-1 transition-transform">
          {section.navLabel}
        </span>
        <span className="block text-[12.5px] text-[var(--muted)] mt-1.5 leading-snug">{section.blurb}</span>
      </span>
    </Link>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme, fontSize, language, reduceMotion } = useAppStore();
  const isMobile = useIsMobile();
  const [drawer, setDrawer] = useState(false);
  const { t } = useTranslation(language);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize];
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    if (!isMobile) setDrawer(false);
  }, [isMobile]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  // Desktop (Electron) menu actions
  useEffect(() => {
    const api = window.electron;
    if (!api) return;
    const offRefresh = api.onMenu('refresh-all', () => {
      window.dispatchEvent(new CustomEvent('refreshData'));
    });
    const offReport = api.onMenu('generate-report', () => {
      window.location.assign('/?report=1');
    });
    return () => {
      offRefresh();
      offReport();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Header onMenu={isMobile ? () => setDrawer(true) : undefined} />

      {/* Mobile / reduced-width menu */}
      {drawer && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-[#111a2c]/55" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(400px,92vw)] bg-[var(--paper)] border-r border-[var(--line)] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-[54px] border-b border-[var(--line)] shrink-0">
              <span className="flex items-center gap-2">
                <DOR101Mark width={24} />
                <span className="font-display font-bold text-lg tracking-[0.02em] text-[var(--charcoal)]">DOR101</span>
              </span>
              <button
                onClick={() => setDrawer(false)}
                className="p-2 hover:bg-[var(--wax)]"
                aria-label="Close menu"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 pt-3 pb-2">
              <p className="masthead-date">{t('common.updated')} — {new Date().toLocaleDateString()}</p>
            </div>
            <nav className="flex-1 px-5" aria-label="Main">
              {ALL_SECTIONS.map((s) => (
                <DrawerRow key={s.href} section={s} onNavigate={() => setDrawer(false)} active={pathname === s.href} />
              ))}
            </nav>
            <div className="px-5 py-4 border-t border-[var(--line)] flex items-center gap-3">
              <Link
                href="/settings"
                onClick={() => setDrawer(false)}
                className="flex items-center gap-2 px-3 py-2 border border-[var(--line)] text-sm font-medium hover:bg-[var(--wax)]"
              >
                <SettingsIcon className="w-4 h-4" /> {t('nav.settings')}
              </Link>
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      )}

      <main id="main" className="pt-[54px] min-h-screen">
        <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 md:pt-10 pb-24 md:pb-12">
          {children}
        </div>
        <SiteFooter />
      </main>

      {isMobile && <BottomNav onMore={() => setDrawer(true)} />}
      <PWAInstaller />
      <UpdateNotifier />
    </div>
  );
}
