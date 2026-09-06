'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'desk-panel p-4',
        hoverable && 'cursor-pointer hover:border-[var(--ink)]',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-display font-semibold text-lg', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-3 border-t border-[var(--line)]', className)}>{children}</div>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-[var(--muted)] mt-1', className)}>{children}</p>;
}
