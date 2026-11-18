import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, runAudit, ValidationError } from '../compliance/index.js';
import { parseSpec, buildSampleSpecs } from '../services/specParser.js';
import { ensureSession, record, snapshot, verifyChain } from '../services/auditLog.js';

test('sample inputs give the intended verdicts for every module', () => {
  for (const mod of MODULES) {
    assert.equal(runAudit(mod.id, mod.samples.pass.values).verdict.code, 'pass', `${mod.id} pass sample`);
    assert.equal(runAudit(mod.id, mod.samples.fail.values).verdict.code, 'fail', `${mod.id} fail sample`);
  }
});

test('beam: minimum steel boundary is inclusive', () => {
  // b=300, d=500, Fe500: Asmin = 0.85 x 300 x 500 / 500 = 255 mm2
  assert.equal(runAudit('beam-456', { ast: 255 }).checks.find((c) => c.id === 'as-min').status, 'pass');
  assert.equal(runAudit('beam-456', { ast: 254 }).checks.find((c) => c.id === 'as-min').status, 'fail');
});

test('column: 3 bars of 10 mm fails count, diameter and steel percentage', () => {
  const r = runAudit('column-456', { bars: 3, barDia: 10 });
  for (const id of ['bar-count', 'bar-dia', 'ast-min']) assert.equal(r.checks.find((c) => c.id === id).status, 'fail', id);
});

test('rebar: low elongation fails, and chemistry for grades not in the corpus is not guessed', () => {
  assert.equal(runAudit('rebar-1786', { elongation: 15.9 }).checks.find((c) => c.id === 'elongation').status, 'fail');
  const fe600 = runAudit('rebar-1786', { grade: 'Fe 600', ys: 620, uts: 700, elongation: 12 });
  assert.equal(fe600.checks.find((c) => c.id === 'chem-carbon').status, 'na');
});

test('toy: small parts rule depends on age group', () => {
  const status = (v) => runAudit('toy-9873', v).checks.find((c) => c.id === 'small-parts').status;
  assert.equal(status({ age: 'under36', smallParts: 'yes' }), 'fail');
  assert.equal(status({ age: 'over36', smallParts: 'yes', warning: 'yes' }), 'pass');
  assert.equal(status({ age: 'over36', smallParts: 'yes', warning: 'no' }), 'fail');
});

test('invalid input is rejected with field-level errors', () => {
  assert.throws(() => runAudit('beam-456', { b: 'abc' }), (e) => e instanceof ValidationError && e.errors[0].field === 'b');
  assert.throws(() => runAudit('beam-456', { fck: '99' }), ValidationError);
  assert.throws(() => runAudit('nope', {}), ValidationError);
});

test('a report carries the clause excerpt for each check', () => {
  const r = runAudit('beam-456', {});
  assert.match(r.reportId, /^BIS-\d{8}-[0-9A-F]{6}$/);
  for (const c of r.checks) assert.ok(c.citation?.text, c.id);
});

test('every sample specification file round-trips through the parser', () => {
  for (const s of buildSampleSpecs()) {
    const parsed = parseSpec(s);
    assert.equal(parsed.moduleId, s.moduleId);
    assert.equal(parsed.warnings.length, 0, s.id);
    assert.equal(runAudit(parsed.moduleId, parsed.values).verdict.code, s.kind);
  }
});

test('parser handles JSON, aliases, CSV and rejects junk', () => {
  const json = parseSpec({ content: '{"module":"beam-456","values":{"width":250,"effective depth":420,"D":480}}' });
  assert.deepEqual(json.values, { b: '250', d: '420', D: '480' });
  assert.equal(parseSpec({ content: 'module,beam-456\nwidth,250\neffective depth,420' }).values.d, '420');
  assert.equal(parseSpec({ content: 'b,D,d,fck,fy\n300,550,500,25,500' }).moduleId, 'beam-456');
  assert.throws(() => parseSpec({ content: 'hello world' }), /No "key: value"/);
  assert.throws(() => parseSpec({ content: '' }), /empty/);
  assert.throws(() => parseSpec({ content: '{"broken": ' }), /parsed/);
});

test('audit chain detects tampering and deletion', () => {
  const id = 'chain-test-0001';
  ensureSession(id);
  record(id, 'chat.query', { q: 'a' }, 'Q: a');
  record(id, 'chat.query', { q: 'b' }, 'Q: b');
  const snap = snapshot(id);
  assert.equal(snap.integrity.valid, true);
  const edited = structuredClone(snap.events);
  edited[1].summary = 'edited';
  assert.deepEqual(verifyChain(edited), { valid: false, brokenAt: 2 });
  assert.equal(verifyChain(structuredClone(snap.events).filter((e) => e.seq !== 2)).valid, false);
});
