'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Building2, DollarSign, Map, Apple, Info, Calculator,
  Newspaper, BookOpen, Settings, ChevronLeft, ChevronRight, Sun, Moon, HelpCircle, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { Logo } from '@/components/ui/Logo';

export const navItems = [
  { href: '/', icon: Home, labelKey: 'nav.dashboard' },
  { href: '/affordable-housing', icon: DollarSign, labelKey: 'nav.affordable' },
  { href: '/food', icon: Apple, labelKey: 'nav.food' },
  { href: '/map', icon: Map, labelKey: 'nav.map' },
  { href: '/projects', icon: Building2, labelKey: 'nav.projects' },
  { href: '/market-trends', icon: TrendingUp, labelKey: 'nav.market' },
  { href: '/neighborhood', icon: Info, labelKey: 'nav.neighborhood' },
  { href: '/tools', icon: Calculator, labelKey: 'nav.tools' },
  { href: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { href: '/resources', icon: BookOpen, labelKey: 'nav.resources' },
  { href: '/faq', icon: HelpCircle, labelKey: 'nav.faq' },
];

export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, language } = useAppStore();
  const { t } = useTranslation(language);
  const collapsed = mobile ? false : sidebarCollapsed;

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const themeLabel = theme === 'light' ? t('theme.light') : theme === 'dark' ? t('theme.dark') : t('theme.system');

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-[#1c1d18] text-[#eeeee6]',
        'border-r border-black/40',
        mobile ? 'w-full' : 'fixed left-0 top-0 z-40',
      )}
      style={mobile ? undefined : { width: collapsed ? 56 : 232 }}
    >
      <div className="flex items-center h-14 px-3 border-b border-white/10">
        <Link href="/" onClick={onNavigate} className="flex items-center min-w-0">
          <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} invert />
        </Link>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden" aria-label="Main">
        <ul className="px-1.5 space-y-0.5">
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
                  className={cn(
                    'relative flex items-center gap-3 px-2.5 py-2 text-sm',
                    'hover:bg-white/8',
                    isActive ? 'bg-white/10 text-white' : 'text-[#c6c7be]',
                  )}
                >
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[var(--mbta)]" />}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate font-medium">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-1.5 space-y-0.5">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 text-sm text-[#c6c7be] hover:bg-white/8',
            pathname === '/settings' && 'bg-white/10 text-white',
          )}
          title={collapsed ? t('nav.settings') : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </Link>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-2.5 py-2 text-sm text-[#c6c7be] hover:bg-white/8 w-full"
          title={collapsed ? themeLabel : undefined}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {!collapsed && <span>{themeLabel}</span>}
        </button>
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-3 px-2.5 py-2 text-sm text-[#c6c7be] hover:bg-white/8 w-full"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>{collapsed ? t('nav.expand') : t('nav.collapse')}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
