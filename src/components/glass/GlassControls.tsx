'use client';

import { forwardRef, useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springControl } from '@/lib/motion';

/**
 * Glass controls — the `clear` weight of the material.
 * Buttons, icon buttons, pills, segmented toggles. Nothing larger.
 * Press feedback is a spring scale (disabled under reduced motion).
 */

const press = { scale: 0.96 };
const rest = { scale: 1 };

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'clear' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  active?: boolean;
}

const sizes = {
  sm: 'h-8 px-3 text-caption gap-1.5 rounded-full',
  md: 'h-10 px-4 text-subhead gap-2 rounded-full',
  lg: 'h-12 px-6 text-body gap-2 rounded-full',
} as const;

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    { variant = 'clear', size = 'md', icon, active = false, className, children, ...rest },
    ref,
  ) {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        whileTap={reduce ? undefined : press}
        animate={reduce ? undefined : rest}
        transition={springControl}
        className={cn(
          'inline-flex select-none items-center justify-center font-semibold',
          'transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          'disabled:opacity-40 disabled:pointer-events-none',
          variant === 'clear'
            ? cn(
                'glass glass-clear glass-edge text-1',
                active ? 'bg-[var(--glass-clear-hover)]' : 'hover:bg-[var(--glass-clear-hover)]',
              )
            : cn(
                'bg-ink text-canvas shadow-flat hover:opacity-85',
              ),
          sizes[size],
          className,
        )}
        aria-pressed={active || undefined}
        {...(rest as HTMLMotionProps<'button'>)}
      >
        {icon}
        {children}
      </motion.button>
    );
  },
);

export interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  function GlassIconButton({ label, active = false, size = 'md', className, children, ...rest }, ref) {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        whileTap={reduce ? undefined : press}
        transition={springControl}
        aria-label={label}
        title={label}
        className={cn(
          'glass glass-clear glass-edge inline-flex items-center justify-center text-1',
          'hover:bg-[var(--glass-clear-hover)] transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          'disabled:opacity-40 disabled:pointer-events-none',
          size === 'sm' ? 'w-8 h-8 rounded-full' : 'w-10 h-10 rounded-full',
          active && 'bg-[var(--glass-clear-hover)]',
          className,
        )}
        {...(rest as HTMLMotionProps<'button'>)}
      >
        {children}
      </motion.button>
    );
  },
);

/** Segmented control — iOS-style, clear glass, spring thumb. */
export function GlassSegmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = options.findIndex((o) => o.value === value);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(options[(idx + 1) % options.length].value);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(options[(idx - 1 + options.length) % options.length].value);
      }
    },
    [options, value, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'glass glass-clear glass-edge inline-flex items-center gap-0.5 rounded-full p-1',
        className,
      )}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5',
              'text-caption font-semibold whitespace-nowrap',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current',
              selected ? 'text-1' : 'text-2 hover:text-1',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`seg-${ariaLabel}`}
                className="absolute inset-0 rounded-full bg-[var(--content-raised)] shadow-flat"
                transition={reduce ? { duration: 0 } : springControl}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Toggle switch — clear glass track, spring knob. */
export function GlassSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'glass glass-edge relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
        checked ? 'bg-ink' : 'glass-clear',
      )}
    >
      <motion.span
        layout
        className={cn('h-6 w-6 rounded-full shadow-flat', checked ? 'bg-canvas ml-auto' : 'bg-raised')}
        transition={reduce ? { duration: 0 } : springControl}
      />
    </button>
  );
}
