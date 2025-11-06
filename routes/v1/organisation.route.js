import { Router } from "express";
import logger from "../../middleware/logger.js";
import { sendSuccess } from "../../utils/apiHelpers.js";
import { createOrgByUserIDController } from "../../controllers/organisation.controller.js";
import { authenticateUser, commonAuthenticate } from "../../middleware/authenticate-routes.js";

const router = Router();

router.use(commonAuthenticate)
router.get('/', (req, res, next) => {
    const userId = req.params.id;
    logger.info(`API v1 AUTH User organisations route accessed for user ID: ${userId}`);
    sendSuccess(res, { userId }, `Success-CV API v1 AUTH User organisations data for ID: ${userId}`);
});

router.post('/', (req, res, next) => {
    logger.info(`API v1 AUTH User organisations route accessed for user ID: ${req.userID}`);
    next();
}, authenticateUser, createOrgByUserIDController);


export const organisationRoutes = router;