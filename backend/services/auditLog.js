/**
 * In-memory, per-session audit trail.
 *
 * Every event is chained to the previous one with SHA-256 (hash = sha256(prevHash + payload)),
 * so any later edit or deletion of an exported log is detectable by `verifyChain`.
 * Sessions expire after SESSION_TTL_MS of inactivity so a public deployment cannot grow without bound.
 */

import crypto from 'node:crypto';

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_SESSIONS = 2000;
const MAX_EVENTS = 500;
const MAX_REPORTS = 50;
const GENESIS = '0'.repeat(64);

const sessions = new Map();

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function prune() {
  const now = Date.now();
  for (const [id, s] of sessions) if (now - s.lastActive > SESSION_TTL_MS) sessions.delete(id);
  while (sessions.size > MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
}

export function getSession(id) {
  const s = sessions.get(id);
  if (s) s.lastActive = Date.now();
  return s || null;
}

export function ensureSession(id) {
  let s = getSession(id);
  if (!s) {
    prune();
    s = { id, createdAt: new Date().toISOString(), lastActive: Date.now(), events: [], reports: new Map() };
    sessions.set(id, s);
    record(id, 'session.start', {}, 'Session started');
  }
  return s;
}

/** Append an event and return it. */
export function record(sessionId, type, data = {}, summary = '') {
  const s = sessions.get(sessionId) || ensureSession(sessionId);
  const prevHash = s.events.length ? s.events[s.events.length - 1].hash : GENESIS;
  const event = {
    seq: s.events.length + 1,
    timestamp: new Date().toISOString(),
    type,
    summary,
    data,
    prevHash,
  };
  event.hash = sha256(prevHash + JSON.stringify([event.seq, event.timestamp, event.type, event.summary, event.data]));
  s.events.push(event);
  if (s.events.length > MAX_EVENTS) s.events.shift();
  s.lastActive = Date.now();
  return event;
}

export function saveReport(sessionId, report) {
  const s = ensureSession(sessionId);
  s.reports.set(report.reportId, report);
  while (s.reports.size > MAX_REPORTS) s.reports.delete(s.reports.keys().next().value);
}

export const getReport = (sessionId, reportId) => getSession(sessionId)?.reports.get(reportId) || null;

export const listReports = (sessionId) =>
  [...(getSession(sessionId)?.reports.values() || [])].map((r) => ({
    reportId: r.reportId,
    generatedAt: r.generatedAt,
    title: r.title,
    standard: r.standard,
    verdict: r.verdict,
    counts: r.counts,
  }));

/** Recompute every hash. The oldest retained event only needs to link to itself. */
export function verifyChain(events) {
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (i > 0 && e.prevHash !== events[i - 1].hash) return { valid: false, brokenAt: e.seq };
    const expected = sha256(e.prevHash + JSON.stringify([e.seq, e.timestamp, e.type, e.summary, e.data]));
    if (expected !== e.hash) return { valid: false, brokenAt: e.seq };
  }
  return { valid: true, brokenAt: null };
}

export function snapshot(sessionId) {
  const s = ensureSession(sessionId);
  const integrity = verifyChain(s.events);
  return {
    id: s.id,
    createdAt: s.createdAt,
    events: s.events,
    reports: listReports(sessionId),
    integrity: { ...integrity, eventCount: s.events.length, head: s.events.length ? s.events[s.events.length - 1].hash : GENESIS },
  };
}

export const resetSession = (id) => sessions.delete(id);
export const _sessionCount = () => sessions.size;
