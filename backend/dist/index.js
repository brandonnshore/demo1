"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const path_1 = __importDefault(require("path"));
// Import configuration and utilities
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const pricing_1 = __importDefault(require("./routes/pricing"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const admin_1 = __importDefault(require("./routes/admin"));
const designs_1 = __importDefault(require("./routes/designs"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Import storage initialization
const supabaseStorage_1 = require("./services/supabaseStorage");
const app = (0, express_1.default)();
// Trust proxy - Railway uses a reverse proxy (one hop)
app.set('trust proxy', 1);
// Security middleware - configure helmet to allow cross-origin images
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "http://localhost:3001", "http://localhost:3002"],
        },
    },
}));
// CORS configuration - allow both www and non-www versions
const allowedOrigins = [
    env_1.env.FRONTEND_URL,
    'https://raspberrymerch.com',
    'https://www.raspberrymerch.com',
    'http://localhost:5173',
    'http://localhost:3003'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve uploaded files with CORS headers - IMPORTANT: This must be before error handlers
const uploadsPath = path_1.default.resolve(env_1.env.LOCAL_STORAGE_PATH || './uploads');
app.use('/uploads', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(uploadsPath));
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/price', pricing_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/designs', designs_1.default);
// Error handling
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
const server = app.listen(env_1.env.PORT, async () => {
    logger_1.logger.info('Raspberry API Server started', {
        port: env_1.env.PORT,
        environment: env_1.env.NODE_ENV,
        apiUrl: `http://localhost:${env_1.env.PORT}`,
    });
    // Initialize Supabase Storage bucket
    await (0, supabaseStorage_1.initializeStorage)();
});
// Graceful shutdown handler
const shutdown = async (signal) => {
    logger_1.logger.info(`${signal} received, starting graceful shutdown`);
    server.close(async () => {
        logger_1.logger.info('HTTP server closed');
        try {
            await (0, database_1.closePool)();
            logger_1.logger.info('All resources cleaned up, exiting');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('Error during shutdown', {}, error);
            process.exit(1);
        }
    });
    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};
// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception', {}, error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('Unhandled promise rejection', { reason: String(reason) });
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map