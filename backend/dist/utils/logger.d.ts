/**
 * Log levels for structured logging
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
/**
 * Log context interface for adding metadata to logs
 */
interface LogContext {
    [key: string]: unknown;
}
/**
 * Simple structured logger
 * In production, this should be replaced with a proper logging library like Winston or Pino
 */
declare class Logger {
    /**
     * Format and output a log entry
     */
    private log;
    /**
     * Get emoji for log level (development only)
     */
    private getEmoji;
    /**
     * Log error message
     */
    error(message: string, context?: LogContext, error?: Error): void;
    /**
     * Log warning message
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log info message
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log debug message
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log database query (for debugging)
     */
    query(text: string, duration: number, rowCount: number | null): void;
    /**
     * Log HTTP request
     */
    http(method: string, url: string, statusCode: number, duration: number): void;
}
/**
 * Singleton logger instance
 */
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map