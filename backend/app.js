/**
 * BIS-Assist Express application.
 * Exported as a factory so tests can start it on an ephemeral port.
 */

import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { STANDARDS, CORPUS_NOTICE } from './data/standards.js';
import { CLAUSES } from './data/clauses/index.js';
import { sessionMiddleware } from './middleware/session.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import chatRoutes from './routes/chat.js';
import standardsRoutes from './routes/standards.js';
import complianceRoutes from './routes/compliance.js';
import auditRoutes from './routes/audit.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs behind Render, Railway, Nginx

  app.use(helmet({ contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': null } } }));
  app.use(cors({ origin: config.corsOrigin.includes('*') ? true : config.corsOrigin, exposedHeaders: ['x-session-id', 'Content-Disposition'] }));
  // Server-sent events must not be buffered by gzip.
  app.use(compression({ filter: (req, res) => !req.path.endsWith('/stream') && compression.filter(req, res) }));
  if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '300kb' }));

  app.get('/api/health', (req, res) =>
    res.json({
      status: 'healthy',
      service: 'BIS-Assist',
      version: '1.0.0',
      standards: STANDARDS.map((s) => `${s.code}:${s.edition}`),
      clauses: CLAUSES.length,
      notice: CORPUS_NOTICE,
    }),
  );

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: config.rateLimitPerMin,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a moment and try again.' },
  });
  app.use('/api', limiter, sessionMiddleware);
  app.use('/api/chat', chatRoutes);
  app.use('/api/standards', standardsRoutes);
  app.use('/api/compliance', complianceRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api', notFound);

  // Serve the built React client when present (production / `npm start`).
  const indexHtml = path.join(config.frontendDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use('/assets', express.static(path.join(config.frontendDist, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(config.frontendDist, { maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(indexHtml));
  } else {
    app.get('/', (req, res) =>
      res.type('text/plain').send('BIS-Assist API is running. Start the web client with "npm run dev" (http://localhost:5173) or build it with "npm run build".'),
    );
  }

  app.use(errorHandler);
  return app;
}
