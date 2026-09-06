'use client';

import { useState } from 'react';
import { Globe, Menu, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, type Language } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { NotificationPanel } from './NotificationPanel';
import { SearchTrigger } from './SearchDialog';

export function Header({
  sidebarWidth,
  onMenu,
}: {
  sidebarWidth: number;
  onMenu?: () => void;
}) {
  const { language, setLanguage, lastUpdated, setLastUpdated } = useAppStore();
  const [langOpen, setLangOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation(language);
  const current = availableLanguages.find((l) => l.code === language);

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
    <header
      className="fixed top-0 right-0 h-14 z-30 bg-[var(--paper)] border-b border-[var(--line)] flex items-center gap-3 px-3 md:px-5"
      style={{ left: sidebarWidth }}
    >
      {onMenu && (
        <button onClick={onMenu} className="p-2 md:hidden" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      )}

      {onMenu && (
        <span className="font-display font-semibold md:hidden shrink-0">DOR101</span>
      )}

      <SearchTrigger />

      <div className="flex items-center gap-1 ml-auto">
        <span className="hidden lg:block masthead-date mr-2">
          {t('common.updated')} {lastUpdated || '—'}
        </span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-[var(--surface)]"
          title="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4 text-[var(--muted)]', refreshing && 'animate-spin')} />
        </button>

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[var(--surface)]"
            aria-label="Language"
          >
            <Globe className="w-4 h-4 text-[var(--muted)]" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wide">
              {current?.code}
            </span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-[var(--surface)] border border-[var(--ink)] shadow-lg p-1">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as Language)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-[var(--paper)]',
                      language === lang.code && 'bg-[var(--paper)]',
                    )}
                  >
                    <span className="font-mono text-[11px] w-8">{lang.code}</span>
                    <span className="flex-1">{lang.nativeName}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <NotificationPanel />
      </div>
    </header>
  );
}
