import jwt from 'jsonwebtoken';
import { AppError, asyncHandler } from "../middleware/error.js";
import { forgotpasswordTokenGeneration, GenerateVerificationTokenModel, getActiveVerificationDataByToken, markVerificationTokenAsUsedModel, resetPasswordUsingToken } from "../models/auth.model.js";
import { createUserModel, getUserByEmailModel, verifyUserModel } from "../models/user.model.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email/emailTrigger.js";
import { destructureRequest, sendSuccess } from "../utils/apiHelpers.js";
import { userTypeConstants } from "../utils/constants.js";
import { validateEmail, validateString } from "../utils/validate-helper.js";
import { comparePassword } from '../utils/security-helper.js';
import { createCandidatesBulk } from '../models/candidate.model.js';

export const registerBulkController = asyncHandler(async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return next(new AppError('Invalid request body', 400));
    }

    const { candidates } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
        return next(new AppError('Candidates array is required and must not be empty', 400));
    }

    if (candidates.length > 1000) {
        return next(new AppError('Maximum 1000 candidates can be registered at once', 400));
    }

    try {
        const startTime = new Date();
        console.log(`Starting bulk registration: ${candidates.length} candidates`);

        // Direct call to bulk create - no batching needed in controller
        const results = await createCandidatesBulk(candidates);

        const endTime = new Date();
        const duration = endTime - startTime;

        console.log(`Bulk registration completed: ${results.successful}/${candidates.length} successful in ${duration}ms`);

        // Determine status code based on results
        const statusCode = results.failed === 0 ? 201 : (results.successful === 0 ? 400 : 207);

        sendSuccess(res, {
            summary: {
                total: candidates.length,
                successful: results.successful,
                failed: results.failed,
                successRate: `${((results.successful / candidates.length) * 100).toFixed(2)}%`,
                duration: `${duration}ms`,
                duplicateEmails: results.duplicateEmails.length
            },
            successfulCandidates: results.successfulCandidates,
            failures: results.failures,
            duplicateEmails: results.duplicateEmails
        }, `Bulk registration completed: ${results.successful} successful, ${results.failed} failed`, statusCode);

    } catch (error) {
        console.log('Bulk registration error:', error);
        return next(new AppError(`Bulk registration failed: ${error.message}`, 500));
    }
});

export const sendVerificationCodeController = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const validatedEmail = validateEmail(email);

    const existingUser = await getUserByEmailModel(validatedEmail);

    if (!existingUser) {
        throw new AppError('User with this email does not exist', 404);
    }

    if (existingUser.isVerified) {
        throw new AppError('User is already verified', 400);
    }

    const verificationId = await GenerateVerificationTokenModel(email, userTypeConstants.USER);

    if (verificationId && verificationId.id) {
        sendVerificationEmail(email, existingUser.fullname, `${process.env.FRONTEND_URL}/verify/${verificationId.id}`);
    }

    sendSuccess(res, null, "A verification link has been sent. To your Email", 200);

});

export const confirmVerificationCodeController = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    const verificationData = await getActiveVerificationDataByToken(token);

    if (!verificationData) {
        return next(new AppError('Invalid or expired verification token', 400));
    }

    let user = await verifyUserModel(verificationData.userID);
    if (user && user.isVerified) {
        await markVerificationTokenAsUsedModel(verificationData.id);
        sendSuccess(res, null, "User Is Verified Successfully", 200);
    } else {
        return next(new AppError('User verification failed', 500));
    }
});

export const forgotPasswordController = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email is required', 400));
    }
    let user = await getUserByEmailModel(email);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // add forgot password token generation and storage logic here (if needed)
    const resetToken = await forgotpasswordTokenGeneration(user.id, userTypeConstants.USER);
    if (!resetToken) {
        return next(new AppError('Failed to generate password reset token', 500));
    }
    // Send password reset email
    await sendPasswordResetEmail(email, user.fullname, `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

    sendSuccess(res, null, 'Password reset link has been sent to your email', 200);

})

export const resetPasswordController = asyncHandler(async (req, res, next) => {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!token || !newPassword) {
        return next(new AppError('Token and new password are required', 400));
    }

    // Check if the token is valid
    const response = await resetPasswordUsingToken(token, newPassword);

    if (!response) {
        return next(new AppError('Invalid or expired token', 400));
    }

    sendSuccess(res, null, 'Password has been reset successfully', 200);
});

export const LoginController = asyncHandler(async (req, res, next) => {
    // Validate body
    if (!req.body || typeof req.body !== 'object') {
        return next(new AppError('Invalid request body', 400));
    }

    // Validate inputs
    const { email, password } = req.body;
    const validatedEmail = validateEmail(email);
    const validatedPassword = validateString(password, 'Password');

    // Check if user exists (with password hash for verification)
    const user = await getUserByEmailModel(validatedEmail, true);
    if (!user) {
        return next(new AppError('This user does not exist', 401));
    }

    if (user.isVerified === false) {
        return next(new AppError('User is not verified. Please verify your email before logging in.', 401));
    }

    if (user.deletedAt) {
        return next(new AppError('User account has been deleted.', 401));
    }

    // Verify password using secure utility
    const isPasswordValid = await comparePassword(validatedPassword, user.passwordHash);
    if (!isPasswordValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Generate tokens
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, type: userTypeConstants.USER },
        process.env.JWT_SECRET_ACCESS_KEY,
        { expiresIn: process.env.ACCESS_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
        { id: user.id, email: user.email, type: userTypeConstants.USER },
        process.env.JWT_SECRET_REFRESH_KEY,
        { expiresIn: process.env.REFRESH_EXPIRES_IN }
    );

    let data = {
        user: { id: user.id, fullname: user.fullname, email: user.email, isVerified: user.isVerified },
        accessToken,
        refreshToken
    }
    sendSuccess(res, data, "Login successful", 200)
});

export const refreshTokenController = asyncHandler(async (req, res, next) => {
    const { refreshToken, token } = destructureRequest(req);

    if (!refreshToken || !token) {
        return next(new AppError('Refresh token and access token are required', 400));
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY);

        // Generate new tokens
        const accessToken = jwt.sign(
            { id: decoded.id, email: decoded.email, type: decoded.type },
            process.env.JWT_SECRET_ACCESS_KEY,
            { expiresIn: process.env.ACCESS_EXPIRES_IN }
        );
        const newRefreshToken = jwt.sign(
            { id: decoded.id, email: decoded.email, type: decoded.type },
            process.env.JWT_SECRET_REFRESH_KEY,
            { expiresIn: process.env.REFRESH_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        return next(new AppError('Invalid or expired refresh token', 401));
    }
});