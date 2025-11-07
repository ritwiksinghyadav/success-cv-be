/**
 * @swagger
 * tags:
 *   - name: Invites
 *     description: Invitation management endpoints
 */

/**
 * @swagger
 * /api/v1/invites/{inviteID}/accept:
 *   get:
 *     summary: Accept an organisation invitation
 *     description: Accept an invitation to join an organisation. The user must be authenticated and the email associated with their account must match the invited email.
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique invitation ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
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
 *                   example: "Invitation accepted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organisationID:
 *                       type: integer
 *                       example: 1
 *                     userID:
 *                       type: integer
 *                       example: 123
 *                     role:
 *                       type: string
 *                       example: "member"
 *                     joinedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Bad request - Invalid invite or already accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               already_accepted:
 *                 value:
 *                   success: false
 *                   message: "Invite has already been accepted"
 *               expired:
 *                 value:
 *                   success: false
 *                   message: "Invitation has expired"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Email mismatch
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
 *                   example: "This invite is not valid for your email"
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already a member of the organisation
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
 *                   example: "User is already a member of this organisation"
 */

/**
 * @swagger
 * /api/v1/invites/{inviteID}/resend:
 *   get:
 *     summary: Resend an organisation invitation
 *     description: Resend an existing invitation email to the invited user. Only works for unaccepted invitations.
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique invitation ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Invitation resent successfully
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
 *                   example: "Invitation resent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     invite:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "newmember@example.com"
 *                         organisationID:
 *                           type: integer
 *                           example: 1
 *                         type:
 *                           type: string
 *                           example: "member"
 *                         isAccepted:
 *                           type: boolean
 *                           example: false
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-18T10:30:00Z"
 *                     inviteLink:
 *                       type: string
 *                       example: "https://app.example.com/invite/accept/123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Bad request - Invite already accepted or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               already_accepted:
 *                 value:
 *                   success: false
 *                   message: "Cannot resend accepted invitation"
 *               expired:
 *                 value:
 *                   success: false
 *                   message: "Cannot resend expired invitation"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error - Email service failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */