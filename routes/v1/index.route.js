import { Router } from "express";
import { sendSuccess } from "../../utils/apiHelpers.js";
import { authRoutes } from "./auth.route.js";
import logger from "../../middleware/logger.js";
import { userRoutes } from "./user.route.js";
import { organisationRoutes } from "./organisation.route.js";
import { invitesRoutes } from "./invites.route.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization endpoints
 *   - name: User
 *     description: User management endpoints
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
router.get('/health', (req, res) => {
    logger.info("API v1 health route accessed");

    const apiInfo = {
        version: "v1",
        endpoints: [
            "GET /api/v1/health",
            "Additional endpoints will be added here"
        ]
    };

    sendSuccess(res, apiInfo, "Success-CV API v1");
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/organisations', organisationRoutes);
router.use('/invites', invitesRoutes);

export const v1Routes = router;