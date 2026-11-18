import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import CitationCard from './CitationCard';
import CorpusNotice from './CorpusNotice';

export default function StandardsLibrary({ focusClauseId }) {
  const [standards, setStandards] = useState([]);
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [clauses, setClauses] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.standards().then((d) => setStandards(d.standards)).catch(() => setError('Could not reach the BIS-Assist server.'));
  }, []);

  // A "In library" click from the evidence panel: clear filters and open that clause.
  useEffect(() => {
    if (focusClauseId) {
      setFilter('');
      setQuery('');
      setOpenId(focusClauseId);
    }
  }, [focusClauseId]);

  useEffect(() => {
    const t = setTimeout(() => {
      api.clauses({ standard: filter, q: query }).then((d) => setClauses(d.clauses)).catch(() => setError('Could not load clauses.'));
    }, query ? 200 : 0);
    return () => clearTimeout(t);
  }, [filter, query]);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const total = standards.reduce((n, s) => n + s.clauseCount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-serif text-3xl leading-tight">Standards library</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Browse the {total || 70} clause excerpts the assistant draws on. Search by topic or filter by standard, then open a clause to read it.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-fail" role="alert">{error}</p>}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {standards.map((s) => {
          const active = filter === s.code;
          return (
            <button key={s.code} type="button" onClick={() => setFilter(active ? '' : s.code)} aria-pressed={active} className={`rounded-lg border p-3 text-left transition-colors ${active ? 'border-brand bg-brand-soft' : 'border-line bg-panel hover:border-muted/60'}`}>
              <span className="block text-sm font-semibold">{s.code}:{s.edition}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">{s.title.split(':')[0]}</span>
              <span className="mt-2 block text-xs tabular-nums text-muted">{s.clauseCount} clauses</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <label htmlFor="library-search" className="sr-only">Search clauses</label>
        <input id="library-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clauses, e.g. cover, lap length, small parts" className="field !pl-9" />
      </div>

      <p className="mb-3 text-xs text-muted" aria-live="polite">
        {clauses.length} clause{clauses.length === 1 ? '' : 's'}
        {filter && ` in ${filter}`}
        {query && ` matching "${query}"`}
      </p>

      <div className="space-y-2.5">
        {clauses.map((c) => (
          <CitationCard
            key={c.id}
            citation={{ ...c, terms, ref: undefined }}
            open={openId === c.id}
            onToggle={() => {
              const opening = openId !== c.id;
              setOpenId(opening ? c.id : null);
              if (opening) api.logCitationView(c.id);
            }}
            scrollIntoView={openId === c.id}
          />
        ))}
        {!clauses.length && !error && <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">No clauses match. Try a broader word such as "cover" or "bolt".</p>}
      </div>

      <div className="mt-8">
        <CorpusNotice />
      </div>
    </div>
  );
}
