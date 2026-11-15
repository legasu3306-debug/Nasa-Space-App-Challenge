import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api', apiRateLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'fieldshift-ethiopia-server',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRouter);
app.use(errorMiddleware);
