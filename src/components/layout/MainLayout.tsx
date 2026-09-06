'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SiteFooter } from './SiteFooter';
import { BottomNav } from './BottomNav';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { UpdateNotifier } from '@/components/UpdateNotifier';
import { useAppStore, FONT_SIZE_VALUES } from '@/stores/appStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, theme, fontSize, language, reduceMotion } = useAppStore();
  const isMobile = useIsMobile();
  const [drawer, setDrawer] = useState(false);

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

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 60 : 236;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {!isMobile && <Sidebar />}
      {isMobile && drawer && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[min(290px,86vw)]">
            <Sidebar mobile onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
      <Header sidebarWidth={sidebarWidth} onMenu={isMobile ? () => setDrawer(true) : undefined} />
      <main
        id="main"
        className="pt-14 min-h-screen"
        style={{ marginLeft: sidebarWidth, paddingBottom: isMobile ? 88 : 0 }}
      >
        <div className="p-4 md:p-8 xl:p-10 max-w-6xl mx-auto w-full">
          {children}
          <SiteFooter />
        </div>
      </main>
      {isMobile && <BottomNav onMore={() => setDrawer(true)} />}
      <PWAInstaller />
      <UpdateNotifier />
    </div>
  );
}
