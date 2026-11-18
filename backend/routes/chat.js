import { Router } from 'express';
import { answerQuery, chunkAnswer } from '../services/answerEngine.js';
import { record } from '../services/auditLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { QUICK_PROMPTS } from '../data/quickPrompts.js';
import { config } from '../config.js';

const router = Router();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readMessage(req, res) {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    res.status(400).json({ error: 'Send a non-empty "message".' });
    return null;
  }
  if (message.length > 500) {
    res.status(400).json({ error: 'Questions are limited to 500 characters.' });
    return null;
  }
  return message;
}

function logQuery(sessionId, message, result) {
  record(
    sessionId,
    'chat.query',
    { query: message, mode: result.mode, intent: result.intent, confidence: result.confidence, citations: result.citations.map((c) => c.id) },
    `Q: ${message.slice(0, 120)} (${result.mode}, ${result.citations.length} citation${result.citations.length === 1 ? '' : 's'})`,
  );
}

router.get('/prompts', (req, res) => res.json({ prompts: QUICK_PROMPTS }));

/** One-shot JSON answer. */
router.post('/', (req, res) => {
  const message = readMessage(req, res);
  if (!message) return;
  const result = answerQuery(message);
  logQuery(req.sessionId, message, result);
  res.json(result);
});

/** Server-sent events: metadata first, then the answer in small chunks, then done. */
router.post('/stream', asyncHandler(async (req, res) => {
  const message = readMessage(req, res);
  if (!message) return;

  const result = answerQuery(message);
  logQuery(req.sessionId, message, result);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let closed = false;
  res.on('close', () => { closed = true; });
  const send = (event, data) => {
    if (!closed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const { answer, ...meta } = result;
  send('meta', meta);
  for (const chunk of chunkAnswer(answer)) {
    if (closed) return;
    send('token', { t: chunk });
    if (config.streamDelayMs > 0) await sleep(config.streamDelayMs);
  }
  send('done', { ok: true });
  res.end();
}));

export default router;
