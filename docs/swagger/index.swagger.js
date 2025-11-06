/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization endpoints
 *   - name: Candidate Auth
 *     description: Candidate authentication and bulk registration endpoints
 *   - name: User
 *     description: User management endpoints
 *   - name: SSE (Server-Sent Events)
 *     description: Real-time updates via Server-Sent Events
 *   - name: Health
 *     description: Health check endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check API v1 health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and operational
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
 *                       example: v1
 *                     endpoints:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["GET /api/v1/health", "Additional endpoints will be added here"]
 */
