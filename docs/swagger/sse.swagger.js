/**
 * @swagger
 * tags:
 *   - name: SSE (Server-Sent Events)
 *     description: Real-time job monitoring via Server-Sent Events
 */

/**
 * @swagger
 * /api/v1/sse/job/{jobId}:
 *   get:
 *     summary: Connect and monitor a specific job (Primary endpoint)
 *     tags: [SSE (Server-Sent Events)]
 *     description: |
 *       Opens an SSE stream and automatically subscribes to a specific job's real-time updates.
 *       This is the primary and recommended endpoint for monitoring resume analysis jobs.
 *       
 *       **How it works:**
 *       1. Server generates a unique connection ID
 *       2. Auto-subscribes to the specified job
 *       3. Optionally subscribes to queue updates (via query param)
 *       4. Sends real-time progress updates as job processes
 *       
 *       **No manual subscription needed** - just connect with the job ID!
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID to monitor (returned when job is added to queue)
 *         example: "resume-123-1699267200000"
 *       - in: query
 *         name: queueName
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional - also subscribe to queue statistics updates
 *         example: "resume-analysis"
 *     responses:
 *       200:
 *         description: SSE connection established and subscribed to job
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *             examples:
 *               connected:
 *                 summary: Initial connection event
 *                 value: |
 *                   event: connected
 *                   data: {"connectionId":"550e8400-e29b-41d4-a716-446655440000","timestamp":1699267200000,"message":"SSE connection established"}
 *               
 *               job_started:
 *                 summary: Job started (0% progress)
 *                 value: |
 *                   event: job_update
 *                   data: {"type":"job_update","jobId":"resume-123-1699267200000","timestamp":1699267200000,"status":"started","progress":0,"stage":"initializing","message":"Starting resume analysis"}
 *               
 *               job_progress:
 *                 summary: Job in progress (50%)
 *                 value: |
 *                   event: job_update
 *                   data: {"type":"job_update","jobId":"resume-123-1699267200000","timestamp":1699267200000,"status":"in_progress","progress":50,"stage":"parsing","message":"Parsing resume content","resumeId":"resume-123"}
 *               
 *               job_completed:
 *                 summary: Job completed successfully (100%)
 *                 value: |
 *                   event: job_update
 *                   data: {"type":"job_update","jobId":"resume-123-1699267200000","timestamp":1699267200000,"status":"completed","progress":100,"stage":"completed","message":"Analysis completed successfully","result":{"score":85,"skills":["JavaScript","React"]}}
 *               
 *               job_failed:
 *                 summary: Job failed with error
 *                 value: |
 *                   event: job_update
 *                   data: {"type":"job_update","jobId":"resume-123-1699267200000","timestamp":1699267200000,"status":"failed","progress":40,"stage":"parsing","message":"Failed to parse resume","error":"Invalid PDF format"}
 *               
 *               heartbeat:
 *                 summary: Keep-alive heartbeat (every 30 seconds)
 *                 value: |
 *                   event: heartbeat
 *                   data: {"timestamp":1699267200000}
 */

/**
 * @swagger
 * /api/v1/sse/stats:
 *   get:
 *     summary: Get SSE connection statistics
 *     tags: [SSE (Server-Sent Events)]
 *     description: Retrieve statistics about active SSE connections and subscriptions. Useful for monitoring and debugging.
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
