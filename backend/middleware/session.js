import crypto from 'node:crypto';
import { ensureSession } from '../services/auditLog.js';

const VALID_ID = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Identifies the browser session from the x-session-id header (the client keeps the id in
 * localStorage). A missing or malformed id gets a fresh one, echoed back in the response header.
 */
export function sessionMiddleware(req, res, next) {
  let id = req.get('x-session-id');
  if (!id || !VALID_ID.test(id)) id = crypto.randomUUID();
  req.sessionId = id;
  res.set('x-session-id', id);
  ensureSession(id);
  next();
}
