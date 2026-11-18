import React from 'react';

/** Mark: a standards sheet with a folded corner and a tick, drawn to match the favicon. */
export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 3h14l6 6v20H6z" className="fill-ink" />
      <path d="M20 3v6h6" className="fill-accent" />
      <path d="M10.5 16.5l3.2 3.2 6-6.4" fill="none" className="stroke-surface" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 24h12" className="stroke-surface" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}
