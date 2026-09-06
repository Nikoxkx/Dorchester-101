'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SiteFooter } from './SiteFooter';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import { SavedSheet } from './SavedSheet';
import { Toaster } from '@/components/glass/Toaster';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { UpdateNotifier } from '@/components/UpdateNotifier';
import { useAppStore, FONT_SIZE_VALUES } from '@/stores/appStore';
import { useCommandPalette } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { springSheet } from '@/lib/motion';

/**
 * MainLayout — the two-layer contract made physical:
 *   · content scrolls in <main>, flat and opaque
 *   · glass (sidebar, header, tab bar, palette, sheets, toasts) floats above
 * All offsets use logical properties so Arabic mirrors without special cases.
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, theme, fontSize, language, reduceMotion, reduceTransparency } =
    useAppStore();
  const isMobile = useIsMobile();
  const [drawer, setDrawer] = useState(false);
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (isMobile !== prevMobile) {
    setPrevMobile(isMobile);
    if (!isMobile) setDrawer(false);
  }
  const setPaletteOpen = useCommandPalette((s) => s.setOpen);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle('dark', dark);
    if (theme === 'system') {
      apply(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      apply(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      document.documentElement.classList.toggle('dark', e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize];
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'kea' ? 'kea' : language;
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-transparency', reduceTransparency);
  }, [reduceTransparency]);

  // Command palette shortcut — Cmd/Ctrl+K, plus "/" when nothing is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  // Electron "Generate Report" menu → the print pipeline (printable page).
  useEffect(() => {
    const onReport = () => window.print();
    window.addEventListener('generate-report', onReport);
    return () => window.removeEventListener('generate-report', onReport);
  }, []);

  return (
    <div className="min-h-dvh bg-canvas">
      {!isMobile && <Sidebar />}

      <AnimatePresence>
        {isMobile && drawer && (
          <>
            <motion.button
              key="drawer-scrim"
              aria-label="Close menu"
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm no-print"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawer(false)}
            />
            <motion.div
              key="drawer-panel"
              className="fixed inset-y-0 start-0 z-[60] w-[min(300px,86vw)]"
              initial={reduce ? { opacity: 0 } : { x: '-100%' }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: '-100%' }}
              transition={springSheet}
            >
              <Sidebar mobile onNavigate={() => setDrawer(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Header onMenu={isMobile ? () => setDrawer(true) : undefined} />

      <main
        id="main"
        className="pt-14 min-h-dvh"
        style={{
          marginInlineStart: isMobile ? 0 : sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)',
          paddingBottom: isMobile ? 'calc(var(--bottom-nav) + 16px)' : 0,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-7 py-5 md:py-7">
          {children}
          <SiteFooter />
        </div>
      </main>

      {isMobile && <BottomNav onMore={() => setDrawer(true)} />}

      <CommandPalette />
      <SavedSheet />
      <Toaster />
      <PWAInstaller />
      <UpdateNotifier />
    </div>
  );
}
