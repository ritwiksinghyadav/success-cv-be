import { Router } from "express";
import logger from "../../middleware/logger.js";
import { acceptInviteController, resendInviteController } from "../../controllers/organisation.controller.js";
import { commonAuthenticate } from "../../middleware/authenticate-routes.js";

const router = Router();

router.use(commonAuthenticate)


router.get('/:inviteID/accept', (req, res, next) => {
    const inviteID = req.params.inviteID;
    logger.info(`API v1 AUTH Send organisation invite route accessed for invite ID: ${inviteID}`);
    next();
}, acceptInviteController);

router.get('/:inviteID/resend', (req, res, next) => {
    const inviteID = req.params.inviteID;
    logger.info(`API v1 AUTH Resend organisation invite route accessed for invite ID: ${inviteID}`);
    next();
}, resendInviteController);

export const invitesRoutes = router;