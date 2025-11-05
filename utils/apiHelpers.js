// Simple API Response Builder

/**
 * Build success response
 */
export const successResponse = (data = null, message = "Success", meta = {}) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    if (Object.keys(meta).length > 0) {
        response.meta = meta;
    }

    return response;
};

/**
 * Build error response
 */
export const errorResponse = (message = "Error", statusCode = 500) => {
    return {
        success: false,
        message,
        statusCode
    };
};

/**
 * Send success response
 */
export const sendSuccess = (res, data, message = "Success", statusCode = 200, meta = {}) => {
    return res.status(statusCode).json(successResponse(data, message, meta));
};

/**
 * Send error response
 */
export const sendError = (res, message = "Error", statusCode = 500) => {
    return res.status(statusCode).json(errorResponse(message, statusCode));
};