import { Router } from 'express';
import { STANDARDS, CORPUS_NOTICE } from '../data/standards.js';
import { CLAUSES, citationLabel } from '../data/clauses/index.js';
import { search } from '../services/retriever.js';

const router = Router();

router.get('/', (req, res) => {
  const standards = STANDARDS.map((s) => ({ ...s, clauseCount: CLAUSES.filter((c) => c.standard === s.code).length }));
  res.json({ notice: CORPUS_NOTICE, totalClauses: CLAUSES.length, standards });
});

/** Browse or search clauses: /api/standards/clauses?standard=IS 456&q=cover */
router.get('/clauses', (req, res) => {
  const standard = typeof req.query.standard === 'string' ? req.query.standard : '';
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 200) : '';
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 60, 120);

  let rows;
  if (q.trim()) {
    rows = search(q, { limit, standard: standard || undefined }).map((r) => ({ ...r.clause, relevance: Number(r.confidence.toFixed(2)) }));
  } else {
    rows = CLAUSES.filter((c) => !standard || c.standard === standard || c.standard.startsWith(standard)).slice(0, limit);
  }
  res.json({ count: rows.length, clauses: rows.map((c) => ({ ...c, label: citationLabel(c) })) });
});

export default router;
