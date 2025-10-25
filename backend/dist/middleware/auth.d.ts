import { Request, Response, NextFunction } from 'express';
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
export declare const authenticate: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Authorization middleware factory
 * Checks if authenticated user has required role(s)
 * @param roles - Array of allowed roles
 * @returns Middleware function
 */
export declare const authorize: (...roles: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map