"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
/**
 * PostgreSQL connection pool configuration
 * Following best practices for connection pooling
 */
const pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
    ssl: env_1.isProduction ? { rejectUnauthorized: false } : false,
    // Keep pool size small for PostgreSQL (5-10x smaller than MySQL)
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Allow graceful shutdown
    allowExitOnIdle: false,
});
pool.on('connect', () => {
    logger_1.logger.info('Database connection established');
});
pool.on('error', (err) => {
    logger_1.logger.error('Unexpected database connection error', {}, err);
    // In production, we should not exit immediately
    // Instead, let the process manager handle restarts
    if (env_1.isProduction) {
        logger_1.logger.error('Database connection lost - monitoring for recovery');
    }
    else {
        process.exit(-1);
    }
});
pool.on('remove', () => {
    logger_1.logger.debug('Database connection removed from pool');
});
/**
 * Execute a parameterized query
 * @param text - SQL query text with placeholders ($1, $2, etc.)
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.query(text, duration, res.rowCount);
        return res;
    }
    catch (error) {
        const duration = Date.now() - start;
        logger_1.logger.error('Database query failed', {
            query: text.substring(0, 100),
            duration: `${duration}ms`,
        }, error);
        throw error;
    }
};
exports.query = query;
/**
 * Get a database client from the pool for transactions
 * Remember to call client.release() when done
 * @returns Database client
 */
const getClient = async () => {
    return pool.connect();
};
exports.getClient = getClient;
/**
 * Gracefully close all database connections
 * Call this during application shutdown
 */
const closePool = async () => {
    logger_1.logger.info('Closing database connection pool');
    await pool.end();
    logger_1.logger.info('Database connection pool closed');
};
exports.closePool = closePool;
exports.default = pool;
//# sourceMappingURL=database.js.map