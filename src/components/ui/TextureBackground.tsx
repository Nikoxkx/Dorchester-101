export function TextureBackground({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`absolute inset-0 pointer-events-none select-none opacity-[0.06] ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none">
        <filter id="noise-tx"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" /></filter>
        <rect width="200" height="200" fill="var(--charcoal)" filter="url(#noise-tx)" />
      </svg>
    </div>
  );
}
