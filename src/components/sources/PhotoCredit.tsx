'use client';

import { useI18n } from '@/i18n/hook';
import { cn } from '@/lib/utils';

export interface CommonsCredit {
  commonsFile: string;
  author: string;
  license: '2.0' | '3.0' | '4.0';
}

/** Credit the actual photographer, original file and licence wherever a photo appears. */
export function PhotoCredit({ commonsFile, author, license, className }: CommonsCredit & { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn('text-[11px] leading-relaxed text-[var(--color-text-muted)]', className)}>
      <a href={`https://commons.wikimedia.org/wiki/File:${commonsFile}`} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">Wikimedia Commons</a>
      {' · '}<span dir="auto">{author}</span>{' · '}
      <a href={`https://creativecommons.org/licenses/by-sa/${license}/`} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2" dir="ltr">CC BY-SA {license}</a>
      {' · '}{t('map.photo.changed')}
    </span>
  );
}
