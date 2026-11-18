import React, { useState } from 'react';
import { ChevronDown, FileText, FileJson, FileCode2, CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { api } from '../lib/api';

const VERDICT = {
  pass: { Icon: CircleCheck, cls: 'border-pass/40 bg-pass/10 text-pass' },
  conditional: { Icon: TriangleAlert, cls: 'border-warn/40 bg-warn/10 text-warn' },
  fail: { Icon: CircleX, cls: 'border-fail/40 bg-fail/10 text-fail' },
};

function CheckRow({ check }) {
  const [open, setOpen] = useState(check.status === 'fail');
  const toggle = () => {
    if (!open && check.citation) api.logCitationView(check.citation.id);
    setOpen(!open);
  };
  return (
    <li className="border-b border-line last:border-0">
      <button type="button" onClick={toggle} aria-expanded={open} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-sunken/60">
        <StatusBadge status={check.status} />
        <span className="min-w-0">
          <span className="block text-sm font-medium">{check.name}</span>
          <span className="block truncate text-xs text-muted">{check.provided}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div className="expand" data-open={open}>
        <div>
          <div className="space-y-3 px-4 pb-4 text-sm">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Required</dt>
                <dd>{check.requirement}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Provided</dt>
                <dd>{check.provided}</dd>
              </div>
            </dl>
            {check.advice && (
              <p className="rounded-md border border-line bg-surface p-2.5 text-[13px]">
                <span className="font-medium">What to do: </span>
                {check.advice}
              </p>
            )}
            {check.citation && (
              <div>
                <p className="text-xs font-semibold tabular-nums text-brand">{check.citation.label}</p>
                <blockquote className="excerpt mt-1 border-l-[3px] border-ink/70 pl-3 text-[0.9rem]">{check.citation.text}</blockquote>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ComplianceResult({ report }) {
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');
  const v = VERDICT[report.verdict.code];
  const shown = issuesOnly ? report.checks.filter((c) => c.status === 'fail' || c.status === 'warn') : report.checks;

  const exportAs = async (format) => {
    setExporting(format);
    setError('');
    try {
      await api.downloadReport(report.reportId, format);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-5" aria-live="polite">
      <div className={`rounded-xl border p-5 ${v.cls}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <v.Icon className="h-8 w-8 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-ink/70">Compliance audit result</p>
              <p className="text-2xl font-semibold leading-tight">{report.verdict.label}</p>
            </div>
          </div>
          <div className="text-right text-xs text-ink/70">
            <p className="font-medium tabular-nums text-ink">{report.reportId}</p>
            <p>{new Date(report.generatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10" role="img" aria-label={`Conformance score ${report.score} percent`}>
          <div className="h-full rounded-full bg-current" style={{ width: `${report.score}%` }} />
        </div>
        <p className="mt-2 text-sm text-ink">
          <span className="font-semibold tabular-nums">{report.counts.pass}</span> pass &middot; <span className="font-semibold tabular-nums">{report.counts.fail}</span> fail &middot;{' '}
          <span className="font-semibold tabular-nums">{report.counts.warn}</span> observation{report.counts.warn === 1 ? '' : 's'} &middot; <span className="font-semibold tabular-nums">{report.counts.na}</span> not applicable
          <span className="text-ink/70"> &middot; {report.score}% of applicable checks pass</span>
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium">Download report</span>
        {[
          ['html', 'Printable HTML', FileText],
          ['md', 'Markdown', FileCode2],
          ['json', 'JSON', FileJson],
        ].map(([fmt, label, Icon]) => (
          <button key={fmt} type="button" className="btn btn-quiet" onClick={() => exportAs(fmt)} disabled={!!exporting}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {exporting === fmt ? 'Preparing' : label}
          </button>
        ))}
        {error && <span className="text-xs text-fail">{error}</span>}
      </div>

      <section className="rounded-xl border border-line bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h3 className="text-sm font-semibold">Checks against {report.standard}</h3>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={issuesOnly} onChange={(e) => setIssuesOnly(e.target.checked)} className="accent-[rgb(var(--brand))]" />
            Show only failures and observations
          </label>
        </div>
        {shown.length ? (
          <ul>
            {shown.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-muted">Nothing to show: every check passed.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-panel p-4">
        <h3 className="mb-3 text-sm font-semibold">Derived values</h3>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {report.derived.map((d) => (
            <div key={d.label} className="flex justify-between gap-3 border-b border-line/70 pb-1.5">
              <dt className="text-muted">{d.label}</dt>
              <dd className="font-medium tabular-nums">{d.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
