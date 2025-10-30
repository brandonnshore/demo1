"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOAuthUser = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
const registerUser = async (email, password, name) => {
    // Check if user exists
    const existingUser = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new errorHandler_1.ApiError(400, 'User already exists');
    }
    // Hash password
    const password_hash = await bcrypt_1.default.hash(password, 10);
    // Create user
    const result = await database_1.default.query(`INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at, updated_at`, [email, password_hash, name, 'fulfillment']);
    return result.rows[0];
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    // Get user
    const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new errorHandler_1.ApiError(401, 'Invalid credentials');
    }
    const user = result.rows[0];
    // Verify password
    const isValid = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isValid) {
        throw new errorHandler_1.ApiError(401, 'Invalid credentials');
    }
    // Generate token
    const payload = { id: user.id, email: user.email, role: user.role };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
    const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
    // Remove password from response
    delete user.password_hash;
    return { user, token };
};
exports.loginUser = loginUser;
const getUserById = async (id) => {
    const result = await database_1.default.query('SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
exports.getUserById = getUserById;
const syncOAuthUser = async (email, name, supabaseId) => {
    // Check if user exists
    const existingUser = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    if (existingUser.rows.length === 0) {
        // Create new OAuth user with a hashed random password they'll never use
        const oauthPassword = await bcrypt_1.default.hash(`oauth-${supabaseId}-${Date.now()}`, 10);
        const result = await database_1.default.query(`INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, updated_at`, [email, oauthPassword, name, 'fulfillment']);
        user = result.rows[0];
    }
    else {
        // User exists, just return them
        user = existingUser.rows[0];
        // Remove password from response
        delete user.password_hash;
    }
    // Generate token
    const payload = { id: user.id, email: user.email, role: user.role };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
    const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
    return { user, token };
};
exports.syncOAuthUser = syncOAuthUser;
//# sourceMappingURL=authService.js.map