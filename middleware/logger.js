// Simple Logger Utility - Errors, API calls, and timestamps

// Get formatted timestamp
const getTimestamp = () => new Date().toISOString();

// Simple logger class
class Logger {
    error(message, meta = {}) {
        console.error(`[${getTimestamp()}] ERROR: ${message}`, meta);
    }

    info(message, meta = {}) {
        console.log(`[${getTimestamp()}] INFO: ${message}`, meta);
    }

    // Log API requests
    request(req, res, duration) {
        const statusCode = res.statusCode;
        const method = req.method;
        const url = req.originalUrl;
        const headers = req.headers;
        const body = req.body;
        const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
        const refreshToken = req.headers['x-refresh-token'] || null;
        
        const logMessage = `${method} ${url} - ${statusCode} (${duration}ms)`;
        
        const logData = {
            // headers,
            body,
            ...(token && { token }),
            ...(refreshToken && { refreshToken })
        };
        
        if (statusCode >= 400) {
            this.error(`API Call Failed: ${logMessage}`, logData);
        } else {
            this.info(`API Call: ${logMessage}`, logData);
        }
    }
}

// Singleton instance
const logger = new Logger();

// Express middleware for request logging
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        logger.request(req, res, duration);
        originalEnd.apply(res, args);
    };

    next();
};

// Express middleware for error logging
export const errorLogger = (error, req, res, next) => {
    logger.error('Request Error', {
        message: error.message,
        url: req.originalUrl,
        method: req.method
    });
    next(error);
};

// Log application startup
export const logStartup = (port, environment) => {
    logger.info(`Server starting on port ${port} in ${environment} mode`);
};

// Log application shutdown
export const logShutdown = (signal) => {
    logger.info(`Server shutting down (${signal})`);
};

export default logger;
