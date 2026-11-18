import { Router } from 'express';
import { getClause, citationLabel } from '../data/clauses/index.js';
import { buildSessionExport } from '../services/reportBuilder.js';
import { record, snapshot, resetSession, ensureSession } from '../services/auditLog.js';

const router = Router();

router.get('/', (req, res) => res.json(snapshot(req.sessionId)));

/** Client-reported events, currently only "citation opened" so evidence review is part of the trail. */
router.post('/event', (req, res) => {
  const { type, clauseId } = req.body || {};
  if (type !== 'citation.view') return res.status(400).json({ error: 'Unsupported event type.' });
  const clause = getClause(clauseId);
  if (!clause) return res.status(404).json({ error: 'Unknown clause id.' });
  record(req.sessionId, 'citation.view', { clauseId }, `Opened evidence ${citationLabel(clause)}`);
  res.json({ ok: true });
});

router.get('/export', (req, res) => {
  const format = ['json', 'csv', 'md'].includes(req.query.format) ? req.query.format : 'json';
  record(req.sessionId, 'export', { kind: 'session-log', format }, `Exported session log as ${format.toUpperCase()}`);
  const out = buildSessionExport(snapshot(req.sessionId), format);
  res.set({ 'Content-Type': out.contentType, 'Content-Disposition': `attachment; filename="${out.filename}"`, 'Access-Control-Expose-Headers': 'Content-Disposition, x-session-id' });
  res.send(out.body);
});

/** Clear this session's trail and start a new chain. */
router.delete('/', (req, res) => {
  resetSession(req.sessionId);
  ensureSession(req.sessionId);
  res.json(snapshot(req.sessionId));
});

export default router;
