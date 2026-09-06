'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Apple,
  Building2,
  ListChecks,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Globe2,
  HelpCircle,
  Home,
  Info,
  Map as MapIcon,
  Moon,
  Newspaper,
  Settings,
  Sun,
  BookOpen,
  TrendingUp,
  MonitorSmartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';
import { useResolvedPrefs } from '@/hooks/useResolvedPrefs';
import { Logo } from '@/components/ui/Logo';
import type { TranslationKey } from '@/i18n/en';

/**
 * The primary navigation.
 *
 * Grouped by what a visitor is trying to do rather than by page type, because
 * that is how the pages get used: someone in court on Monday looks for "Everyday
 * help", not for "route resources". Active state is marked with `aria-current`
 * as well as colour, and the icons are `aria-hidden` because the text beside
 * them already says what the link is.
 */

interface NavItem {
  href: string;
  icon: typeof Home;
  labelKey: TranslationKey;
}

const SECTIONS: Array<{ labelKey: TranslationKey; items: NavItem[] }> = [
  {
    labelKey: 'nav.section.housing',
    items: [
      { href: '/affordable-housing', icon: Building2, labelKey: 'nav.affordable' },
      { href: '/projects', icon: TrendingUp, labelKey: 'nav.projects' },
      { href: '/market-trends', icon: Globe2, labelKey: 'nav.market' },
      { href: '/tools', icon: Calculator, labelKey: 'nav.tools' },
    ],
  },
  {
    labelKey: 'nav.section.services',
    items: [
      { href: '/food', icon: Apple, labelKey: 'nav.food' },
      { href: '/map', icon: MapIcon, labelKey: 'nav.map' },
      { href: '/resources', icon: BookOpen, labelKey: 'nav.resources' },
      { href: '/directory', icon: ListChecks, labelKey: 'nav.directory' },
    ],
  },
  {
    labelKey: 'nav.section.community',
    items: [
      { href: '/neighborhood', icon: Info, labelKey: 'nav.neighborhood' },
      { href: '/news', icon: Newspaper, labelKey: 'nav.news' },
      { href: '/faq', icon: HelpCircle, labelKey: 'nav.faq' },
      { href: '/about', icon: Info, labelKey: 'nav.about' },
    ],
  },
];

const THEME_ORDER = ['light', 'dark', 'system'] as const;
const THEME_ICON = { light: Sun, dark: Moon, system: MonitorSmartphone } as const;
const THEME_LABEL: Record<(typeof THEME_ORDER)[number], TranslationKey> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system',
};

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const prefs = useResolvedPrefs();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const mobileOpen = useAppStore((s) => s.mobileNavOpen);
  const setMobileOpen = useAppStore((s) => s.setMobileNavOpen);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  // A drawer that stays open after the tap is a drawer that hides the page.
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isCompact = collapsed && !mobileOpen;

  return (
    <motion.aside
      aria-label={t('nav.menu')}
      className={cn('dor101-rail', 'print:hidden')}
      data-collapsed={isCompact ? 'true' : 'false'}
    >
      <div className={cn('flex items-center h-[var(--header-height)] border-b border-[var(--color-border)]', isCompact ? 'justify-center px-2' : 'px-3')}>
        <Link
          href="/"
          className="flex items-center gap-2 min-w-0 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
          aria-label={`${t('site.name')} — ${t('nav.dashboard')}`}
        >
          <Logo size={isCompact ? 'sm' : 'md'} showText={!isCompact} animated={false} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain py-3" id="primary-nav">
        <ul className={cn('space-y-1 px-2', isCompact && 'items-center')}>
          <li>
            <NavLink href="/" icon={Home} label={t('nav.dashboard')} compact={isCompact} active={pathname === '/'} />
          </li>
        </ul>

        {SECTIONS.map((section) => (
          <div key={section.labelKey} className="mt-4">
            {!isCompact && (
              <h2 className="px-4 pb-1 text-[10px] font-heading font-semibold uppercase tracking-[0.09em] text-[var(--color-text-muted)]">
                {t(section.labelKey)}
              </h2>
            )}
            <ul className="space-y-1 px-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    icon={item.icon}
                    label={t(item.labelKey)}
                    compact={isCompact}
                    active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('border-t border-[var(--color-border)] p-2 space-y-1', isCompact && 'items-center')}>
        <Link
          href="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors',
            'hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
            pathname === '/settings' && 'bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]',
            isCompact && 'justify-center px-2'
          )}
          title={isCompact ? t('nav.settings') : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
          {!isCompact && <span className="text-sm font-heading font-medium">{t('nav.settings')}</span>}
        </Link>

        <ThemeCycleButton
          compact={isCompact}
          theme={theme}
          resolvedLabel={t(prefs.dark ? 'theme.dark' : 'theme.light')}
          label={t(THEME_LABEL[theme])}
          onCycle={() => setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length])}
        />

        <button
          type="button"
          onClick={() => toggleSidebar()}
          className={cn(
            'hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)]',
            'text-sm font-heading font-medium transition-colors hover:bg-[var(--color-bg-tertiary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
            isCompact && 'justify-center px-2'
          )}
          aria-expanded={!collapsed}
          aria-controls="primary-nav"
        >
          {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" aria-hidden="true" /> : <ChevronLeft className="w-5 h-5 shrink-0 rtl:rotate-180" aria-hidden="true" />}
          {!isCompact && <span>{collapsed ? t('nav.expand') : t('nav.collapse')}</span>}
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-heading font-medium hover:bg-[var(--color-bg-tertiary)]"
          aria-label={t('nav.close')}
        >
          {prefs.dir === 'rtl' ? <ChevronRight className="w-5 h-5 shrink-0" aria-hidden="true" /> : <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden="true" />}
          <span>{t('nav.close')}</span>
        </button>
      </div>
    </motion.aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  compact,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active: boolean;
  compact: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      title={compact ? label : undefined}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
        'transition-colors duration-150 hover:bg-[var(--color-bg-tertiary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
        active && 'bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]',
        compact && 'justify-center px-2'
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-inline-start-0 start-0 w-1 h-6 rounded-e-[2px] bg-[var(--color-accent-primary)]"
          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          aria-hidden="true"
        />
      )}
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      <AnimatePresence initial={false} mode="wait">
        {!compact && (
          <motion.span
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="truncate text-sm font-heading font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

function ThemeCycleButton({
  compact,
  theme,
  resolvedLabel,
  label,
  onCycle,
}: {
  compact: boolean;
  theme: 'light' | 'dark' | 'system';
  resolvedLabel: string;
  label: string;
  onCycle: () => void;
}) {
  const Icon = THEME_ICON[theme];
  return (
    <button
      type="button"
      onClick={onCycle}
      title={compact ? label : undefined}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)]',
        'text-sm font-heading font-medium transition-colors hover:bg-[var(--color-bg-tertiary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
        compact && 'justify-center px-2'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      {!compact && (
        <span className="flex items-center gap-2">
          {label}
          {theme === 'system' && (
            <span className="text-[10px] text-[var(--color-text-muted)]">({resolvedLabel})</span>
          )}
        </span>
      )}
    </button>
  );
}

