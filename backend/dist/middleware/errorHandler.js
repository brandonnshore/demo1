"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log error with context
    logger_1.logger.error('Request error', {
        method: req.method,
        url: req.originalUrl,
        statusCode: err.statusCode,
        isOperational: err.isOperational,
    }, err);
    if (env_1.isDevelopment) {
        // Development - include full error details for debugging
        res.status(err.statusCode).json({
            status: err.status,
            error: err.name,
            message: err.message,
            stack: err.stack,
            details: err,
        });
    }
    else {
        // Production - don't leak error details
        if (err.isOperational) {
            // Operational errors are safe to send to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        else {
            // Programming or unknown errors - generic message
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }
};
exports.errorHandler = errorHandler;
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=errorHandler.js.map