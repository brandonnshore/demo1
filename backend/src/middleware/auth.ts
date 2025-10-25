import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { env } from '../config/env';

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required - no token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Authentication required - invalid token format');
    }

    // Verify and decode token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Validate decoded payload structure
    if (!decoded.id || !decoded.email || !decoded.role) {
      throw new ApiError(401, 'Invalid token payload');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorization middleware factory
 * Checks if authenticated user has required role(s)
 * @param roles - Array of allowed roles
 * @returns Middleware function
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Insufficient permissions - requires one of: ${roles.join(', ')}`));
    }

    next();
  };
};
