import React from 'react';

/** Renders a module's fields, grouped, from the schema the API provides. */
export default function ComplianceForm({ fields, values, errors, onChange }) {
  const groups = [];
  for (const f of fields) {
    const name = f.group || 'Parameters';
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, fields: [] }));
    g.fields.push(f);
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <fieldset key={g.name}>
          <legend className="mb-3 text-sm font-semibold">{g.name}</legend>
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {g.fields.map((f) => {
              const id = `f-${f.key}`;
              const err = errors[f.key];
              return (
                <div key={f.key} className={f.label.length > 38 ? 'sm:col-span-2' : ''}>
                  <label htmlFor={id} className="mb-1 block text-[13px] text-muted">
                    {f.label}
                    {f.unit && <span className="ml-1 text-muted/80">({f.unit})</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select id={id} className="field" value={values[f.key] ?? f.default} onChange={(e) => onChange(f.key, e.target.value)} aria-invalid={!!err}>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      className={`field tabular-nums ${err ? '!border-fail' : ''}`}
                      value={values[f.key] ?? f.default}
                      min={f.min}
                      max={f.max}
                      step={f.step ?? 'any'}
                      onChange={(e) => onChange(f.key, e.target.value)}
                      aria-invalid={!!err}
                      aria-describedby={err ? `${id}-err` : undefined}
                    />
                  )}
                  {err && <p id={`${id}-err`} className="mt-1 text-xs text-fail">{err}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
