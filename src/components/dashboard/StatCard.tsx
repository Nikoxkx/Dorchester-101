'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  source?: string;
  sourceDate?: string;
  color?: string;
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  format = 'number',
  trend,
  source,
  sourceDate,
  color = 'var(--color-accent-primary)'
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          hasAnimated.current = true;
          const duration = 1200;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(value * eased));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const formattedValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(displayValue);
      case 'percent':
        return `${displayValue}%`;
      default:
        return formatNumber(displayValue);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4',
        'hover:shadow-lg transition-shadow duration-200'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-heading font-medium',
            trend.direction === 'up' && 'text-[var(--color-accent-green)]',
            trend.direction === 'down' && 'text-[var(--color-accent-secondary)]',
            trend.direction === 'neutral' && 'text-[var(--color-text-muted)]'
          )}>
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="font-mono text-2xl font-semibold mb-1">
        {formattedValue()}
      </div>
      
      <div className="text-sm text-[var(--color-text-muted)] font-heading">
        {label}
      </div>
      
      {source && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] font-heading">
            Source: {source}
            {sourceDate && <span className="block text-[10px] opacity-75">Updated: {sourceDate}</span>}
          </span>
        </div>
      )}
    </motion.div>
  );
}
