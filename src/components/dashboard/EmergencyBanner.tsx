'use client';

import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function EmergencyBanner() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  return (
    <div className={cn(
      'bg-[var(--color-accent-primary)] text-white rounded-xl p-4 md:p-6',
      'flex flex-col md:flex-row md:items-center justify-between gap-4'
    )}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-lg">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg mb-1">{t('emergency.title')}</h3>
          <p className="text-white/90 text-sm">{t('emergency.body')}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="tel:18006458333" className={cn('flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg', 'bg-white text-[var(--color-accent-primary)] font-heading font-medium', 'hover:bg-white/90 transition-colors')}>
          <Phone className="w-4 h-4" />
          <span>1-800-645-8333</span>
          <span className="text-xs opacity-75">({t('emergency.foodLabel')})</span>
        </a>
        <a href="tel:211" className={cn('flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg', 'bg-white/20 text-white font-heading font-medium', 'hover:bg-white/30 transition-colors')}>
          <Phone className="w-4 h-4" />
          <span>2-1-1</span>
          <span className="text-xs opacity-75">({t('emergency.allLabel')})</span>
        </a>
      </div>
    </div>
  );
}
