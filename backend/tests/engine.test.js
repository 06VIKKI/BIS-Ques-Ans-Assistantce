import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuery, chunkAnswer } from '../services/answerEngine.js';
import { search } from '../services/retriever.js';

test('refuses questions that are outside the corpus instead of guessing', () => {
  for (const q of ['weather in delhi', 'recipe for biryani', 'who won the cricket match', '']) {
    const r = answerQuery(q);
    assert.equal(r.mode, 'no-match', q);
    assert.equal(r.citations.length, 0);
  }
});

test('column cover in moderate exposure resolves to 40 mm with its clause', () => {
  const r = answerQuery('What is the minimum cover for a column in moderate exposure?');
  assert.equal(r.intent, 'column-cover');
  assert.match(r.answer, /\*\*40 mm\*\*/);
  assert.ok(r.citations.some((c) => c.id === 'IS456-26.4.2.1'));
});

test('severe exposure column cover takes the larger durability value (45 mm)', () => {
  assert.match(answerQuery('column cover for severe exposure').answer, /\*\*45 mm\*\*/);
});

test('development length calculator matches a hand calculation', () => {
  // 16 mm Fe 500 in M25: tau_bd = 1.4 x 1.6 = 2.24, sigma = 435, Ld = 16 x 435 / (4 x 2.24) = 776.8 -> 777
  const r = answerQuery('development length for 16 mm Fe 500 bar in M25');
  assert.equal(r.mode, 'calculation');
  assert.equal(r.calc.result, '777 mm');
});

test('lap length is the larger of Ld and 30 phi', () => {
  const r = answerQuery('lap length for 12 mm Fe 415 bar in M30');
  assert.equal(r.mode, 'calculation');
  // Ld = 12 x 361.05 / (4 x 2.4) = 451.3 -> 452, which exceeds 30 x 12 = 360
  assert.equal(r.calc.result, '452 mm');
});

test('bar mass uses d^2 / 162 and the right tolerance band', () => {
  const r = answerQuery('mass per metre of a 12 mm rebar');
  assert.match(r.answer, /0\.889 kg\/m/);
  assert.match(r.answer, /5 percent per batch and 6 percent per sample/);
});

test('a numeric question missing inputs does not invent a number', () => {
  assert.notEqual(answerQuery('what is the development length').mode, 'calculation');
});

test('retrieval ranks the right standard for plain-language queries', () => {
  assert.equal(search('lead in children toy paint')[0].clause.standard, 'IS 9873 (Part 3)');
  assert.equal(search('fillet weld minimum size')[0].clause.standard, 'IS 800');
  assert.equal(search('Fe 500D elongation yield')[0].clause.standard, 'IS 1786');
});

test('chunkAnswer reassembles to the original text', () => {
  const text = 'Line one.\n\n- bullet **bold** [1]\n- another';
  assert.equal(chunkAnswer(text, 2).join(''), text);
});
