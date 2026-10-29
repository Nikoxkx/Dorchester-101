'use client';

import {
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  MapPin,
  QrCode,
  Share2,
  ShieldCheck,
  Utensils,
  Volume2,
} from 'lucide-react';
import { BADGES } from '@/lib/badges';
import { useBadgeStore } from '@/stores/badgeStore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  MapPin,
  Utensils,
  CheckCircle2,
  Volume2,
  FileText,
  QrCode,
  Calendar,
  ShieldCheck,
};

export function BadgeWall() {
  const { t } = useTranslation();
  const earned = useBadgeStore((s) => s.earned);
  const earnedCount = Object.keys(earned).length;

  const shareUrl = `/api/og?title=${encodeURIComponent(t('badges.shareTitle', { earned: earnedCount, total: BADGES.length }))}`;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
          {t('badges.title')}
          <span className="rounded-full bg-[var(--color-accent-primary)]/12 px-2 py-0.5 font-mono text-xs font-bold text-[var(--color-accent-primary)]">
            {earnedCount}/{BADGES.length}
          </span>
        </CardTitle>
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        >
          <Share2 className="h-3 w-3" aria-hidden="true" />
          {t('badges.share')}
        </a>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          {t('badges.intro', { count: BADGES.length })}
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {BADGES.map((badge) => {
            const unlockedAt = earned[badge.id];
            const Icon = ICONS[badge.icon] ?? Award;
            return (
              <li
                key={badge.id}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl border p-2.5 transition-colors',
                  unlockedAt
                    ? 'border-[var(--color-accent-green)]/45 bg-[var(--color-accent-green)]/8'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 opacity-65',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                    unlockedAt
                      ? 'bg-[var(--color-accent-green)] text-white'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-xs font-bold leading-snug">{badge.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-secondary)]">
                    {badge.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
