import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const int = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  port: int(process.env.PORT, 8000),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean),
  rateLimitPerMin: int(process.env.RATE_LIMIT_PER_MIN, 120),
  streamDelayMs: int(process.env.STREAM_DELAY_MS, 16),
  frontendDist: path.join(root, 'frontend', 'dist'),
};
