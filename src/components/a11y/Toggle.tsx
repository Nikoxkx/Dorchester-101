'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * An accessible switch.
 *
 * A hand-rolled `div onClick` toggle is the single most common thing AI writes
 * and the single most common thing that is invisible to a screen reader. This is
 * a real `button` with `role="switch"`, `aria-checked`, a label tied by
 * `htmlFor`/`id` to the description, and Space/Enter handling that comes free
 * from the button element. The knob animation is a decoration; it is not the
 * affordance, and it disappears with reduce-motion because Framer honours the
 * setting globally through `MotionConfig`.
 */
interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  /** Optional third state label, e.g. "Detected from your device". */
  trailing?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, trailing, disabled, className }: ToggleProps) {
  const id = useId();
  const descriptionId = description ? `${id}-desc` : undefined;

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-[var(--radius-md)]',
        'bg-[var(--color-bg-raised)] border border-[var(--color-border)] px-4 py-3',
        className
      )}
    >
      <div className="min-w-0">
        <span id={`${id}-label`} className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </span>
        {description && (
          <p id={descriptionId} className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          aria-describedby={descriptionId}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-7 w-12 rounded-full border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
            checked
              ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)]'
              : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-strong)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            className={cn(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[var(--shadow-sm)]',
              checked ? 'right-0.5' : 'left-0.5'
            )}
          />
        </button>
        {trailing && <span className="text-[11px] text-[var(--color-text-muted)]">{trailing}</span>}
      </div>
    </div>
  );
}

/**
 * Three-state choice (auto / on / off) rendered as a real radio group.
 *
 * 'auto' has to be selectable, not merely the initial value, otherwise a person
 * who enabled reduce-motion at the OS level cannot hand control back to the
 * device without finding two separate switches.
 */
interface StatusPickerProps {
  value: 'auto' | 'on' | 'off';
  onChange: (next: 'auto' | 'on' | 'off') => void;
  label: string;
  options: Array<{ value: 'auto' | 'on' | 'off'; label: string }>;
  hint?: string;
  name: string;
}

export function StatusPicker({ value, onChange, label, options, hint, name }: StatusPickerProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="font-heading text-sm font-semibold mb-1">{label}</legend>
      {hint && <p className="text-xs text-[var(--color-text-muted)] mb-2">{hint}</p>}
      <div className="inline-flex rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5 gap-0.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'relative px-3 py-1.5 rounded-[var(--radius-pill)] text-xs font-heading cursor-pointer',
                'transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                active
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="absolute inset-0 opacity-0 peer"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
