'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building2, DollarSign, Map, Apple, Info, Calculator, Newspaper, BookOpen, Settings, ChevronLeft, ChevronRight, Sun, Moon, HelpCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { href: '/', icon: Home, labelKey: 'nav.dashboard' },
  { href: '/projects', icon: Building2, labelKey: 'nav.projects' },
  { href: '/affordable-housing', icon: DollarSign, labelKey: 'nav.affordable' },
  { href: '/market-trends', icon: TrendingUp, labelKey: 'nav.market' },
  { href: '/map', icon: Map, labelKey: 'nav.map' },
  { href: '/food', icon: Apple, labelKey: 'nav.food' },
  { href: '/neighborhood', icon: Info, labelKey: 'nav.neighborhood' },
  { href: '/tools', icon: Calculator, labelKey: 'nav.tools' },
  { href: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { href: '/resources', icon: BookOpen, labelKey: 'nav.resources' },
  { href: '/faq', icon: HelpCircle, labelKey: 'nav.faq' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, language } = useAppStore();
  const { t } = useTranslation(language);
  
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const themeLabel = theme === 'light' ? t('theme.light') : theme === 'dark' ? t('theme.dark') : t('theme.system');

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]',
        'flex flex-col'
      )}
      animate={{ width: sidebarCollapsed ? 64 : 260 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-[var(--color-border)]">
        <Link href="/" className="flex items-center">
          <Logo size={sidebarCollapsed ? 'sm' : 'md'} showText={!sidebarCollapsed} animated={false} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'transition-colors duration-150',
                    'hover:bg-[var(--color-bg-tertiary)]',
                    isActive && 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                  )}
                  title={sidebarCollapsed ? label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-6 bg-[var(--color-accent-primary)] rounded-r"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-heading font-medium whitespace-nowrap overflow-hidden"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-2 space-y-1">
        <Link href="/settings" className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]', pathname === '/settings' && 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]')} title={sidebarCollapsed ? t('nav.settings') : undefined}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-heading font-medium">{t('nav.settings')}</span>}
        </Link>
        <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors hover:bg-[var(--color-bg-tertiary)]" title={sidebarCollapsed ? themeLabel : undefined}>
          {theme === 'dark' ? <Moon className="w-5 h-5 flex-shrink-0" /> : <Sun className="w-5 h-5 flex-shrink-0" />}
          {!sidebarCollapsed && <span className="text-sm font-heading font-medium">{themeLabel}</span>}
        </button>
        <button onClick={toggleSidebar} className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors hover:bg-[var(--color-bg-tertiary)]">
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
          {!sidebarCollapsed && <span className="text-sm font-heading font-medium">{sidebarCollapsed ? t('nav.expand') : t('nav.collapse')}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
