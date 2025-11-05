import { Router } from "express";
import logger from "../../middleware/logger.js";
import { sendSuccess } from "../../utils/apiHelpers.js";

const router = Router();

router.get('/health', (req, res) => {
    logger.info("API v1 AUTH health route accessed");
    sendSuccess(res, null, "Success-CV API v1 AUTH");
});

router.post('/register', (req, res) => {
    logger.info("User registration endpoint hit");
    sendSuccess(res, null, "User registered successfully");
});

router.post('/login', (req, res) => {
    logger.info("User login endpoint hit");
    sendSuccess(res, null, "User logged in successfully");
});

router.post('/verify/send', (req, res) => {
    logger.info("Send verification code endpoint hit");
    sendSuccess(res, null, "Verification code sent successfully");
});

router.post('/verify/confirm', (req, res) => {
    logger.info("Confirm verification code endpoint hit");
    sendSuccess(res, null, "Verification code confirmed successfully");
});

router.post('/forgot-password', (req, res) => {
    logger.info("Forgot password endpoint hit");
    sendSuccess(res, null, "Password reset link sent successfully");
});

router.post('/forgot-password/:token', (req, res) => {
    logger.info("Reset password endpoint hit");
    sendSuccess(res, null, "Password reset successfully");
});



export const candidateAuthRoutes = router;