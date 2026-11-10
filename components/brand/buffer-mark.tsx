/** Buffer's stacked-layers mark, drawn in the current text colour. */
export function BufferMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m4.2 10.9-2.2 1.1 10 5 10-5-2.2-1.1L12 14.8l-7.8-3.9Z" opacity=".8" />
      <path d="m4.2 15.9-2.2 1.1 10 5 10-5-2.2-1.1L12 19.8l-7.8-3.9Z" opacity=".6" />
    </svg>
  );
}
