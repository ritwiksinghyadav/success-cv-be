import { Router } from "express";
import logger from "../../middleware/logger.js";
import { sendSuccess } from "../../utils/apiHelpers.js";
import { candidateAuthRoutes } from "./candidate-auth.route.js";
import { confirmVerificationCodeController, forgotPasswordController, registerController, resetPasswordController, sendVerificationCodeController } from "../../controllers/auth.controller.js";

const router = Router();

router.get('/health', (req, res, next) => {
    logger.info("API v1 AUTH health route accessed");
    sendSuccess(res, null, "Success-CV API v1 AUTH");
});

router.use('/candidate', candidateAuthRoutes)

router.post('/register', (req, res, next) => {
    logger.info("User registration endpoint hit");
    next();
}, registerController);

router.post('/login', (req, res, next) => {
    logger.info("User login endpoint hit");
    sendSuccess(res, null, "User logged in successfully");
});

router.get('/refresh-token', (req, res, next) => {
    logger.info("Token refresh endpoint hit");
    sendSuccess(res, null, "Token refreshed successfully");
});

router.post('/verify/send', (req, res, next) => {
    logger.info("Send verification code endpoint hit");
    next();
}, sendVerificationCodeController);

router.get('/verify/:token', (req, res, next) => {
    logger.info("Confirm verification code endpoint hit");
    next();
}, confirmVerificationCodeController);

router.post('/forgot-password', (req, res, next) => {
    logger.info("Forgot password endpoint hit");
    next();
}, forgotPasswordController);

router.post('/forgot-password/:token', (req, res, next) => {
    logger.info("Reset password endpoint hit");
    next();
}, resetPasswordController);



export const authRoutes = router;