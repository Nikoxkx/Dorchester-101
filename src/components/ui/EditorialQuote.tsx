export function EditorialQuote({ quote, cite }: { quote: string; cite: string }) {
  return (
    <blockquote className="border-l-[6px] border-[var(--rust)] pl-6 py-2 font-display text-2xl md:text-3xl italic leading-snug tracking-[-0.03em] text-[var(--charcoal)] mb-6 relative">
      <span aria-hidden className="absolute -left-2 -top-3 text-[4rem] leading-none text-[var(--rust)] opacity-20 font-display select-none" style={{ fontFamily: 'var(--font-display)' }}>&ldquo;</span>
      {quote}
      <cite className="block font-body text-sm not-italic text-[var(--muted)] mt-3">{cite}</cite>
    </blockquote>
  );
}
