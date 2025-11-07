/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health check and monitoring endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Main API health check
 *     description: Returns the main health status of the API with endpoint information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success-CV API v1
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "v1"
 *                     endpoints:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "GET /api/v1/health",
 *                         "GET /api/v1/health/redis",
 *                         "GET /api/v1/health/queue",
 *                         "GET /api/v1/health/cache",
 *                         "GET /api/v1/health/full"
 *                       ]
 */

/**
 * @swagger
 * /api/v1/health/redis:
 *   get:
 *     summary: Check Redis connections health
 *     tags: [Health]
 *     description: Check the health status and latency of Redis cache and queue connections
 *     responses:
 *       200:
 *         description: Redis health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Redis connections healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cache:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                           example: true
 *                         latency:
 *                           type: number
 *                           description: Latency in milliseconds
 *                           example: 2.5
 *                     queue:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                           example: true
 *                         latency:
 *                           type: number
 *                           description: Latency in milliseconds
 *                           example: 3.1
 *       503:
 *         description: Redis connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Redis connection issues detected"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cache:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                           example: false
 *                         latency:
 *                           type: number
 *                           nullable: true
 *                     queue:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                           example: true
 *                         latency:
 *                           type: number
 */

/**
 * @swagger
 * /api/v1/health/queue:
 *   get:
 *     summary: Check queue statistics
 *     tags: [Health]
 *     description: Get current statistics for the BullMQ job queue including waiting, active, completed, failed, and delayed jobs
 *     responses:
 *       200:
 *         description: Queue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Queue statistics retrieved"
 *                 data:
 *                   type: object
 *                   properties:
 *                     waiting:
 *                       type: number
 *                       description: Number of jobs waiting to be processed
 *                       example: 5
 *                     active:
 *                       type: number
 *                       description: Number of jobs currently being processed
 *                       example: 2
 *                     completed:
 *                       type: number
 *                       description: Number of successfully completed jobs
 *                       example: 150
 *                     failed:
 *                       type: number
 *                       description: Number of failed jobs
 *                       example: 3
 *                     delayed:
 *                       type: number
 *                       description: Number of delayed jobs
 *                       example: 1
 *                     total:
 *                       type: number
 *                       description: Total number of jobs
 *                       example: 161
 *       503:
 *         description: Queue stats check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Queue stats check failed"
 */

/**
 * @swagger
 * /api/v1/health/cache:
 *   get:
 *     summary: Check cache statistics
 *     tags: [Health]
 *     description: Get current statistics for the Redis cache service
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache statistics retrieved"
 *                 data:
 *                   type: object
 *                   description: Redis cache statistics including memory usage, keys, etc.
 *                   example:
 *                     connected: true
 *                     keys: 42
 *                     memory: "2.5MB"
 *       503:
 *         description: Cache stats check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cache stats check failed"
 */

/**
 * @swagger
 * /api/v1/health/full:
 *   get:
 *     summary: Complete health check
 *     tags: [Health]
 *     description: Comprehensive health check including Redis, queue statistics, and server information
 *     responses:
 *       200:
 *         description: Full system health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All systems healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-06T10:30:00.000Z"
 *                     redis:
 *                       type: object
 *                       properties:
 *                         cache:
 *                           type: object
 *                           properties:
 *                             connected:
 *                               type: boolean
 *                               example: true
 *                             latency:
 *                               type: number
 *                               example: 2.5
 *                         queue:
 *                           type: object
 *                           properties:
 *                             connected:
 *                               type: boolean
 *                               example: true
 *                             latency:
 *                               type: number
 *                               example: 3.1
 *                     queue:
 *                       type: object
 *                       properties:
 *                         waiting:
 *                           type: number
 *                           example: 5
 *                         active:
 *                           type: number
 *                           example: 2
 *                         completed:
 *                           type: number
 *                           example: 150
 *                         failed:
 *                           type: number
 *                           example: 3
 *                         delayed:
 *                           type: number
 *                           example: 1
 *                         total:
 *                           type: number
 *                           example: 161
 *                     server:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           description: Server uptime in seconds
 *                           example: 3600.5
 *                         memory:
 *                           type: object
 *                           properties:
 *                             rss:
 *                               type: number
 *                               description: Resident Set Size in bytes
 *                               example: 52428800
 *                             heapTotal:
 *                               type: number
 *                               description: Total heap size in bytes
 *                               example: 20971520
 *                             heapUsed:
 *                               type: number
 *                               description: Used heap size in bytes
 *                               example: 15728640
 *                             external:
 *                               type: number
 *                               description: External memory in bytes
 *                               example: 1048576
 *                             arrayBuffers:
 *                               type: number
 *                               description: ArrayBuffer memory in bytes
 *                               example: 524288
 *                         nodeVersion:
 *                           type: string
 *                           example: "v20.10.0"
 *       503:
 *         description: Some systems are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Some systems are unhealthy"
 *                 data:
 *                   type: object
 *                   description: Same structure as 200 response, with connected flags showing false for unhealthy services
 */

export default {};
