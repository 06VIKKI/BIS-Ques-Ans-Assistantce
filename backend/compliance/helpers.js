/**
 * Shared building blocks for compliance modules.
 * A module describes its input fields and an `evaluate(values)` function that returns checks.
 */

export const STATUS = { PASS: 'pass', FAIL: 'fail', WARN: 'warn', NA: 'na' };

export const round = (v, dp = 2) => Math.round(v * 10 ** dp) / 10 ** dp;
export const fmt = (v, dp = 1) => (Number.isFinite(v) ? String(round(v, dp)) : '-');

/**
 * Build one check row.
 * @param {object} c
 * @param {string} c.id           stable id, unique within the module
 * @param {string} c.name         short name shown in the table
 * @param {string} c.citationId   clause id from the corpus that this check is grounded in
 * @param {string} c.requirement  what the standard asks for, with numbers
 * @param {string} c.provided     what the submitted data shows, with numbers
 * @param {string} c.status       one of STATUS
 * @param {string} [c.advice]     what to do when the check does not pass
 */
export function makeCheck({ id, name, citationId, requirement, provided, status, advice = '' }) {
  return { id, name, citationId, requirement, provided, status, advice };
}

/** Pass or fail depending on a boolean; advice is only attached to failures. */
export function passFail(ok, fields) {
  return makeCheck({ ...fields, status: ok ? STATUS.PASS : STATUS.FAIL, advice: ok ? '' : fields.advice });
}

export const numberField = (key, label, unit, def, extra = {}) => ({ key, label, unit, type: 'number', default: def, ...extra });
export const selectField = (key, label, options, def, extra = {}) => ({
  key,
  label,
  type: 'select',
  options: options.map((o) => (typeof o === 'object' ? o : { value: String(o), label: String(o) })),
  default: String(def),
  ...extra,
});
export const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const EXPOSURE_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'very severe', label: 'Very severe' },
  { value: 'extreme', label: 'Extreme' },
];

/** IS 456 Table 5 (minimum grade) and Table 16 (nominal cover) keyed by exposure. */
export const EXPOSURE_RULES = {
  mild: { minGrade: 20, cover: 20 },
  moderate: { minGrade: 25, cover: 30 },
  severe: { minGrade: 30, cover: 45 },
  'very severe': { minGrade: 35, cover: 50 },
  extreme: { minGrade: 40, cover: 75 },
};

export const barArea = (dia) => (Math.PI * dia * dia) / 4;

/** Coerce raw form or file input to typed values and collect validation errors. */
export function coerceValues(fields, raw = {}) {
  const values = {};
  const errors = [];
  for (const f of fields) {
    let v = raw[f.key];
    if (v === undefined || v === null || v === '') v = f.default;
    if (f.type === 'number') {
      const n = typeof v === 'number' ? v : Number.parseFloat(String(v).replace(/,/g, ''));
      if (!Number.isFinite(n)) {
        errors.push({ field: f.key, message: `${f.label} must be a number.` });
        continue;
      }
      if (f.min !== undefined && n < f.min) errors.push({ field: f.key, message: `${f.label} must be at least ${f.min}${f.unit ? ' ' + f.unit : ''}.` });
      if (f.max !== undefined && n > f.max) errors.push({ field: f.key, message: `${f.label} must be at most ${f.max}${f.unit ? ' ' + f.unit : ''}.` });
      values[f.key] = n;
    } else {
      const s = String(v).toLowerCase().trim();
      const match = f.options.find((o) => o.value.toLowerCase() === s || o.label.toLowerCase() === s);
      if (!match) {
        errors.push({ field: f.key, message: `${f.label} must be one of: ${f.options.map((o) => o.label).join(', ')}.` });
        continue;
      }
      values[f.key] = match.value;
    }
  }
  return { values, errors };
}
