import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'root';
      formattedErrors[field] = issue.message;
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  console.error('Unhandled server error:', err);

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error)?.message || 'Internal server error',
  });
}
