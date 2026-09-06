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

const NAV_GROUP_A = ['/', '/affordable-housing', '/food', '/map'];
const NAV_GROUP_B = ['/projects', '/market-trends', '/neighborhood', '/tools', '/news', '/resources', '/faq'];

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

  const itemClass = (isActive: boolean) =>
    cn(
      'relative flex items-center gap-3 px-2.5 py-[9px] text-sm rounded-md transition-colors',
      isActive ? 'bg-white/10 text-white font-semibold' : 'text-[#A9BFB4] hover:bg-white/5 hover:text-white',
    );

  const renderItem = (href: string, label: string) => {
    const item = navItems.find((n) => n.href === href)!;
    const Icon = item.icon;
    const isActive = pathname === href;
    const labelText = t(item.labelKey);
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={onNavigate}
          title={collapsed ? labelText : undefined}
          aria-current={isActive ? 'page' : undefined}
          className={itemClass(isActive)}
        >
          {isActive && <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#E8B54A]" />}
          <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.4 : 2} />
          {!collapsed && <span className="truncate">{labelText}</span>}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-[#0F2820] text-[#EDF4EF]',
        'border-r border-black/50',
        mobile ? 'w-full' : 'fixed left-0 top-0 z-40',
      )}
      style={mobile ? undefined : { width: collapsed ? 60 : 236 }}
    >
      <div className="flex items-center h-14 px-3 border-b border-white/10">
        <Link href="/" onClick={onNavigate} className="flex items-center min-w-0">
          <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} invert />
        </Link>
      </div>

      <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <p className={cn('px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E8F82]', collapsed && 'sr-only')}>
          Essentials
        </p>
        <nav aria-label="Main">
          <ul className="px-1.5 space-y-0.5">
            {navItems.filter((n) => NAV_GROUP_A.includes(n.href)).map((n) => renderItem(n.href, n.labelKey))}
          </ul>
        </nav>

        <p className={cn('px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E8F82]', collapsed && 'sr-only')}>
          Neighborhood
        </p>
        <nav aria-label="Neighborhood">
          <ul className="px-1.5 space-y-0.5">
            {navItems.filter((n) => NAV_GROUP_B.includes(n.href)).map((n) => renderItem(n.href, n.labelKey))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 p-2 space-y-0.5">
        <Link
          href="/settings"
          onClick={onNavigate}
          title={collapsed ? t('nav.settings') : undefined}
          className={cn(itemClass(pathname === '/settings'))}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </Link>
        <button
          onClick={toggleTheme}
          title={collapsed ? themeLabel : undefined}
          className={cn(itemClass(false), 'w-full')}
        >
          {theme === 'dark' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          {!collapsed && <span>{themeLabel}</span>}
        </button>
        {!mobile && (
          <button
            onClick={toggleSidebar}
            title={collapsed ? t('nav.expand') : t('nav.collapse')}
            className={cn(itemClass(false), 'w-full')}
          >
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
            {!collapsed && <span>{t('nav.collapse')}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
