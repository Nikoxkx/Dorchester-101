'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  title: string;
  icon?: React.ReactNode;
  preview?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  badge?: string;
  sourceUrl?: string;
  sourceName?: string;
}

export function ExpandableSection({
  title,
  icon,
  preview,
  children,
  defaultExpanded = false,
  className,
  badge,
  sourceUrl,
  sourceName,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <div className={cn('border border-[var(--line)] bg-[var(--surface)]', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--paper)]"
      >
        {icon && <div className="text-[var(--red)]">{icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold">{title}</h3>
            {badge && <span className="badge">{badge}</span>}
          </div>
          {preview && !open && <p className="text-sm text-[var(--muted)] truncate mt-0.5">{preview}</p>}
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--line)] pt-3">
          {children}
          {sourceUrl && sourceName && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline mt-3">
              Source: {sourceName} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  stats,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: { label: string; value: string }[];
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('border border-[var(--line)] bg-[var(--surface)]', className)}>
      <button onClick={() => setOpen(!open)} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          {icon && <div className="text-[var(--red)]">{icon}</div>}
          <div className="flex-1">
            <h3 className="font-display font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>}
          </div>
          <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
        </div>
        {stats && (
          <div className="flex flex-wrap gap-4 mt-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{stat.label}</p>
                <p className="font-mono text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </button>
      {open && <div className="px-4 pb-4 border-t border-[var(--line)] pt-3">{children}</div>}
    </div>
  );
}
