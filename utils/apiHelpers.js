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

export const destructureRequest = (req) => {
    const headers = req.headers;
    const method = req.method;
    const url = req.url;
    const body = req.body;
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    const refreshToken = req.headers['x-refresh-token'] || null;
    return { headers, method, url, body, token, refreshToken };
}

export const removeTimestampFields = (obj) => {

    const { createdAt, updatedAt, id, ...cleanObj } = obj;
    return cleanObj;
}