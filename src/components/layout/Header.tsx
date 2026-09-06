'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, type Language } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { NotificationPanel } from './NotificationPanel';
import { SearchTrigger } from './SearchDialog';
import { DOR101Mark } from '@/components/ui/Logo';
import { ChevronDown, LanguagesIcon, MenuIcon, MoonIcon, RefreshIcon, SunIcon } from '@/components/ui/icons';
import { PRIMARY_NAV } from '@/lib/site';

export function Header({ onMenu }: { onMenu?: () => void }) {
  const { language, setLanguage, lastUpdated, setLastUpdated } = useAppStore();
  const [langOpen, setLangOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation(language);
  const current = availableLanguages.find((l) => l.code === language);
  const pathname = usePathname();

  const handleRefresh = async () => {
    setRefreshing(true);
    window.dispatchEvent(new CustomEvent('refreshData'));
    await new Promise((r) => setTimeout(r, 600));
    setLastUpdated(new Date().toLocaleTimeString());
    setRefreshing(false);
  };

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setLangOpen(false);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[var(--paper)]/95 backdrop-blur border-b border-[var(--line)]">
      {/* Signal stripe */}
      <div className="signal-stripe" aria-hidden="true" />

      <div className="h-[52px] max-w-[1440px] mx-auto px-3 md:px-5 flex items-center gap-2">
        {onMenu && (
          <button
            onClick={onMenu}
            className="xl:hidden p-2 -ml-1.5 rounded-[2px] hover:bg-[var(--wax)]"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="DOR101 — home">
          <DOR101Mark width={26} />
          <span className="font-display font-bold text-[1.35rem] leading-none tracking-[0.02em] text-[var(--charcoal)]">
            DOR<span className="text-[#1748e2] dark:text-[#6f96ff]">101</span>
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden xl:flex items-center ml-6" aria-label="Primary">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] font-display font-semibold uppercase tracking-[0.05em] text-[13px] leading-none transition-colors',
                      active
                        ? 'bg-[var(--blue)] text-white'
                        : 'text-[var(--ink-soft)] hover:text-[var(--charcoal)] hover:bg-[var(--wax)]',
                    )}
                  >
                    <span className="font-mono font-medium text-[9px] tracking-normal opacity-60">
                      {item.num}
                    </span>
                    {item.navLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-1 min-w-[60px] px-2 md:px-4 max-w-[420px] mx-auto">
          <SearchTrigger />
        </div>
        <div className="ml-auto flex items-center gap-0.5 md:gap-1.5 shrink-0">

          <span className="hidden xl:block masthead-date mr-1">
            {t('common.updated')} {lastUpdated || '—'}
          </span>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-[2px] hover:bg-[var(--wax)] disabled:opacity-60"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshIcon className={cn('w-4 h-4 text-[var(--muted)]', refreshing && 'animate-spin')} />
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] border border-[var(--line)] hover:border-[var(--ink-soft)]"
              aria-label="Language"
              aria-expanded={langOpen}
            >
              <LanguagesIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="hidden sm:inline font-mono text-[11px] font-semibold uppercase tracking-wide">
                {current?.code}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--muted)] hidden md:block" />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-60 bg-[var(--surface)] border border-[var(--line)] p-1">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as Language)}
                      className={cn(
                        'flex items-center gap-2.5 w-full px-2.5 py-2 text-left text-[13px] hover:bg-[var(--paper)]',
                        language === lang.code && 'bg-[var(--paper)] font-bold',
                      )}
                    >
                      <span className="font-mono text-[10px] w-7 text-[var(--muted)]">{lang.code}</span>
                      <span className="flex-1">{lang.nativeName}</span>
                      {language === lang.code && (
                        <span className="w-2 h-2 bg-[var(--blue)]" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <NotificationPanel />
        </div>
      </div>
    </header>
  );
}

/** Theme cycle button used in drawer + mobile row. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, language } = useAppStore();
  const { t } = useTranslation(language);
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'dark' ? MoonIcon : SunIcon;
  return (
    <button
      onClick={() => setTheme(next)}
      className={cn(
        'flex items-center gap-2 rounded-[2px] border border-[var(--line)] hover:bg-[var(--wax)]',
        compact ? 'p-2' : 'px-3 py-2 text-sm font-medium',
      )}
      aria-label={t(theme === 'dark' ? 'theme.light' : 'theme.dark')}
    >
      <Icon className="w-4 h-4" />
      {!compact && (
        <span className="text-[12.5px]">
          {t(`theme.${next}`)}
        </span>
      )}
    </button>
  );
}
