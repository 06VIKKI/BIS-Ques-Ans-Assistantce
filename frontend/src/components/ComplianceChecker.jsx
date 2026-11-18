import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ClipboardCheck } from 'lucide-react';
import { api } from '../lib/api';
import ComplianceForm from './ComplianceForm';
import ComplianceResult from './ComplianceResult';
import SpecUploader from './SpecUploader';
import CorpusNotice from './CorpusNotice';

const defaultsFor = (mod) => Object.fromEntries(mod.fields.map((f) => [f.key, String(f.default)]));

export default function ComplianceChecker({ onActivity }) {
  const [modules, setModules] = useState([]);
  const [samples, setSamples] = useState([]);
  const [moduleId, setModuleId] = useState('beam-456');
  const [valuesBy, setValuesBy] = useState({});
  const [resultBy, setResultBy] = useState({});
  const [uploadBy, setUploadBy] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([api.modules(), api.samples()])
      .then(([m, s]) => {
        setModules(m.modules);
        setSamples(s.samples);
      })
      .catch(() => setLoadError('Could not reach the BIS-Assist server. Make sure "npm run dev" is running.'));
  }, []);

  const mod = modules.find((m) => m.id === moduleId);
  const values = useMemo(() => (mod ? { ...defaultsFor(mod), ...(valuesBy[moduleId] || {}) } : {}), [mod, valuesBy, moduleId]);
  const result = resultBy[moduleId];

  const run = useCallback(
    async (id, vals, meta = {}) => {
      setLoading(true);
      setErrors({});
      setMessage('');
      try {
        const report = await api.runAudit({ moduleId: id, values: vals, ...meta });
        setResultBy((r) => ({ ...r, [id]: report }));
        onActivity?.();
      } catch (err) {
        if (err.details) {
          setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
          setMessage('Some inputs need attention before the audit can run.');
        } else {
          setMessage(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [onActivity],
  );

  const change = (key, value) => {
    setValuesBy((v) => ({ ...v, [moduleId]: { ...values, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Parse a spec file on the server, fill the form from it, and audit straight away. */
  const loadSpec = async (filename, content) => {
    setLoading(true);
    setMessage('');
    try {
      const parsed = await api.parseSpec(filename, content);
      const target = modules.find((m) => m.id === parsed.moduleId);
      const merged = { ...defaultsFor(target), ...parsed.values };
      setModuleId(parsed.moduleId);
      setValuesBy((v) => ({ ...v, [parsed.moduleId]: merged }));
      setUploadBy((u) => ({ ...u, [parsed.moduleId]: parsed }));
      await run(parsed.moduleId, merged, { source: 'file', filename });
    } catch (err) {
      setMessage(err.message);
      setLoading(false);
    }
  };

  const onFile = async (file) => {
    if (file.size > 200 * 1024) return setMessage('That file is larger than 200 KB. Specification files should be small text files.');
    try {
      loadSpec(file.name, await file.text());
    } catch {
      setMessage('That file could not be read.');
    }
  };

  const reset = () => {
    setValuesBy((v) => ({ ...v, [moduleId]: defaultsFor(mod) }));
    setResultBy((r) => ({ ...r, [moduleId]: undefined }));
    setUploadBy((u) => ({ ...u, [moduleId]: undefined }));
    setErrors({});
    setMessage('');
  };

  if (loadError) return <p className="mx-auto mt-16 max-w-md text-center text-sm text-fail">{loadError}</p>;
  if (!mod) return <p className="mt-16 text-center text-sm text-muted">Loading checks</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-serif text-3xl leading-tight">Compliance check</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Enter the parameters of a member, test report or product, or upload a specification file. Each rule is checked against its clause and the result can be downloaded as a report.
        </p>
      </div>

      <div role="tablist" aria-label="Compliance checks" className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {modules.map((m) => {
          const active = m.id === moduleId;
          const r = resultBy[m.id];
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => { setModuleId(m.id); setErrors({}); setMessage(''); }}
              className={`rounded-lg border p-3 text-left transition-colors ${active ? 'border-brand bg-brand-soft' : 'border-line bg-panel hover:border-muted/60'}`}
            >
              <span className="block text-sm font-semibold">{m.title}</span>
              <span className="mt-0.5 flex items-center justify-between text-xs text-muted">
                {m.standard}
                {r && <span className={r.verdict.code === 'pass' ? 'text-pass' : r.verdict.code === 'fail' ? 'text-fail' : 'text-warn'}>{r.verdict.label === 'PASS WITH OBSERVATIONS' ? 'OBS.' : r.verdict.label}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="rounded-xl border border-line bg-panel p-5" aria-label="Inputs">
          <p className="mb-4 text-sm leading-relaxed text-muted">{mod.description}</p>

          <SpecUploader
            moduleSamples={samples.filter((s) => s.moduleId === moduleId)}
            onFile={onFile}
            onSample={(s) => loadSpec(s.filename, s.content)}
            busy={loading}
            info={uploadBy[moduleId]}
          />

          <hr className="my-5 border-line" />
          <ComplianceForm fields={mod.fields} values={values} errors={errors} onChange={change} />

          {message && <p className="mt-4 rounded-md border border-fail/30 bg-fail/10 p-2.5 text-sm text-fail" role="alert">{message}</p>}

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex gap-2 rounded-b-xl border-t border-line bg-panel/95 px-5 py-3 backdrop-blur">
            <button type="button" className="btn btn-primary flex-1" onClick={() => run(moduleId, values)} disabled={loading}>
              <Play className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Running audit' : 'Run compliance audit'}
            </button>
            <button type="button" className="btn btn-quiet" onClick={reset} disabled={loading} aria-label="Reset inputs">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section aria-label="Results" className="min-w-0 space-y-4">
          {result ? (
            <ComplianceResult key={result.reportId} report={result} />
          ) : (
            <div className="rounded-xl border border-dashed border-line p-8 text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">No audit run yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Run the audit with the default values, load a sample file, or enter your own parameters.</p>
            </div>
          )}
          <CorpusNotice />
        </section>
      </div>
    </div>
  );
}
