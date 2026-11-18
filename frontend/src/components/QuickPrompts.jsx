import React from 'react';

/** Suggestion pills for common compliance questions. */
export default function QuickPrompts({ prompts, onPick, disabled, compact = false }) {
  if (!prompts.length) return null;
  return (
    <ul className={compact ? 'flex gap-2 overflow-x-auto pb-1' : 'flex flex-wrap justify-center gap-2'} aria-label="Suggested questions">
      {prompts.map((p) => (
        <li key={p.id} className="shrink-0">
          <button type="button" disabled={disabled} onClick={() => onPick(p.query)} className={`chip ${disabled ? 'opacity-50' : ''}`} title={p.query}>
            <span className="text-[11px] font-semibold text-muted">{p.standard}</span>
            {p.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
