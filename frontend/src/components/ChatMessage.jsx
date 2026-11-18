import React from 'react';
import { renderAnswer } from '../lib/format';
import { Calculator, BookOpenCheck, SearchCheck, CircleSlash } from 'lucide-react';

const MODE = {
  calculation: { label: 'Worked calculation', Icon: Calculator },
  curated: { label: 'Verified answer', Icon: BookOpenCheck },
  retrieval: { label: 'Assembled from clauses', Icon: SearchCheck },
  'no-match': { label: 'No grounded answer', Icon: CircleSlash },
};

export default function ChatMessage({ message, selected, activeRef, onCite, onSelect, onFollowUp, isLast, busy }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-on-brand">{message.content}</p>
      </div>
    );
  }

  const mode = MODE[message.mode];
  return (
    <div className="flex gap-3">
      <div className={`min-w-0 max-w-[46rem] flex-1 rounded-2xl rounded-tl-md border bg-panel px-4 py-3 ${selected ? 'border-brand/50' : 'border-line'} ${message.error ? 'border-fail/50' : ''}`}>
        {message.content ? (
          <div className="answer text-[15px] leading-relaxed">
            {renderAnswer(message.content, { onCite: (ref) => onCite(message.id, ref), activeRef: selected ? activeRef : null })}
            {message.streaming && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-caret bg-ink" aria-hidden="true" />}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted" role="status">
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
            Searching the standards
          </div>
        )}

        {!message.streaming && message.citations?.length > 0 && (
          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {mode && (
                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                  <mode.Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  {mode.label}
                </span>
              )}
              <span>Grounded in {message.citations.length} clause{message.citations.length === 1 ? '' : 's'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCite(message.id, c.ref)}
                  className={`rounded-md border px-2 py-1 text-xs tabular-nums transition-colors ${
                    selected && activeRef === c.ref ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:border-brand hover:text-brand'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!message.streaming && message.mode === 'no-match' && mode && (
          <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-xs text-muted">
            <mode.Icon className="h-3.5 w-3.5" aria-hidden="true" />
            No clause matched strongly enough, so nothing is cited.
          </p>
        )}

        {isLast && !busy && !message.streaming && message.followUps?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3" aria-label="Follow-up questions">
            {message.followUps.map((f) => (
              <button key={f} type="button" onClick={() => onFollowUp(f)} className="chip !py-1 !text-xs">
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
