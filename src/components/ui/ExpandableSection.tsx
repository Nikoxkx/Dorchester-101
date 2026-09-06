'use client';

import { useState } from 'react';
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

  return (
    <div className={cn(
      'border border-[var(--color-border)] rounded-xl overflow-hidden',
      'bg-[var(--color-bg-secondary)]',
      'transition-shadow duration-200',
      isExpanded && 'shadow-md',
      className
    )}>
      <button
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
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  stats,
  children,
  className,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={cn(
        'border border-[var(--color-border)] rounded-xl',
        'bg-[var(--color-bg-secondary)]',
        'cursor-pointer transition-shadow duration-200',
        isExpanded && 'shadow-lg',
        className
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          </motion.div>
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
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
