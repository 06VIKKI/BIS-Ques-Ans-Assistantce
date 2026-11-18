/**
 * BIS-Assist: main application launcher.
 * Starts the API (and the built web client, if present) with: `npm start` or `node main.js`.
 */

import { createApp } from './backend/app.js';
import { config } from './backend/config.js';
import { CLAUSES } from './backend/data/clauses/index.js';
import { STANDARDS } from './backend/data/standards.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log('='.repeat(62));
  console.log('  BIS-Assist: Bureau of Indian Standards QA Assistant');
  console.log(`  Knowledge base: ${STANDARDS.length} standards, ${CLAUSES.length} clause excerpts`);
  console.log(`  API:            http://localhost:${config.port}/api/health`);
  console.log('  Web client dev: http://localhost:5173  (npm run dev)');
  console.log(`  Mode:           ${config.env}`);
  console.log('='.repeat(62));
});

const shutdown = (signal) => {
  console.log(`\n[BIS-Assist] ${signal} received, shutting down.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
