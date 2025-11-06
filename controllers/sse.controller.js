import sseService from '../services/sse.service.js';
import { sendError } from '../utils/apiHelpers.js';
import logger from '../middleware/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * SSE Controller
 * Handles Server-Sent Events endpoints for real-time updates
 */

/**
 * Establish SSE connection
 * GET /api/v1/sse/connect
 */
export const connect = async (req, res) => {
    try {
        const connectionId = uuidv4();
        
        logger.info('SSE: New connection request', { 
            connectionId,
            ip: req.ip 
        });

        // Create SSE connection
        sseService.createConnection(connectionId, res, req);

    } catch (error) {
        logger.error('SSE: Connection error', { error: error.message });
        return sendError(res, `Failed to establish SSE connection: ${error.message}`, 500);
    }
};

/**
 * Subscribe to job updates
 * POST /api/v1/sse/:connectionId/subscribe/job/:jobId
 */
export const subscribeToJob = async (req, res) => {
    try {
        const { connectionId, jobId } = req.params;

        if (!sseService.hasConnection(connectionId)) {
            return sendError(res, 'Connection not found', 404);
        }

        await sseService.subscribeToJob(connectionId, jobId);

        res.json({
            success: true,
            message: 'Subscribed to job updates',
            connectionId,
            jobId
        });
    } catch (error) {
        logger.error('SSE: Subscribe to job error', { error: error.message });
        return sendError(res, `Failed to subscribe to job: ${error.message}`, 500);
    }
};

/**
 * Subscribe to queue updates
 * POST /api/v1/sse/:connectionId/subscribe/queue/:queueName
 */
export const subscribeToQueue = async (req, res) => {
    try {
        const { connectionId, queueName } = req.params;

        if (!sseService.hasConnection(connectionId)) {
            return sendError(res, 'Connection not found', 404);
        }

        await sseService.subscribeToQueue(connectionId, queueName);

        res.json({
            success: true,
            message: 'Subscribed to queue updates',
            connectionId,
            queueName
        });
    } catch (error) {
        logger.error('SSE: Subscribe to queue error', { error: error.message });
        return sendError(res, `Failed to subscribe to queue: ${error.message}`, 500);
    }
};

/**
 * Unsubscribe from job updates
 * POST /api/v1/sse/:connectionId/unsubscribe/job/:jobId
 */
export const unsubscribeFromJob = async (req, res) => {
    try {
        const { connectionId, jobId } = req.params;

        if (!sseService.hasConnection(connectionId)) {
            return sendError(res, 'Connection not found', 404);
        }

        await sseService.unsubscribeFromJob(connectionId, jobId);

        res.json({
            success: true,
            message: 'Unsubscribed from job updates',
            connectionId,
            jobId
        });
    } catch (error) {
        logger.error('SSE: Unsubscribe from job error', { error: error.message });
        return sendError(res, `Failed to unsubscribe from job: ${error.message}`, 500);
    }
};

/**
 * Unsubscribe from queue updates
 * POST /api/v1/sse/:connectionId/unsubscribe/queue/:queueName
 */
export const unsubscribeFromQueue = async (req, res) => {
    try {
        const { connectionId, queueName } = req.params;

        if (!sseService.hasConnection(connectionId)) {
            return sendError(res, 'Connection not found', 404);
        }

        await sseService.unsubscribeFromQueue(connectionId, queueName);

        res.json({
            success: true,
            message: 'Unsubscribed from queue updates',
            connectionId,
            queueName
        });
    } catch (error) {
        logger.error('SSE: Unsubscribe from queue error', { error: error.message });
        return sendError(res, `Failed to unsubscribe from queue: ${error.message}`, 500);
    }
};

/**
 * Get SSE connection statistics
 * GET /api/v1/sse/stats
 */
export const getStats = async (req, res) => {
    try {
        const stats = sseService.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('SSE: Get stats error', { error: error.message });
        return sendError(res, `Failed to get SSE stats: ${error.message}`, 500);
    }
};

export default {
    connect,
    subscribeToJob,
    subscribeToQueue,
    unsubscribeFromJob,
    unsubscribeFromQueue,
    getStats
};
