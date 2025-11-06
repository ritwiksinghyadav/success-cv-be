import { Router } from "express";
import { sendSuccess } from "../../utils/apiHelpers.js";
import { authRoutes } from "./auth.route.js";
import logger from "../../middleware/logger.js";
import { userRoutes } from "./user.route.js";
import { organisationRoutes } from "./organisation.route.js";

const router = Router();

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

export const v1Routes = router;