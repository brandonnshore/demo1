"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const env_1 = require("../config/env");
/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.ApiError(401, 'Authentication required - no token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            throw new errorHandler_1.ApiError(401, 'Authentication required - invalid token format');
        }
        // Verify and decode token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Validate decoded payload structure
        if (!decoded.id || !decoded.email || !decoded.role) {
            throw new errorHandler_1.ApiError(401, 'Invalid token payload');
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.ApiError(401, 'Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.ApiError(401, 'Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
/**
 * Authorization middleware factory
 * Checks if authenticated user has required role(s)
 * @param roles - Array of allowed roles
 * @returns Middleware function
 */
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.ApiError(401, 'Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.ApiError(403, `Insufficient permissions - requires one of: ${roles.join(', ')}`));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map