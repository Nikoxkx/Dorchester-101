'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative mx-auto mt-16 bg-[var(--surface)] border border-[var(--ink)] shadow-xl"
        style={{ width: `min(${wide ? '640px' : '480px'}, calc(100% - 24px))` }}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <h2 className="font-display text-xl">{title}</h2>
            <button onClick={onClose} className="p-1" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
