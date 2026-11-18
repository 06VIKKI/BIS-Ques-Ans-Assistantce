import React from 'react';
import { Info } from 'lucide-react';

/** Shown wherever clause text appears: the corpus is a condensed demo, not the official text. */
export default function CorpusNotice({ compact = false }) {
  return (
    <p className={`flex gap-2 rounded-md border border-warn/30 bg-warn/10 text-ink ${compact ? 'p-2 text-[11.5px] leading-snug' : 'p-3 text-[13px] leading-relaxed'}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
      <span>
        Excerpts are condensed summaries from a demonstration corpus, not the verbatim BIS text. Clause and page references are indicative. Confirm every value against the official standard before relying on it.
      </span>
    </p>
  );
}
