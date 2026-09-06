'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { LANGUAGES, type LanguageCode } from '@/i18n/config';
import { useTranslation } from '@/i18n/hook';

/**
 * App-wide keyboard shortcuts.
 *
 * Every rule here bails out when focus is inside a field, a contenteditable, or
 * a browser find bar, because a shortcut that steals the "/" a person is typing
 * into a search box is worse than no shortcut. Modifier combinations are left
 * entirely alone so nothing here can shadow an OS or browser binding.
 */

const SEARCH_EVENT = 'dor101:focus-search';
const SHORTCUT_HELP_EVENT = 'dor101:show-shortcuts';
const CLOSE_EVENT = 'dor101:close-panels';

export const APP_EVENTS = { SEARCH_EVENT, SHORTCUT_HELP_EVENT, CLOSE_EVENT } as const;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (target.closest('[contenteditable="true"], [role="textbox"], [role="listbox"]')) return true;
  return false;
}

export function useKeyboardShortcuts() {
  const language = useAppStore((s) => s.language);
  const { t } = useTranslation(language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const cycleTheme = useAppStore((s) => s.cycleTheme);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const announce = useAppStore((s) => s.announce);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      switch (event.key) {
        case '/': {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(SEARCH_EVENT));
          break;
        }
        case 's':
        case 'S': {
          event.preventDefault();
          toggleSidebar();
          break;
        }
        case 'l':
        case 'L': {
          event.preventDefault();
          const index = LANGUAGES.findIndex((l) => l.code === useAppStore.getState().language);
          const next = LANGUAGES[(index + 1) % LANGUAGES.length].code as LanguageCode;
          setLanguage(next);
          announce(t('lang.changedTo', { name: LANGUAGES.find((l) => l.code === next)?.nativeName ?? next }));
          break;
        }
        case 't':
        case 'T': {
          event.preventDefault();
          cycleTheme();
          break;
        }
        case '?': {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(SHORTCUT_HELP_EVENT));
          break;
        }
        case 'Escape': {
          window.dispatchEvent(new CustomEvent(CLOSE_EVENT));
          break;
        }
        default:
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [announce, cycleTheme, language, setLanguage, t, toggleSidebar]);
}

export const SHORTCUT_LIST: Array<{ key: string; labelKey: 'a11y.key.search' | 'a11y.key.menu' | 'a11y.key.lang' | 'a11y.key.theme' | 'a11y.key.close' }> = [
  { key: '/', labelKey: 'a11y.key.search' },
  { key: 'S', labelKey: 'a11y.key.menu' },
  { key: 'L', labelKey: 'a11y.key.lang' },
  { key: 'T', labelKey: 'a11y.key.theme' },
  { key: 'Esc', labelKey: 'a11y.key.close' },
];
