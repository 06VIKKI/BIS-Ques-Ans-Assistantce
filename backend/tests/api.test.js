import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.STREAM_DELAY_MS = '0';

const { createApp } = await import('../app.js');

let server;
let base;
const SID = 'api-test-session-01';
const headers = { 'content-type': 'application/json', 'x-session-id': SID };
const post = (path, body) => fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('health reports the corpus', async () => {
  const body = await (await fetch(base + '/api/health')).json();
  assert.equal(body.status, 'healthy');
  assert.ok(body.clauses >= 60);
});

test('chat returns an answer with citations', async () => {
  const res = await post('/api/chat', { message: 'bolt pitch and edge distance' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.citations.length >= 3);
  assert.match(body.citations[0].label, /^\[IS 800: Clause [\d.]+, Page \d+\]$/);
});

test('chat validates input', async () => {
  assert.equal((await post('/api/chat', { message: '' })).status, 400);
  assert.equal((await post('/api/chat', { message: 'x'.repeat(501) })).status, 400);
  assert.equal((await post('/api/chat', {})).status, 400);
});

test('stream sends meta, tokens and done, and the tokens rebuild the answer', async () => {
  const q = 'lead limit in toy paint';
  const full = await (await post('/api/chat', { message: q })).json();
  const res = await post('/api/chat/stream', { message: q });
  assert.match(res.headers.get('content-type'), /text\/event-stream/);
  const events = (await res.text()).trim().split('\n\n').map((b) => ({ event: b.match(/event: (.+)/)[1], data: JSON.parse(b.match(/data: (.+)/)[1]) }));
  assert.equal(events[0].event, 'meta');
  assert.equal(events.at(-1).event, 'done');
  assert.equal(events.filter((e) => e.event === 'token').map((e) => e.data.t).join(''), full.answer);
});

test('compliance run, validation error and report downloads', async () => {
  assert.equal((await post('/api/compliance/run', { moduleId: 'beam-456', values: { b: 'x' } })).status, 422);

  const run = await post('/api/compliance/run', { moduleId: 'column-456', values: { bars: 3 } });
  assert.equal(run.status, 200);
  const report = await run.json();
  assert.equal(report.verdict.code, 'fail');

  for (const [format, type] of [['html', 'text/html'], ['json', 'application/json'], ['md', 'text/markdown']]) {
    const res = await fetch(`${base}/api/compliance/reports/${report.reportId}?format=${format}`, { headers });
    assert.equal(res.status, 200, format);
    assert.match(res.headers.get('content-type'), new RegExp(type));
    assert.match(res.headers.get('content-disposition'), /attachment; filename=/);
  }
  assert.equal((await fetch(`${base}/api/compliance/reports/BIS-nope`, { headers })).status, 404);
});

test('reports are private to their session', async () => {
  const run = await (await post('/api/compliance/run', { moduleId: 'beam-456', values: {} })).json();
  const other = await fetch(`${base}/api/compliance/reports/${run.reportId}`, { headers: { 'x-session-id': 'someone-else-0001' } });
  assert.equal(other.status, 404);
});

test('spec upload parsing endpoint', async () => {
  const ok = await post('/api/compliance/parse', { filename: 'a.txt', content: 'module: beam-456\nwidth: 250\nd: 420\nD: 480' });
  assert.equal((await ok.json()).moduleId, 'beam-456');
  assert.equal((await post('/api/compliance/parse', { filename: 'b.txt', content: 'nothing useful' })).status, 422);
});

test('audit trail records activity, verifies, and exports in three formats', async () => {
  await post('/api/audit/event', { type: 'citation.view', clauseId: 'IS456-26.4.2' });
  const snap = await (await fetch(base + '/api/audit', { headers })).json();
  assert.equal(snap.integrity.valid, true);
  const types = new Set(snap.events.map((e) => e.type));
  for (const t of ['session.start', 'chat.query', 'compliance.run', 'spec.upload', 'citation.view']) assert.ok(types.has(t), t);

  for (const format of ['json', 'csv', 'md']) {
    const res = await fetch(`${base}/api/audit/export?format=${format}`, { headers });
    assert.equal(res.status, 200);
    assert.ok((await res.text()).length > 100);
  }
  assert.equal((await post('/api/audit/event', { type: 'bogus' })).status, 400);
});

test('standards browse and search', async () => {
  const list = await (await fetch(base + '/api/standards')).json();
  assert.equal(list.standards.length, 5);
  const hits = await (await fetch(base + '/api/standards/clauses?q=stirrup%20spacing&standard=IS%20456')).json();
  assert.ok(hits.clauses.length > 0);
  assert.ok(hits.clauses.every((c) => c.standard === 'IS 456'));
});

test('unknown API routes return JSON 404', async () => {
  const res = await fetch(base + '/api/nope');
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});
