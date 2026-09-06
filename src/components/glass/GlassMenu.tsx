'use client';

import { useId, useRef, useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springControl } from '@/lib/motion';

/**
 * GlassMenu — dropdown menus and pickers (language switcher, filters).
 * Clear-weight glass popover with spring entrance, full keyboard support
 * (arrows, Home/End, Escape, outside click), and screen-reader semantics.
 */

export interface GlassMenuOption {
  value: string;
  label: string;
  hint?: string;
}

export function GlassMenu({
  options,
  value,
  onChange,
  label,
  trigger,
  align = 'end',
  width = 'w-64',
  triggerClassName,
}: {
  options: GlassMenuOption[];
  value: string;
  onChange: (v: string) => void;
  /** Accessible name for the menu, e.g. "Language". */
  label: string;
  trigger: ReactNode;
  align?: 'start' | 'end';
  width?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const move = (dir: 1 | -1, currentIdx: number) => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!buttons || buttons.length === 0) return;
    const next = (currentIdx + dir + buttons.length) % buttons.length;
    buttons[next].focus();
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
      });
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const idx = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    ).findIndex((b) => b === document.activeElement);
    switch (e.key) {
      case 'Escape':
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        move(1, idx);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1, idx);
        break;
      case 'Home':
        e.preventDefault();
        listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus();
        break;
      case 'End': {
        e.preventDefault();
        const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
        buttons?.[buttons.length - 1]?.focus();
        break;
      }
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className={triggerClassName}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={springControl}
            onKeyDown={onListKey}
            className={cn(
              'glass glass-regular glass-edge squircle absolute top-full mt-2 z-[85] p-1.5',
              align === 'end' ? 'end-0' : 'start-0',
              width,
            )}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-start',
                    'text-subhead text-1 transition-colors',
                    'hover:bg-[var(--glass-clear-hover)]',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
                  )}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{opt.label}</span>
                    {opt.hint && <span className="block text-caption text-text-3">{opt.hint}</span>}
                  </span>
                  {selected && <Check className="w-4 h-4 shrink-0" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
