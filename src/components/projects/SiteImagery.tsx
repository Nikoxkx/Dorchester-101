'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, ImageOff } from 'lucide-react';
import { PhotoCredit, type CommonsCredit } from '@/components/sources/PhotoCredit';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ContextPhoto extends CommonsCredit {
  src: string;
  /** Explicitly identify the pictured place and distinguish it from the project. */
  caption: string;
}

export interface ProjectVisual {
  src: string;
  alt: string;
  /** English source caption; project records are published in English. */
  caption: string;
  kind: 'photo' | 'rendering';
  sourceUrl: string;
  sourceName: string;
}

/** Never substitute an unrelated satellite crop or neighboring-place photo for a project image. */
export function SiteImagery({ lat, lng, label, sourceUrl, contextPhoto, visual, className }: {
  lat: number;
  lng: number;
  label: string;
  sourceUrl?: string;
  contextPhoto?: ContextPhoto;
  visual?: ProjectVisual;
  className?: string;
}) {
  const { t } = useTranslation();
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  const imageAvailable = Boolean(visual && visual.src !== failedSource);
  const projectSourceUrl = visual?.sourceUrl ?? sourceUrl;

  return (
    <figure aria-label={label} className={cn('overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]', className)}>
      {contextPhoto ? (
        <>
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <Image src={contextPhoto.src} alt={contextPhoto.caption} fill sizes="(min-width:1024px) 36rem, 100vw" className="object-cover" />
          </div>
          <figcaption className="space-y-1 px-3 pt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            <p>{contextPhoto.caption}</p>
            <PhotoCredit {...contextPhoto} />
          </figcaption>
        </>
      ) : imageAvailable && visual ? (
        <>
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-white">
            {/* Official project hosts vary; use their original image directly and link the source below. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.src}
              alt={visual.alt}
              lang="en"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailedSource(visual.src)}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
          <figcaption className="space-y-1 px-3 pt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            <p lang="en">{visual.caption}</p>
            {visual.kind === 'rendering' && <p>{t('projects.artwork')}</p>}
            <a href={visual.sourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-8 items-center gap-1 font-heading font-semibold underline underline-offset-4">
              {t('ui.sourceNamed', { name: visual.sourceName })} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </figcaption>
        </>
      ) : (
        <div className="flex min-h-40 items-center gap-3 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]" aria-hidden="true"><ImageOff className="h-5 w-5" /></span>
          <div>
            <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">{t('imagery.noVerifiedPhoto')}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('imagery.noVerifiedPhotoDetail')}</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border)] px-3 py-3 text-xs font-heading font-semibold text-[var(--color-text-secondary)]">
        {projectSourceUrl && !imageAvailable && !contextPhoto && <a href={projectSourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-8 items-center gap-1 underline underline-offset-4">{t('imagery.projectSource')} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>}
        <a href={maps} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-8 items-center gap-1 underline underline-offset-4">{t('imagery.openMaps')} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
      </div>
    </figure>
  );
}
