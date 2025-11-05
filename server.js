import express, { json, urlencoded } from "express";
import { errorHandler, notFound } from "./middleware/error.js";
import logger, { requestLogger, errorLogger, logStartup, logShutdown } from "./middleware/logger.js";
import { sendSuccess } from "./utils/apiHelpers.js";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { v1Routes } from "./routes/v1/index.route.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log application startup
logStartup(PORT, NODE_ENV);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Request logging middleware (before all routes)
app.use(requestLogger);

// Body parsing middleware
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(json({ limit: '10mb' }));

// Root route
app.get("/", (req, res) => {
    logger.info("Root route accessed");

    const apiInfo = {
        name: "Success-CV Backend API",
        version: "1.0.0",
        environment: NODE_ENV
    };

    sendSuccess(res, apiInfo, "Welcome to Success-CV Backend API");
});

// API routes
app.use("/api/v1",v1Routes);

// Health check route
app.get("/health-check", (req, res) => {
    logger.info("Health check requested");

    const healthData = {
        environment: NODE_ENV,
        uptime: process.uptime(),
        status: "healthy"
    };

    sendSuccess(res, healthData, "Server is healthy");
});

// Error logging middleware (before error handlers)
app.use(errorLogger);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logShutdown(signal);
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason: reason?.message || reason,
        promise: promise.toString()
    });
    process.exit(1);
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});
