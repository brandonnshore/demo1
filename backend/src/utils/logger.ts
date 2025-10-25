import { isDevelopment } from '../config/env';

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log context interface for adding metadata to logs
 */
interface LogContext {
  [key: string]: unknown;
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Simple structured logger
 * In production, this should be replaced with a proper logging library like Winston or Pino
 */
class Logger {
  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
        code: (error as NodeJS.ErrnoException).code,
      };
    }

    // In development, use console methods for better readability
    if (isDevelopment) {
      const emoji = this.getEmoji(level);
      const coloredMessage = `${emoji} [${level.toUpperCase()}] ${message}`;

      switch (level) {
        case LogLevel.ERROR:
          console.error(coloredMessage, context || '', error || '');
          break;
        case LogLevel.WARN:
          console.warn(coloredMessage, context || '');
          break;
        case LogLevel.DEBUG:
          console.debug(coloredMessage, context || '');
          break;
        default:
          console.log(coloredMessage, context || '');
      }
    } else {
      // In production, output JSON for log aggregation tools
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Get emoji for log level (development only)
   */
  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.DEBUG:
        return '🔍';
      default:
        return '📝';
    }
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log database query (for debugging)
   */
  query(text: string, duration: number, rowCount: number | null): void {
    if (isDevelopment) {
      this.debug('Database query executed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: rowCount,
      });
    }
  }

  /**
   * Log HTTP request
   */
  http(method: string, url: string, statusCode: number, duration: number): void {
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN :
                  LogLevel.INFO;

    this.log(level, `HTTP ${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
    });
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
