import { Router } from 'express';
import { checkRedisHealth } from '../../config/redis.config.js';
import { getQueueStats } from '../../queues/resume-analysis.queue.js';
import { sendSuccess, sendError } from '../../utils/apiHelpers.js';
import logger from '../../middleware/logger.js';
import cacheService from '../../services/cache.service.js';
import { sendVerificationEmail } from '../../services/email/emailTrigger.js';

const router = Router();

// Redis health check
router.get('/redis', async (req, res, next) => {
    try {
        const health = await checkRedisHealth();

        const allConnected = health.cache.connected && health.queue.connected;

        if (allConnected) {
            sendSuccess(res, health, 'Redis connections healthy');
        } else {
            sendError(res, 'Redis connection issues detected', 503, health);
        }
    } catch (error) {
        logger.error('Redis health check failed', { error: error.message });
        sendError(res, 'Redis health check failed', 503);
    }
});

// Queue statistics
router.get('/queue', async (req, res, next) => {
    try {
        const stats = await getQueueStats();
        sendSuccess(res, stats, 'Queue statistics retrieved');
    } catch (error) {
        logger.error('Queue stats check failed', { error: error.message });
        sendError(res, 'Queue stats check failed', 503);
    }
});

// Cache statistics
router.get('/cache', async (req, res, next) => {
    try {
        const stats = await cacheService.getStats();
        sendSuccess(res, stats, 'Cache statistics retrieved');
    } catch (error) {
        logger.error('Cache stats check failed', { error: error.message });
        sendError(res, 'Cache stats check failed', 503);
    }
});

// Full health check
router.get('/full', async (req, res, next) => {
    try {
        const [redisHealth, queueStats] = await Promise.all([
            checkRedisHealth(),
            getQueueStats()
        ]);

        const health = {
            timestamp: new Date().toISOString(),
            redis: redisHealth,
            queue: queueStats,
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            }
        };

        const allHealthy = redisHealth.cache.connected && redisHealth.queue.connected;

        if (allHealthy) {
            sendSuccess(res, health, 'All systems healthy');
        } else {
            sendError(res, 'Some systems are unhealthy', 503, health);
        }
    } catch (error) {
        logger.error('Full health check failed', { error: error.message });
        sendError(res, 'Health check failed', 503);
    }
});

router.get("/email-check", async (req, res) => {
    logger.info("Email service health check requested");
    await sendVerificationEmail("ritwik@yopmail.com", "Ritwik", "123456");
    sendSuccess(res, { emailService: "operational" }, "Email service is operational");
});
export const healthRoutes = router;
