/**
 * @swagger
 * tags:
 *   - name: Candidate Auth
 *     description: Candidate authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/candidate/health:
 *   get:
 *     summary: Candidate auth service health check
 *     tags: [Candidate Auth]
 *     responses:
 *       200:
 *         description: Candidate auth service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */

/**
 * @swagger
 * /api/v1/auth/candidate/register/bulk:
 *   post:
 *     summary: Bulk register candidates (up to 1000)
 *     tags: [Candidate Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidates
 *             properties:
 *               candidates:
 *                 type: array
 *                 maxItems: 1000
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullname
 *                     - email
 *                     - password
 *                     - organisationID
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: "John Doe"
 *                     name:
 *                       type: string
 *                       description: Alternative field name (fallback to fullname)
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@example.com"
 *                     password:
 *                       type: string
 *                       format: password
 *                       minLength: 8
 *                       example: "SecurePass123!"
 *                     organisationID:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Bulk registration completed
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
 *                   example: "Bulk candidate registration completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: integer
 *                       example: 850
 *                     failed:
 *                       type: integer
 *                       example: 150
 *                     successfulCandidates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           index:
 *                             type: integer
 *                             example: 0
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           fullname:
 *                             type: string
 *                             example: "John Doe"
 *                           organisationID:
 *                             type: integer
 *                             example: 1
 *                     failures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           index:
 *                             type: integer
 *                             example: 5
 *                           email:
 *                             type: string
 *                             example: "invalid@email"
 *                           error:
 *                             type: string
 *                             example: "Invalid email format"
 *                     duplicateEmails:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["existing@email.com", "duplicate@email.com"]
 *       400:
 *         description: Bad request (exceeds limit or validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               limit_exceeded:
 *                 value:
 *                   success: false
 *                   message: Bulk registration limited to 1000 candidates
 *               validation_error:
 *                 value:
 *                   success: false
 *                   message: fullname is required for all candidates. Please provide a fullname field (not 'name')
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/candidate/login:
 *   post:
 *     summary: Candidate login
 *     tags: [Candidate Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/candidate/verify/send:
 *   post:
 *     summary: Send verification email to candidate
 *     tags: [Candidate Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "candidate@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/candidate/verify/{token}:
 *   get:
 *     summary: Verify candidate email with token
 *     tags: [Candidate Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'

/**
 * @swagger
 * /api/v1/auth/candidate/forgot-password:
 *   post:
 *     summary: Request password reset for candidate
 *     tags: [Candidate Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "candidate@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/candidate/forgot-password/{token}:
 *   post:
 *     summary: Reset candidate password with token
 *     tags: [Candidate Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
