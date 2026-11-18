import React, { useEffect, useState } from 'react';
import { BookMarked, X } from 'lucide-react';
import CitationCard from './CitationCard';
import CorpusNotice from './CorpusNotice';
import { api } from '../lib/api';

/**
 * Right-hand evidence panel. Shows every clause behind the selected answer. Opening a card
 * reveals the excerpt and is logged to the audit trail, so evidence review is on the record.
 */
export default function CitationPanel({ citations, question, focus, onClose, onOpenLibrary }) {
  const [openId, setOpenId] = useState(null);
  const [scroll, setScroll] = useState(false);

  // New answer selected: collapse everything. (Declared before the focus effect so a click on a
  // marker in an older answer collapses the old cards first, then opens the requested one.)
  useEffect(() => {
    setOpenId(null);
    setScroll(false);
  }, [citations]);

  // The user clicked a [n] marker or a citation chip in an answer: open that card.
  useEffect(() => {
    if (focus?.ref == null) return;
    const c = citations.find((x) => x.ref === focus.ref);
    if (c) {
      setOpenId(c.id);
      setScroll(true);
      api.logCitationView(c.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce]);

  const toggle = (c) => {
    const opening = openId !== c.id;
    setOpenId(opening ? c.id : null);
    setScroll(false);
    if (opening) api.logCitationView(c.id);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-surface" aria-label="Evidence panel">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BookMarked className="h-4 w-4 text-brand" aria-hidden="true" />
            Evidence
            {citations.length > 0 && <span className="rounded-full bg-sunken px-2 text-xs font-medium tabular-nums text-muted">{citations.length}</span>}
          </h2>
          <p className="mt-0.5 truncate text-xs text-muted">{question ? `For: ${question}` : 'The clauses behind each answer'}</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="btn btn-quiet !p-1.5" aria-label="Close evidence panel">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4">
        {citations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-5 text-sm leading-relaxed text-muted">
            <p className="font-medium text-ink">No evidence selected</p>
            <p className="mt-1">
              Every answer lists the clauses it is built from. Ask a question, then open a card here, or tap a numbered marker in the answer, to read the exact excerpt.
            </p>
          </div>
        ) : (
          citations.map((c) => <CitationCard key={c.id} citation={c} open={openId === c.id} onToggle={() => toggle(c)} onOpenLibrary={onOpenLibrary} scrollIntoView={scroll} />)
        )}
      </div>

      <div className="border-t border-line p-3">
        <CorpusNotice compact />
      </div>
    </aside>
  );
}
