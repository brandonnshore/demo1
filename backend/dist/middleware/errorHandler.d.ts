import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare class ApiError extends Error implements AppError {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
//# sourceMappingURL=errorHandler.d.ts.map