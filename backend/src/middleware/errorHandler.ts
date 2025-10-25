import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { isDevelopment } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error with context
  logger.error('Request error', {
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  }, err);

  if (isDevelopment) {
    // Development - include full error details for debugging
    res.status(err.statusCode).json({
      status: err.status,
      error: err.name,
      message: err.message,
      stack: err.stack,
      details: err,
    });
  } else {
    // Production - don't leak error details
    if (err.isOperational) {
      // Operational errors are safe to send to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown errors - generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};

export class ApiError extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
