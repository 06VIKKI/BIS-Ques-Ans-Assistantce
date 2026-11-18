import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Trash2, MessageSquareText, ClipboardCheck, FileUp, BookMarked, Download, PlayCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';
import StatusBadge from './StatusBadge';

const EVENT_ICON = {
  'session.start': PlayCircle,
  'chat.query': MessageSquareText,
  'citation.view': BookMarked,
  'compliance.run': ClipboardCheck,
  'spec.upload': FileUp,
  export: Download,
};

const VERDICT_STATUS = { pass: 'pass', fail: 'fail', conditional: 'warn' };

export default function AuditTrail({ refreshKey, onChanged }) {
  const [snap, setSnap] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.audit();
      setSnap(data);
      onChanged?.(data.events.length);
      setError('');
    } catch {
      setError('Could not load the audit trail. Is the server running?');
    }
  }, [onChanged]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const run = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  const clear = () => {
    if (window.confirm('Clear this session\'s audit trail and saved reports? This cannot be undone.')) run('clear', api.resetAudit);
  };

  if (!snap) return <p className="mt-16 text-center text-sm text-muted">{error || 'Loading audit trail'}</p>;
  const ok = snap.integrity.valid;
  const events = [...snap.events].reverse();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-serif text-3xl leading-tight">Audit trail</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Every question, evidence view, specification upload, audit run and export in this browser session is logged here. Each entry is hash-chained to the one before it, so changes to an exported log can be detected.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-fail" role="alert">{error}</p>}

      <div className="mb-6 rounded-xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {ok ? <ShieldCheck className="mt-0.5 h-6 w-6 text-pass" aria-hidden="true" /> : <ShieldAlert className="mt-0.5 h-6 w-6 text-fail" aria-hidden="true" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold">{ok ? 'Chain verified' : `Chain broken at event ${snap.integrity.brokenAt}`}</p>
              <p className="text-xs text-muted tabular-nums">{snap.integrity.eventCount} events &middot; session {snap.id.slice(0, 8)}</p>
              <p className="mt-1 break-all text-[11px] text-muted">Head: <code>{snap.integrity.head}</code></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Download log</span>
            {['json', 'csv', 'md'].map((f) => (
              <button key={f} type="button" className="btn btn-quiet !px-3 uppercase" disabled={!!busy} onClick={() => run(f, () => api.downloadLog(f))}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {f}
              </button>
            ))}
            <button type="button" className="btn btn-quiet !px-2.5" onClick={() => run('refresh', async () => {})} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${busy === 'refresh' ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" className="btn btn-quiet !px-2.5 text-fail" onClick={clear} aria-label="Clear session">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {snap.reports.length > 0 && (
        <section className="mb-6" aria-label="Compliance reports">
          <h2 className="mb-2 text-sm font-semibold">Compliance reports this session</h2>
          <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
            {[...snap.reports].reverse().map((r) => (
              <li key={r.reportId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.title} <span className="text-muted">({r.standard})</span></p>
                  <p className="text-xs tabular-nums text-muted">{r.reportId} &middot; {new Date(r.generatedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={VERDICT_STATUS[r.verdict.code]} />
                  {['html', 'md', 'json'].map((f) => (
                    <button key={f} type="button" className="btn btn-quiet !px-2 !py-1 !text-xs uppercase" disabled={!!busy} onClick={() => run(`${r.reportId}${f}`, () => api.downloadReport(r.reportId, f))}>
                      <FileText className="h-3 w-3" aria-hidden="true" />
                      {f}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Event log">
        <h2 className="mb-2 text-sm font-semibold">Events, newest first</h2>
        <ol className="space-y-2">
          {events.map((e) => {
            const Icon = EVENT_ICON[e.type] || PlayCircle;
            return (
              <li key={e.seq} className="flex gap-3 rounded-lg border border-line bg-panel px-3 py-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm">{e.summary}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                    #{e.seq} &middot; {new Date(e.timestamp).toLocaleTimeString()} &middot; <code>{e.hash.slice(0, 12)}</code>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
