/**
 * @swagger
 * components:
 *   schemas:
 *     PresignedUrlRequest:
 *       type: object
 *       required:
 *         - fileName
 *       properties:
 *         fileName:
 *           type: string
 *           description: Name of the file to upload
 *           example: "resume.pdf"
 *         maxSizeInMB:
 *           type: number
 *           description: Maximum file size in MB
 *           example: 5
 *         expiryMinutes:
 *           type: number
 *           description: URL expiry time in minutes
 *           example: 60
 *     
 *     AccessUrlRequest:
 *       type: object
 *       required:
 *         - fileName
 *       properties:
 *         fileName:
 *           type: string
 *           description: Name of the uploaded file
 *           example: "resume-1634567890-abc123.pdf"
 */

/**
 * @swagger
 * /api/v1/upload/health:
 *   get:
 *     tags: [Upload]
 *     summary: Check upload service health
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload service is healthy
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
 *                   example: "Success-CV API v1 Upload is healthy"
 */

/**
 * @swagger
 * /api/v1/upload/presigned:
 *   post:
 *     tags: [Upload]
 *     summary: Generate presigned URL for file upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresignedUrlRequest'
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
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
 *                   example: "Presigned URL generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       description: URL to upload the file
 *                     fileUrl:
 *                       type: string
 *                       description: Final URL of the uploaded file
 *                     fileName:
 *                       type: string
 *                       description: Unique filename generated
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: URL expiration time
 *                     uploadInstructions:
 *                       type: object
 *                       properties:
 *                         method:
 *                           type: string
 *                           example: "PUT"
 *                         headers:
 *                           type: object
 *                           properties:
 *                             x-ms-blob-type:
 *                               type: string
 *                               example: "BlockBlob"
 *                             Content-Type:
 *                               type: string
 *                               example: "application/octet-stream"
 *       400:
 *         description: Bad request - fileName is required
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/upload/access:
 *   post:
 *     tags: [Upload]
 *     summary: Get access URL for uploaded file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessUrlRequest'
 *     responses:
 *       200:
 *         description: Access URL generated successfully
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
 *                   example: "Access URL generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessUrl:
 *                       type: string
 *                       description: Secure URL to access the file
 *                     fileName:
 *                       type: string
 *                       description: Name of the file
 *                     expiryMinutes:
 *                       type: number
 *                       description: URL expiry time in minutes
 *                       example: 60
 *       400:
 *         description: Bad request - fileName is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: File not found or server error
 */