"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
const env_1 = require("../config/env");
/**
 * Log levels for structured logging
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Simple structured logger
 * In production, this should be replaced with a proper logging library like Winston or Pino
 */
class Logger {
    /**
     * Format and output a log entry
     */
    log(level, message, context, error) {
        const entry = {
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
                stack: env_1.isDevelopment ? error.stack : undefined,
                code: error.code,
            };
        }
        // In development, use console methods for better readability
        if (env_1.isDevelopment) {
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
        }
        else {
            // In production, output JSON for log aggregation tools
            console.log(JSON.stringify(entry));
        }
    }
    /**
     * Get emoji for log level (development only)
     */
    getEmoji(level) {
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
    error(message, context, error) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    /**
     * Log warning message
     */
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    /**
     * Log info message
     */
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    /**
     * Log debug message
     */
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    /**
     * Log database query (for debugging)
     */
    query(text, duration, rowCount) {
        if (env_1.isDevelopment) {
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
    http(method, url, statusCode, duration) {
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
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map