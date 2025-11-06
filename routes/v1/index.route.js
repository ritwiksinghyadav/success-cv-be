import { Router } from "express";
import { sendSuccess } from "../../utils/apiHelpers.js";
import { authRoutes } from "./auth.route.js";
import logger from "../../middleware/logger.js";
import { userRoutes } from "./user.route.js";
import { healthRoutes } from "./health.route.js";
import sseRoutes from "./sse.route.js";

const router = Router();

router.get('/health', (req, res) => {
    logger.info("API v1 health route accessed");

    const apiInfo = {
        version: "v1",
        endpoints: [
            "GET /api/v1/health",
            "GET /api/v1/health/redis",
            "GET /api/v1/health/queue",
            "GET /api/v1/health/cache",
            "GET /api/v1/health/full"
        ]
    };

    sendSuccess(res, apiInfo, "Success-CV API v1");
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/sse', sseRoutes);

export const v1Routes = router;