'use client';

import { useState } from 'react';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import { useBadgeStore } from '@/stores/badgeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useI18n } from '@/lib/i18n';

interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
}

function storageKey(scope: string): string {
  return `dor101-notes:${scope}`;
}

function loadNotes(scope: string): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    return raw ? (JSON.parse(raw) as NoteItem[]) : [];
  } catch {
    return [];
  }
}

function saveNotes(scope: string, notes: NoteItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(notes));
  } catch {
    // ignore storage quota errors
  }
}

export function FieldNotes({
  scope = 'global',
  title,
  compact = false,
}: {
  scope?: string;
  title?: string;
  compact?: boolean;
}) {
  const { t, format } = useI18n();
  const [notes, setNotes] = useState<NoteItem[]>(() => loadNotes(scope));
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(!compact);
  const earn = useBadgeStore((s) => s.earn);

  const addNote = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next: NoteItem[] = [
      { id: `${Date.now()}`, text: trimmed, createdAt: new Date().toISOString() },
      ...notes,
    ];
    setNotes(next);
    saveNotes(scope, next);
    setDraft('');
    earn('field-scribe');
  };

  const removeNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    saveNotes(scope, next);
  };

  const exportNotes = () => {
    const content = notes
      .map((n) => `[${format.date(n.createdAt, 'short')} ${format.time(n.createdAt)}] ${n.text}`)
      .join('\n\n');
    const blob = new Blob([content || t('notes.emptyExport')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dor101-notes-${scope}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="inline-flex flex-col">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        >
          <FileText className="h-3 w-3" aria-hidden="true" />
          {t('notes.button')} {notes.length > 0 ? `(${notes.length})` : ''}
        </button>
        {open && (
          <div className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2.5 text-xs">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                placeholder={t('notes.placeholderShort')}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1 text-xs outline-none focus:border-[var(--color-accent-primary)]"
              />
              <button
                type="button"
                onClick={addNote}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent-primary)] px-2.5 py-1 font-heading text-xs font-bold text-white"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                {t('common.save')}
              </button>
            </div>
            {notes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {notes.map((n) => (
                  <li key={n.id} className="flex items-center justify-between gap-2 rounded bg-[var(--color-bg-primary)] px-2 py-1">
                    <span className="truncate">{n.text}</span>
                    <button
                      type="button"
                      onClick={() => removeNote(n.id)}
                      aria-label={t('notes.delete')}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
          {title ?? t('notes.title')}
        </CardTitle>
        {notes.length > 0 && (
          <button
            type="button"
            onClick={exportNotes}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            {t('notes.export')}
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          {t('notes.intro')}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder={t('notes.placeholder')}
            className="h-9 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs outline-none focus:border-[var(--color-accent-primary)]"
          />
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center gap-1 rounded-xl bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-xs font-bold text-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t('common.save')}
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] px-3 py-3 text-xs text-[var(--color-text-muted)]">
            {t('notes.empty')}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {notes.map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="break-words text-[var(--color-text-primary)]">{n.text}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                    {format.date(n.createdAt, 'short')} {format.time(n.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNote(n.id)}
                  aria-label={t('notes.delete')}
                  className="mt-0.5 shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
