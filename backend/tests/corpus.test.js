import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAUSES, getClause } from '../data/clauses/index.js';
import { STANDARDS } from '../data/standards.js';
import { INTENTS } from '../data/intents.js';
import { QUICK_PROMPTS } from '../data/quickPrompts.js';
import { answerQuery } from '../services/answerEngine.js';
import { MODULES } from '../compliance/index.js';

test('clause ids are unique and every clause belongs to a registered standard', () => {
  const ids = new Set();
  for (const c of CLAUSES) {
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`);
    ids.add(c.id);
    assert.ok(STANDARDS.some((s) => s.code === c.standard), `${c.id} has unknown standard ${c.standard}`);
    assert.ok(c.text.length > 30 && c.heading && c.clause && Number.isInteger(c.page), `${c.id} is incomplete`);
  }
  assert.ok(CLAUSES.length >= 60);
});

test('every intent only cites clauses that exist, and cites at least one', () => {
  for (const intent of INTENTS) {
    for (const id of intent.clauses) assert.ok(getClause(id), `${intent.id} declares missing clause ${id}`);
    const text = intent.build('moderate exposure fe500');
    const used = [...text.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
    assert.ok(used.length > 0, `${intent.id} cites nothing`);
    for (const id of used) assert.ok(getClause(id), `${intent.id} cites missing clause ${id}`);
  }
});

test('every compliance check is grounded in a real clause', () => {
  for (const mod of MODULES) {
    for (const kind of ['pass', 'fail']) {
      const input = Object.fromEntries(
        mod.fields.map((f) => {
          const v = mod.samples[kind].values[f.key] ?? f.default;
          return [f.key, f.type === 'number' ? Number(v) : String(v)];
        }),
      );
      for (const c of mod.evaluate(input).checks) assert.ok(getClause(c.citationId), `${mod.id}/${c.id} cites missing clause ${c.citationId}`);
    }
  }
});

test('every quick prompt gets a grounded answer with citations', () => {
  for (const p of QUICK_PROMPTS) {
    const r = answerQuery(p.query);
    assert.notEqual(r.mode, 'no-match', p.query);
    assert.ok(r.citations.length > 0, p.query);
    const markers = [...r.answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
    for (const m of markers) assert.ok(r.citations.some((c) => c.ref === m), `${p.query}: marker [${m}] has no citation`);
  }
});
