import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Incoming request failed schema validation',
      details: err.flatten()
    });
    return;
  }

  logger.error({ err }, 'Unhandled server error');
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err instanceof Error ? err.message : 'Unexpected server error'
  });
}
