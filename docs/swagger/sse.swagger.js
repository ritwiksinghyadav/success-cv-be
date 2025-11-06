/**
 * @swagger
 * tags:
 *   - name: SSE (Server-Sent Events)
 *     description: Real-time updates via Server-Sent Events
 */

/**
 * @swagger
 * /api/v1/sse/connect:
 *   get:
 *     summary: Establish SSE connection
 *     tags: [SSE (Server-Sent Events)]
 *     description: Opens a Server-Sent Events stream for real-time updates. Returns a connection ID that should be used for subsequent subscription operations.
 *     responses:
 *       200:
 *         description: SSE connection established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *             examples:
 *               connected:
 *                 summary: Initial connection event
 *                 value: |
 *                   event: connected
 *                   data: {"connectionId":"550e8400-e29b-41d4-a716-446655440000","timestamp":1699267200000}
 *               
 *               job_update:
 *                 summary: Job progress update
 *                 value: |
 *                   event: job_update
 *                   data: {"type":"job_update","jobId":"resume-123-1699267200000","timestamp":1699267200000,"status":"in_progress","progress":50,"stage":"parsing","message":"Parsing resume content"}
 *               
 *               heartbeat:
 *                 summary: Keep-alive heartbeat
 *                 value: |
 *                   event: heartbeat
 *                   data: {"timestamp":1699267200000}
 */

/**
 * @swagger
 * /api/v1/sse/{connectionId}/subscribe/job/{jobId}:
 *   post:
 *     summary: Subscribe to job updates
 *     tags: [SSE (Server-Sent Events)]
 *     description: Subscribe an SSE connection to receive real-time updates for a specific job
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SSE connection ID received from /connect endpoint
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to subscribe to (from BullMQ queue)
 *         example: "resume-123-1699267200000"
 *     responses:
 *       200:
 *         description: Successfully subscribed to job updates
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
 *                   example: "Subscribed to job updates"
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                       example: "resume-123-1699267200000"
 *       404:
 *         description: Connection not found
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
 *                   example: "Connection not found"
 */

/**
 * @swagger
 * /api/v1/sse/{connectionId}/subscribe/queue/{queueName}:
 *   post:
 *     summary: Subscribe to queue updates
 *     tags: [SSE (Server-Sent Events)]
 *     description: Subscribe an SSE connection to receive real-time statistics updates for a specific queue
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SSE connection ID received from /connect endpoint
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: queueName
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name to subscribe to
 *         example: "resume-analysis"
 *     responses:
 *       200:
 *         description: Successfully subscribed to queue updates
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
 *                   example: "Subscribed to queue updates"
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueName:
 *                       type: string
 *                       example: "resume-analysis"
 *       404:
 *         description: Connection not found
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
 *                   example: "Connection not found"
 */

/**
 * @swagger
 * /api/v1/sse/{connectionId}/unsubscribe/job/{jobId}:
 *   post:
 *     summary: Unsubscribe from job updates
 *     tags: [SSE (Server-Sent Events)]
 *     description: Remove subscription from job updates for an SSE connection
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SSE connection ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to unsubscribe from
 *         example: "resume-123-1699267200000"
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from job updates
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
 *                   example: "Unsubscribed from job updates"
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                       example: "resume-123-1699267200000"
 *       404:
 *         description: Connection not found
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
 *                   example: "Connection not found"
 */

/**
 * @swagger
 * /api/v1/sse/{connectionId}/unsubscribe/queue/{queueName}:
 *   post:
 *     summary: Unsubscribe from queue updates
 *     tags: [SSE (Server-Sent Events)]
 *     description: Remove subscription from queue updates for an SSE connection
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SSE connection ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: queueName
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name to unsubscribe from
 *         example: "resume-analysis"
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from queue updates
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
 *                   example: "Unsubscribed from queue updates"
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueName:
 *                       type: string
 *                       example: "resume-analysis"
 *       404:
 *         description: Connection not found
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
 *                   example: "Connection not found"
 */

/**
 * @swagger
 * /api/v1/sse/stats:
 *   get:
 *     summary: Get SSE connection statistics
 *     tags: [SSE (Server-Sent Events)]
 *     description: Retrieve statistics about active SSE connections and subscriptions
 *     responses:
 *       200:
 *         description: SSE statistics retrieved successfully
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
 *                   example: "SSE statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalConnections:
 *                       type: integer
 *                       description: Total number of active SSE connections
 *                       example: 5
 *                     totalJobSubscriptions:
 *                       type: integer
 *                       description: Total number of job subscriptions across all connections
 *                       example: 10
 *                     totalQueueSubscriptions:
 *                       type: integer
 *                       description: Total number of queue subscriptions across all connections
 *                       example: 3
 *                     connections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           connectionId:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           connectedAt:
 *                             type: integer
 *                             description: Unix timestamp when connection was established
 *                             example: 1699267200000
 *                           lastActivity:
 *                             type: integer
 *                             description: Unix timestamp of last activity
 *                             example: 1699267230000
 *                           jobSubscriptions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["resume-123-1699267200000", "resume-456-1699267201000"]
 *                           queueSubscriptions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["resume-analysis"]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SSEJobUpdate:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [job_update]
 *           example: "job_update"
 *         jobId:
 *           type: string
 *           example: "resume-123-1699267200000"
 *         timestamp:
 *           type: integer
 *           description: Unix timestamp
 *           example: 1699267200000
 *         status:
 *           type: string
 *           enum: [started, in_progress, completed, failed]
 *           example: "in_progress"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 50
 *         stage:
 *           type: string
 *           enum: [initializing, fetching, parsing, extracting, analyzing, storing]
 *           example: "parsing"
 *         message:
 *           type: string
 *           example: "Parsing resume content"
 *         resumeId:
 *           type: string
 *           example: "resume-123"
 *         candidateId:
 *           type: string
 *           example: "candidate-456"
 *         result:
 *           type: object
 *           description: Job result (only present when status is 'completed')
 *         error:
 *           type: string
 *           description: Error message (only present when status is 'failed')
 *     
 *     SSEQueueUpdate:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [queue_update]
 *           example: "queue_update"
 *         queueName:
 *           type: string
 *           example: "resume-analysis"
 *         timestamp:
 *           type: integer
 *           example: 1699267200000
 *         waiting:
 *           type: integer
 *           example: 5
 *         active:
 *           type: integer
 *           example: 2
 *         completed:
 *           type: integer
 *           example: 100
 *         failed:
 *           type: integer
 *           example: 3
 *         delayed:
 *           type: integer
 *           example: 1
 *     
 *     SSEWorkerStatus:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [worker_status]
 *           example: "worker_status"
 *         workerId:
 *           type: string
 *           example: "worker-1"
 *         timestamp:
 *           type: integer
 *           example: 1699267200000
 *         status:
 *           type: string
 *           enum: [active, idle, paused]
 *           example: "active"
 *         currentJob:
 *           type: string
 *           example: "job-123"
 *         concurrency:
 *           type: integer
 *           example: 5
 */

export default {};
