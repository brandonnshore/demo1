import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Required environment variables for the application
 */
interface EnvironmentConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_URL: string;
  FRONTEND_URL: string;

  // Database
  DATABASE_URL: string;

  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Storage
  USE_LOCAL_STORAGE: boolean;
  LOCAL_STORAGE_PATH?: string;
  S3_BUCKET?: string;
  S3_REGION?: string;
  S3_ACCESS_KEY?: string;
  S3_SECRET_KEY?: string;

  // Supabase Storage
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;

  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM_EMAIL?: string;
  SMTP_FROM_NAME?: string;

  // Redis
  REDIS_URL?: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // File Upload
  MAX_FILE_SIZE_MB: number;
  ALLOWED_FILE_TYPES: string;
}

/**
 * Validates that all required environment variables are set
 * @throws Error if required variables are missing or invalid
 */
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file against .env.example'
    );
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  // Parse and validate numeric values
  const port = parseInt(process.env.PORT || '3001', 10);
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number (1-65535)');
  }

  if (isNaN(rateLimitWindow) || rateLimitWindow < 0) {
    throw new Error('RATE_LIMIT_WINDOW_MS must be a positive number');
  }

  if (isNaN(rateLimitMax) || rateLimitMax < 1) {
    throw new Error('RATE_LIMIT_MAX_REQUESTS must be a positive number');
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: port,
    API_URL: process.env.API_URL || `http://localhost:${port}`,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    USE_LOCAL_STORAGE: process.env.USE_LOCAL_STORAGE === 'true',
    LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: smtpPort,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    REDIS_URL: process.env.REDIS_URL,
    RATE_LIMIT_WINDOW_MS: rateLimitWindow,
    RATE_LIMIT_MAX_REQUESTS: rateLimitMax,
    MAX_FILE_SIZE_MB: maxFileSize,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/png,image/jpeg,image/svg+xml',
  };
}

/**
 * Validated environment configuration
 * @throws Error if environment validation fails
 */
export const env = validateEnvironment();

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
