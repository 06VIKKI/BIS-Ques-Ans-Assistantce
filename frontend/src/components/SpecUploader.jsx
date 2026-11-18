import React, { useRef, useState } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import { saveBlob } from '../lib/api';

/**
 * Drop zone for specification files plus one-click sample files.
 * Files are read in the browser and sent as text; nothing is stored on the server.
 */
export default function SpecUploader({ moduleSamples, onFile, onSample, busy, info }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (file) => {
    if (file) onFile(file);
    if (input.current) input.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
        className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${over ? 'border-brand bg-brand-soft' : 'border-line bg-surface'}`}
      >
        <Upload className="mx-auto h-5 w-5 text-brand" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium">Audit a specification file</p>
        <p className="mt-0.5 text-xs text-muted">Drop a .json, .csv or .txt file of parameters, or</p>
        <button type="button" className="btn btn-quiet mt-2" disabled={busy} onClick={() => input.current?.click()}>
          Choose file
        </button>
        <input ref={input} type="file" accept=".json,.csv,.txt,.spec,text/plain,application/json,text/csv" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Upload specification file" />
      </div>

      {info && (
        <div className="rounded-md border border-line bg-surface p-3 text-xs leading-relaxed" role="status">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <FileText className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {info.filename}: {info.matched.length} parameters read
          </p>
          {info.warnings.map((w) => (
            <p key={w} className="mt-1 text-muted">{w}</p>
          ))}
        </div>
      )}

      {moduleSamples.length > 0 && (
        <div className="text-xs">
          <p className="mb-1.5 text-muted">No file to hand? Try a sample:</p>
          <ul className="space-y-1.5">
            {moduleSamples.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <button type="button" disabled={busy} onClick={() => onSample(s)} className="text-left font-medium text-brand hover:underline disabled:opacity-50">
                  {s.description}
                </button>
                <button
                  type="button"
                  onClick={() => saveBlob(new Blob([s.content], { type: 'text/plain' }), s.filename)}
                  className="inline-flex items-center gap-1 text-muted hover:text-ink"
                  aria-label={`Download ${s.filename}`}
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
