/**
 * Compliance engine: validates input, runs a module, and wraps the result in an auditable report.
 */

import crypto from 'node:crypto';
import { CORPUS_NOTICE } from '../data/standards.js';
import { getClause, citationLabel } from '../data/clauses/index.js';
import { coerceValues, STATUS } from './helpers.js';
import { beam456 } from './beam456.js';
import { column456 } from './column456.js';
import { rebar1786 } from './rebar1786.js';
import { steel800 } from './steel800.js';
import { toy9873 } from './toy9873.js';

export const MODULES = [beam456, column456, rebar1786, steel800, toy9873];

export const getModule = (id) => MODULES.find((m) => m.id === id) || null;

/** Public description of a module (no functions) for the UI. */
export function describeModules() {
  return MODULES.map(({ id, standard, title, description, fields, samples }) => ({ id, standard, title, description, fields, samples }));
}

export class ValidationError extends Error {
  constructor(errors) {
    super('Input validation failed');
    this.errors = errors;
  }
}

function verdictFor(counts) {
  if (counts.fail > 0) return { code: 'fail', label: 'FAIL' };
  if (counts.warn > 0) return { code: 'conditional', label: 'PASS WITH OBSERVATIONS' };
  return { code: 'pass', label: 'PASS' };
}

const newReportId = (now) =>
  `BIS-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/**
 * @param {string} moduleId
 * @param {object} rawValues
 * @param {{source?: string, filename?: string}} [meta]
 */
export function runAudit(moduleId, rawValues, meta = {}) {
  const mod = getModule(moduleId);
  if (!mod) throw new ValidationError([{ field: 'module', message: `Unknown compliance module "${moduleId}".` }]);

  const { values, errors } = coerceValues(mod.fields, rawValues);
  const extra = errors.length ? [] : mod.validate(values);
  if (errors.length || extra.length) throw new ValidationError([...errors, ...extra]);

  const { checks, derived } = mod.evaluate(values);
  const counts = { pass: 0, fail: 0, warn: 0, na: 0 };
  const enriched = checks.map((c) => {
    counts[c.status] += 1;
    const clause = getClause(c.citationId);
    return {
      ...c,
      citation: clause
        ? { id: clause.id, label: citationLabel(clause), standard: clause.standard, clause: clause.clause, heading: clause.heading, page: clause.page, text: clause.text }
        : null,
    };
  });

  const scored = counts.pass + counts.fail + counts.warn;
  const now = new Date();
  return {
    reportId: newReportId(now),
    generatedAt: now.toISOString(),
    moduleId: mod.id,
    title: mod.title,
    standard: mod.standard,
    source: meta.source || 'manual entry',
    filename: meta.filename || null,
    verdict: verdictFor(counts),
    counts,
    score: scored ? Math.round((counts.pass / scored) * 100) : 0,
    inputs: mod.fields.map((f) => ({
      key: f.key,
      label: f.label,
      unit: f.unit || '',
      value: f.type === 'select' ? f.options.find((o) => o.value === values[f.key])?.label ?? values[f.key] : values[f.key],
    })),
    checks: enriched,
    derived,
    notice: CORPUS_NOTICE,
  };
}

export { STATUS };
