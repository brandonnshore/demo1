import { Pool, QueryResult, PoolClient } from 'pg';
import { env, isProduction } from './env';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool configuration
 * Following best practices for connection pooling
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Keep pool size small for PostgreSQL (5-10x smaller than MySQL)
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Allow graceful shutdown
  allowExitOnIdle: false,
});

pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected database connection error', {}, err);
  // In production, we should not exit immediately
  // Instead, let the process manager handle restarts
  if (isProduction) {
    logger.error('Database connection lost - monitoring for recovery');
  } else {
    process.exit(-1);
  }
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Execute a parameterized query
 * @param text - SQL query text with placeholders ($1, $2, etc.)
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query result
 */
export const query = async (
  text: string,
  params?: unknown[]
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.query(text, duration, res.rowCount);
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database query failed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
    }, error as Error);
    throw error;
  }
};

/**
 * Get a database client from the pool for transactions
 * Remember to call client.release() when done
 * @returns Database client
 */
export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

/**
 * Gracefully close all database connections
 * Call this during application shutdown
 */
export const closePool = async (): Promise<void> => {
  logger.info('Closing database connection pool');
  await pool.end();
  logger.info('Database connection pool closed');
};

export default pool;
