'use client';

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentId = useId();

  return (
    <div className={cn(
      'border border-[var(--color-border)] rounded-xl overflow-hidden',
      'bg-[var(--color-bg-secondary)]',
      'transition-shadow duration-200',
      isExpanded && 'shadow-md',
      className
    )}>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 p-4 text-left',
          'hover:bg-[var(--color-bg-tertiary)] transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]'
        )}
      >
        {icon && (
          <div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-medium">
                {badge}
              </span>
            )}
          </div>
          {preview && !isExpanded && (
            <p className="text-sm text-[var(--color-text-muted)] truncate mt-0.5">{preview}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">
              {children}
              
              {sourceUrl && sourceName && (
                <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-primary)] hover:underline"
                  >
                    Source: {sourceName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: { label: string; value: string }[];
  children: React.ReactNode;
  className?: string;
  /** Controlled mode: the parent decides which card is open. */
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
}

/**
 * A card that opens on its own. Two things the first version got wrong, both of
 * which made *neighbouring* cards appear to open when one was clicked: the
 * whole card was the click target (so a click on the open body toggled it
 * again), and the `layout` prop animated every sibling in the grid as the row
 * grew. The header is now the only button, the body uses a plain height
 * animation, and the grid it sits in aligns to `items-start`.
 */
export function ExpandableCard({
  title,
  subtitle,
  icon,
  stats,
  children,
  className,
  expanded,
  onToggle,
}: ExpandableCardProps) {
  const [internal, setInternal] = useState(false);
  const isExpanded = expanded ?? internal;
  const contentId = useId();
  const toggle = () => {
    const next = !isExpanded;
    if (onToggle) onToggle(next);
    if (expanded === undefined) setInternal(next);
  };

  return (
    <div
      className={cn(
        'self-start border border-[var(--color-border)] rounded-xl',
        'bg-[var(--color-bg-secondary)] transition-shadow duration-200',
        isExpanded && 'shadow-lg',
        className
      )}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggle}
        className="w-full rounded-xl p-4 text-left hover:bg-[var(--color-bg-tertiary)]/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" aria-hidden="true" />
          </motion.span>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-4 mt-3">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="font-mono font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 0.84, 0.44, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
