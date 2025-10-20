import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};
