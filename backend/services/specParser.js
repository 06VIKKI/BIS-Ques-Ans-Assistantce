/**
 * Parses an uploaded specification file into compliance module inputs.
 *
 * Accepted layouts (the file never leaves the server's memory):
 *   - JSON:           {"module": "beam-456", "values": {"b": 300, ...}}  or a flat object
 *   - key: value      one parameter per line, "#" starts a comment
 *   - key = value     same, with an equals sign
 *   - CSV             "key,value" rows, or a header row followed by one data row
 * Keys match a module field by its key or its label, ignoring case, spaces and punctuation.
 */

import { MODULES } from '../compliance/index.js';

const MAX_BYTES = 200 * 1024;

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/** Friendly aliases that engineers actually write in spec sheets. */
const ALIASES = {
  width: 'b', breadth: 'b', depth: 'D', overalldepth: 'D', effectivedepth: 'd',
  concretegrade: 'fck', grade: 'fck', steelgrade: 'fy', cover: 'cover', nominalcover: 'cover',
  stirrupspacing: 'stirrupSpacing', tiespacing: 'tieSpacing', unsupportedlength: 'length',
  yieldstress: 'ys', yield: 'ys', proofstress: 'ys', tensilestrength: 'uts', massperm: 'mass', masspermetre: 'mass',
  diameter: 'dia', nominaldiameter: 'dia', sulfur: 'sulphur', phosphorous: 'phosphorus',
  stirruplegs: 'legs', barcount: 'bars', numberofbars: 'bars', tension: 'ast', asprovided: 'ast',
  agegroup: 'age', smallpartfit: 'smallParts', smallpartsfit: 'smallParts', cordlength: 'cord',
};

const MODULE_HINTS = [
  [/beam/, 'beam-456'], [/column/, 'column-456'], [/(rebar|tmt|1786|bar test)/, 'rebar-1786'],
  [/(steel|800|bolt|weld)/, 'steel-800'], [/(toy|9873)/, 'toy-9873'],
];

function parseLines(content) {
  const pairs = [];
  const rows = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('//'));

  // CSV with header row + one data row
  if (rows.length === 2 && rows[0].includes(',') && rows[0].split(',').length >= 3 && rows[0].split(',').length === rows[1].split(',').length) {
    const keys = rows[0].split(',').map((s) => s.trim());
    const vals = rows[1].split(',').map((s) => s.trim());
    keys.forEach((k, i) => pairs.push([k, vals[i]]));
    return pairs;
  }

  for (const row of rows) {
    const m = row.match(/^([^:=,\t]+?)\s*[:=,\t]\s*(.+)$/);
    if (m) pairs.push([m[1].trim(), m[2].trim().replace(/^["']|["']$/g, '')]);
  }
  const first = pairs[0];
  if (first && norm(first[0]) === 'key' && norm(first[1]) === 'value') pairs.shift();
  return pairs;
}

function flattenJson(obj) {
  const nested = obj.values || obj.parameters || obj.inputs;
  const base = nested && typeof nested === 'object' ? { ...obj, ...nested } : obj;
  return Object.entries(base).filter(([, v]) => v === null || typeof v !== 'object');
}

/**
 * @param {{filename?: string, content: string}} input
 * @returns {{moduleId: string, values: object, matched: string[], ignored: string[], warnings: string[]}}
 */
export function parseSpec({ filename = 'specification', content }) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('The file is empty.');
  if (content.length > MAX_BYTES) throw new Error('The file is larger than 200 KB.');
  if (/\u0000/.test(content)) throw new Error('This looks like a binary file. Upload JSON, CSV or plain text.');

  const warnings = [];
  let pairs;
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      pairs = flattenJson(JSON.parse(trimmed));
    } catch {
      throw new Error('The JSON in this file could not be parsed.');
    }
  } else {
    pairs = parseLines(trimmed);
  }
  if (!pairs.length) throw new Error('No "key: value" parameters were found in this file.');

  // Explicit module selector
  let moduleId = null;
  const rest = [];
  for (const [k, v] of pairs) {
    if (['module', 'moduleid', 'check', 'type'].includes(norm(k))) {
      const hit = MODULES.find((m) => norm(m.id) === norm(v) || norm(m.title) === norm(v));
      moduleId = hit?.id || MODULE_HINTS.find(([re]) => re.test(String(v).toLowerCase()))?.[1] || moduleId;
    } else if (norm(k) === 'standard' && !moduleId) {
      moduleId = MODULE_HINTS.find(([re]) => re.test(String(v).toLowerCase()))?.[1] || null;
    } else {
      rest.push([k, v]);
    }
  }

  const lookup = (mod) => {
    const map = new Map();
    for (const f of mod.fields) {
      if (!map.has(norm(f.key))) map.set(norm(f.key), f.key);
      map.set(norm(f.label), f.key);
    }
    for (const [alias, key] of Object.entries(ALIASES)) if (mod.fields.some((f) => f.key === key)) map.set(alias, key);
    return map;
  };

  const score = (mod) => rest.filter(([k]) => mod.fields.some((f) => f.key === k) || lookup(mod).has(norm(k))).length;
  let mod = moduleId ? MODULES.find((m) => m.id === moduleId) : null;
  if (!mod) {
    const ranked = MODULES.map((m) => ({ m, s: score(m) })).sort((a, b) => b.s - a.s);
    if (ranked[0].s < 2) throw new Error('Could not tell which compliance check this file is for. Add a line such as "module: beam-456".');
    mod = ranked[0].m;
    warnings.push(`Module not stated; detected "${mod.title}" from the parameter names.`);
  }

  const map = lookup(mod);
  const values = {};
  const matched = [];
  const ignored = [];
  for (const [k, v] of rest) {
    // Exact (case-sensitive) key first: "D" (overall depth) and "d" (effective depth) differ only by case.
    const key = mod.fields.some((f) => f.key === k) ? k : map.get(norm(k));
    if (!key) {
      ignored.push(k);
      continue;
    }
    const field = mod.fields.find((f) => f.key === key);
    let value = typeof v === 'string' ? v : String(v);
    if (field.type === 'select') {
      if (/^(true|y)$/i.test(value)) value = 'yes';
      if (/^(false|n)$/i.test(value)) value = 'no';
    }
    values[key] = value;
    matched.push(key);
  }
  if (ignored.length) warnings.push(`Ignored unrecognised parameters: ${ignored.join(', ')}.`);
  const missing = mod.fields.filter((f) => !(f.key in values)).map((f) => f.label);
  if (missing.length) warnings.push(`Not supplied, defaults used: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ` and ${missing.length - 6} more` : ''}.`);

  return { moduleId: mod.id, filename, values, matched, ignored, warnings };
}

/** Ready-made specification files the UI offers for download or one-click loading. */
export function buildSampleSpecs() {
  const out = [];
  for (const mod of MODULES) {
    for (const kind of ['pass', 'fail']) {
      const sample = mod.samples[kind];
      const lines = [
        `# BIS-Assist specification file: ${mod.title} (${sample.label})`,
        `module: ${mod.id}`,
        ...mod.fields.map((f) => `${f.key}: ${sample.values[f.key] ?? f.default}`),
      ];
      out.push({
        id: `${mod.id}-${kind}`,
        moduleId: mod.id,
        kind,
        filename: `${mod.id}-${kind}.spec.txt`,
        description: sample.label,
        content: lines.join('\n') + '\n',
      });
    }
  }
  return out;
}
