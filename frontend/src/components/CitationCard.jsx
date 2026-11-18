import React, { useEffect, useRef } from 'react';
import { ChevronDown, Copy, Check, Library } from 'lucide-react';
import { highlight, pct } from '../lib/format';

/**
 * One piece of evidence. Collapsed it shows the clause label; expanded it shows the excerpt
 * with the matched words highlighted, so a reader can check the answer against its source.
 */
export default function CitationCard({ citation, open, onToggle, onOpenLibrary, scrollIntoView }) {
  const ref = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (open && scrollIntoView) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [open, scrollIntoView]);

  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${citation.label} ${citation.heading}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const panelId = `cite-${citation.id}`;
  return (
    <article ref={ref} className={`rounded-lg border bg-panel transition-colors ${open ? 'border-brand shadow-sm' : 'border-line hover:border-muted/60'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="flex w-full items-start gap-3 p-3 text-left">
        {citation.ref != null && (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-semibold text-brand">{citation.ref}</span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold tabular-nums text-brand">{citation.label}</span>
          <span className="mt-0.5 block text-sm leading-snug text-ink">{citation.heading}</span>
          {citation.relevance != null && (
            <span className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <span className="h-1 w-16 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
                <span className="block h-full rounded-full bg-accent" style={{ width: pct(citation.relevance) }} />
              </span>
              Match {pct(citation.relevance)}
            </span>
          )}
        </span>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <div className="expand" data-open={open} id={panelId} role="region" aria-label={`Excerpt from ${citation.label}`}>
        <div>
          <div className="border-t border-line px-3 pb-3 pt-3">
            <blockquote className="excerpt border-l-[3px] border-ink/70 pl-3 text-ink">{highlight(citation.text, citation.terms)}</blockquote>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-muted">
              <span>
                {citation.standard}:{citation.edition} &middot; condensed reference text
              </span>
              <span className="flex items-center gap-1">
                <button type="button" onClick={copy} className="btn btn-quiet !px-2 !py-1 !text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-pass" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy citation'}
                </button>
                {onOpenLibrary && (
                  <button type="button" onClick={() => onOpenLibrary(citation.id)} className="btn btn-quiet !px-2 !py-1 !text-xs">
                    <Library className="h-3.5 w-3.5" />
                    In library
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
