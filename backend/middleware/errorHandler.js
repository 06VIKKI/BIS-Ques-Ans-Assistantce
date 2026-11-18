import { ValidationError } from '../compliance/index.js';

/** Wrap async route handlers so rejected promises reach the error handler (Express 4). */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) return res.status(422).json({ error: 'Validation failed', details: err.errors });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON.' });
  const status = err.status || 500;
  if (status >= 500) console.error('[BIS-Assist] Unhandled error:', err);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
}
