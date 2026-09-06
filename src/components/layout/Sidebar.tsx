'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home, Building2, DollarSign, Map, Apple, Info, Calculator,
  Newspaper, BookOpen, Settings, PanelLeftClose, PanelLeftOpen,
  HelpCircle, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { springControl } from '@/lib/motion';

/** One icon family (Lucide, one stroke weight), one nav structure everywhere. */
export const navItems: { href: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { href: '/', icon: Home, labelKey: 'nav.dashboard' },
  { href: '/affordable-housing', icon: DollarSign, labelKey: 'nav.affordable' },
  { href: '/projects', icon: Building2, labelKey: 'nav.projects' },
  { href: '/food', icon: Apple, labelKey: 'nav.food' },
  { href: '/map', icon: Map, labelKey: 'nav.map' },
  { href: '/market-trends', icon: TrendingUp, labelKey: 'nav.market' },
  { href: '/neighborhood', icon: Info, labelKey: 'nav.neighborhood' },
  { href: '/tools', icon: Calculator, labelKey: 'nav.tools' },
  { href: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { href: '/resources', icon: BookOpen, labelKey: 'nav.resources' },
  { href: '/faq', icon: HelpCircle, labelKey: 'nav.faq' },
];

/**
 * Sidebar — glass control layer. Floats over content; content never sits on it.
 * Uses logical properties (inset-inline) so Arabic mirrors correctly.
 */
export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();
  const collapsed = mobile ? false : sidebarCollapsed;

  return (
    <aside
      className={cn(
        'glass glass-regular glass-edge h-dvh flex flex-col no-print',
        mobile ? 'w-full' : 'fixed inset-y-0 start-0 z-40',
      )}
      style={mobile ? undefined : { width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)', borderRadius: 0 }}
      aria-label={t('nav.dashboard')}
    >
      <div className="flex items-center h-14 px-4 shrink-0">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded-lg"
          aria-label="DOR101 home"
        >
          <span
            className="squircle grid place-items-center bg-ink text-canvas font-bold shrink-0"
            style={{ width: 30, height: 30, borderRadius: 9, fontSize: 13 }}
            aria-hidden
          >
            101
          </span>
          {!collapsed && (
            <span className="text-title3 font-bold tracking-tight truncate">DOR101</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2" aria-label="Main">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-subhead font-medium',
                    'transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
                    collapsed && 'justify-center px-0',
                    isActive ? 'text-1' : 'text-text-2 hover:text-1 hover:bg-[var(--glass-clear-hover)]',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-[12px] bg-[var(--glass-clear-hover)]"
                      transition={reduce ? { duration: 0 } : springControl}
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0 relative z-10" strokeWidth={2} aria-hidden />
                  {!collapsed && <span className="truncate relative z-10">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2 space-y-0.5 shrink-0">
        <SidebarLink
          href="/settings"
          icon={Settings}
          label={t('nav.settings')}
          collapsed={collapsed}
          active={pathname === '/settings'}
          onClick={onNavigate}
        />
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-subhead font-medium w-full text-start',
              'text-text-2 hover:text-1 hover:bg-[var(--glass-clear-hover)] transition-colors',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
            title={collapsed ? t('nav.expand') : undefined}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" strokeWidth={2} aria-hidden />
            ) : (
              <PanelLeftClose className="w-[18px] h-[18px] shrink-0" strokeWidth={2} aria-hidden />
            )}
            {!collapsed && <span>{t('nav.collapse')}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  collapsed,
  active,
  onClick,
}: {
  href: string;
  icon: typeof Settings;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-subhead font-medium',
        'transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-[var(--glass-clear-hover)] text-1'
          : 'text-text-2 hover:text-1 hover:bg-[var(--glass-clear-hover)]',
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} aria-hidden />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
