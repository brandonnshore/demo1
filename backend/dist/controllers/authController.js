"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthSync = exports.me = exports.register = exports.login = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const authService_1 = require("../services/authService");
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.ApiError(400, 'Email and password are required');
        }
        const result = await (0, authService_1.loginUser)(email, password);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            throw new errorHandler_1.ApiError(400, 'Email, password, and name are required');
        }
        const user = await (0, authService_1.registerUser)(email, password, name);
        res.status(201).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const user = await (0, authService_1.getUserById)(req.user.id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
const oauthSync = async (req, res, next) => {
    try {
        const { email, name, supabaseId } = req.body;
        if (!email || !name || !supabaseId) {
            throw new errorHandler_1.ApiError(400, 'Email, name, and supabaseId are required');
        }
        const result = await (0, authService_1.syncOAuthUser)(email, name, supabaseId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.oauthSync = oauthSync;
//# sourceMappingURL=authController.js.map