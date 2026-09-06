'use client';

import { Heart, Trash2, Share2, Printer, MapPin } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useSavedSheet } from '@/stores/uiStore';
import { useTranslation } from '@/lib/i18n';
import { GlassSheet } from '@/components/glass/GlassSheet';
import { GlassButton } from '@/components/glass/GlassControls';
import { useToast } from '@/stores/toastStore';
import { useShare, usePrintPage } from '@/lib/share';

/**
 * SavedSheet — locally stored favorites (housing, food, resources, projects).
 * No account: favorites live in localStorage on this device only.
 * Includes share (Web Share API) and a printable list.
 */
export function SavedSheet() {
  const { open, setOpen } = useSavedSheet();
  const { favorites, removeFavorite, clearFavorites, language } = useAppStore();
  const { t } = useTranslation(language);
  const toast = useToast();
  const share = useShare();
  const print = usePrintPage();

  return (
    <GlassSheet open={open} onClose={() => setOpen(false)} title={t('saved.title')} className="sm:max-w-xl">
      {favorites.length === 0 ? (
        <div className="py-10 text-center">
          <Heart className="w-8 h-8 mx-auto text-text-3 mb-3" strokeWidth={1.5} aria-hidden />
          <p className="text-body font-semibold text-1">{t('saved.empty')}</p>
          <p className="text-subhead text-text-2 mt-1 max-w-xs mx-auto">{t('saved.emptyHint')}</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2" aria-label={t('saved.title')}>
            {favorites.map((f) => (
              <li
                key={f.id}
                className="content-card squircle print-block flex items-center gap-3 p-3"
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={f.href}
                    onClick={() => setOpen(false)}
                    className="block text-subhead font-semibold text-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded"
                  >
                    {f.title}
                  </a>
                  <span className="text-caption2 font-semibold uppercase tracking-wider text-text-3">
                    {t(`saved.kind.${f.kind}`)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    void share({ title: f.title, url: new URL(f.href, window.location.origin).toString() });
                  }}
                  className="p-2 rounded-full text-text-2 hover:text-1 hover:bg-[var(--surface-2)]"
                  aria-label={`${t('common.share')} ${f.title}`}
                >
                  <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden />
                </button>
                <button
                  onClick={() => {
                    removeFavorite(f.id);
                    toast(t('saved.removed'), 'neutral');
                  }}
                  className="p-2 rounded-full text-text-2 hover:text-danger hover:bg-[var(--surface-2)]"
                  aria-label={`${t('saved.remove')} ${f.title}`}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mt-5 no-print">
            <GlassButton size="sm" onClick={print} icon={<Printer className="w-4 h-4" aria-hidden />}>
              {t('saved.print')}
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={() => {
                clearFavorites();
                toast(t('saved.cleared'), 'neutral');
              }}
              icon={<Trash2 className="w-4 h-4" aria-hidden />}
            >
              {t('saved.clearAll')}
            </GlassButton>
          </div>
          <p className="flex items-center gap-1.5 text-caption text-text-3 mt-3">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            {t('saved.localOnly')}
          </p>
        </>
      )}
    </GlassSheet>
  );
}
