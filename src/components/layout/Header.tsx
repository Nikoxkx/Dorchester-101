'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, type Language } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const { sidebarCollapsed, language, setLanguage, lastUpdated, setLastUpdated } = useAppStore();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation(language);

  // Auto-update timestamp
  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString(language === 'ar' ? 'ar' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, [language, setLastUpdated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('refreshData'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setLangMenuOpen(false);
    // Update document direction for RTL languages
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const currentLangInfo = availableLanguages.find(l => l.code === language);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 z-30',
        'bg-[var(--color-bg-primary)]/80 backdrop-blur-sm',
        'border-b border-[var(--color-border)]',
        'flex items-center justify-between px-6',
        'transition-all duration-200'
      )}
      style={{ left: sidebarCollapsed ? 64 : 260 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={t('common.search', 'Search housing, food, resources...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg',
              'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
              'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]',
              'font-body text-sm'
            )}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Last updated status */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <motion.div
            className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>{t('common.updated', 'Updated')} {lastUpdated || 'just now'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'hover:bg-[var(--color-bg-secondary)]',
            'disabled:opacity-50'
          )}
          title="Refresh data"
        >
          <RefreshCw className={cn('w-5 h-5 text-[var(--color-text-muted)]', isRefreshing && 'animate-spin')} />
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'hover:bg-[var(--color-bg-secondary)]',
              'transition-colors duration-150',
              langMenuOpen && 'bg-[var(--color-bg-secondary)]'
            )}
            aria-label="Select language"
          >
            <Globe className="w-5 h-5 text-[var(--color-text-muted)]" />
            <span className="text-lg">{currentLangInfo?.flag}</span>
            <span className="hidden sm:inline text-sm font-heading">
              {currentLangInfo?.nativeName}
            </span>
          </button>

          <AnimatePresence>
            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 z-50',
                    'w-72 p-2 rounded-xl',
                    'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                    'shadow-xl'
                  )}
                >
                  <p className="px-3 py-2 text-xs text-[var(--color-text-muted)] font-heading">
                    Select your language
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code as Language)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                          'hover:bg-[var(--color-bg-tertiary)]',
                          'transition-colors duration-150',
                          language === lang.code && 'bg-[var(--color-accent-primary)]/10'
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-heading font-medium">{lang.nativeName}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{lang.name}</div>
                        </div>
                        {language === lang.code && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-accent-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <NotificationPanel />
      </div>
    </header>
  );
}
