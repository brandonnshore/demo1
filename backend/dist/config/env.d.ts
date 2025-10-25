/**
 * Required environment variables for the application
 */
interface EnvironmentConfig {
    NODE_ENV: string;
    PORT: number;
    API_URL: string;
    FRONTEND_URL: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    USE_LOCAL_STORAGE: boolean;
    LOCAL_STORAGE_PATH?: string;
    S3_BUCKET?: string;
    S3_REGION?: string;
    S3_ACCESS_KEY?: string;
    S3_SECRET_KEY?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM_EMAIL?: string;
    SMTP_FROM_NAME?: string;
    REDIS_URL?: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    MAX_FILE_SIZE_MB: number;
    ALLOWED_FILE_TYPES: string;
}
/**
 * Validated environment configuration
 * @throws Error if environment validation fails
 */
export declare const env: EnvironmentConfig;
/**
 * Check if running in production mode
 */
export declare const isProduction: boolean;
/**
 * Check if running in development mode
 */
export declare const isDevelopment: boolean;
/**
 * Check if running in test mode
 */
export declare const isTest: boolean;
export {};
//# sourceMappingURL=env.d.ts.map