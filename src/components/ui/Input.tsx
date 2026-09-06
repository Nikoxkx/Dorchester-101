'use client';

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const fieldClass =
  'mt-1 w-full px-3 py-2 border border-[var(--line)] bg-[var(--paper)] text-sm font-normal outline-none focus:border-[var(--ink)]';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className, id, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      id={id}
      className={cn(label ? fieldClass : 'w-full px-3 py-2 border border-[var(--line)] bg-[var(--paper)] text-sm outline-none focus:border-[var(--ink)]', className)}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label className="block text-sm font-bold" htmlFor={id}>
      {label}
      {input}
      {hint && <span className="block mt-1 text-xs font-normal text-[var(--muted)]">{hint}</span>}
    </label>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className, children, id, ...props },
  ref,
) {
  const select = (
    <select
      ref={ref}
      id={id}
      className={cn(label ? fieldClass : 'px-3 py-2 border border-[var(--line)] bg-[var(--paper)] text-sm outline-none focus:border-[var(--ink)]', className)}
      {...props}
    >
      {children}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block text-sm font-bold" htmlFor={id}>
      {label}
      {select}
    </label>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, className, id, ...props },
  ref,
) {
  const area = (
    <textarea
      ref={ref}
      id={id}
      className={cn(fieldClass, 'min-h-[120px]', className)}
      {...props}
    />
  );
  if (!label) return area;
  return (
    <label className="block text-sm font-bold" htmlFor={id}>
      {label}
      {area}
    </label>
  );
});
