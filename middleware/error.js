// Simple Error Handling Middleware

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};

// Simple custom error class
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Async wrapper with proper error handling
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            // Convert non-AppError instances to proper errors
            if (!(error instanceof AppError)) {
                // Handle specific error types
                if (error.name === 'ValidationError') {
                    return next(new AppError(error.message, 400));
                }
                if (error.name === 'CastError') {
                    return next(new AppError('Invalid data format', 400));
                }
                if (error.code === 11000) {
                    return next(new AppError('Duplicate entry', 409));
                }
                
                // For unexpected errors, log and return generic message
                console.error('Unexpected error in asyncHandler:', error);
                return next(new AppError('Internal server error', 500));
            }
            
            next(error);
        });
    };
};