import { AppError, asyncHandler } from "../middleware/error.js";
import { forgotpasswordTokenGeneration, GenerateVerificationTokenModel, getActiveVerificationDataByToken, markVerificationTokenAsUsedModel, resetPasswordUsingToken } from "../models/auth.model.js";
import { createUserModel, getUserByEmailModel, verifyUserModel } from "../models/user.model.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email/emailTrigger.js";
import { sendSuccess } from "../utils/apiHelpers.js";
import { userTypeConstants } from "../utils/constants.js";
import { validateEmail, validateString } from "../utils/validate-helper.js";

export const registerController = asyncHandler(async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return next(new AppError('Invalid request body', 400));
    }

    const { fullname, email, password } = req.body;

    const validatedData = {
        fullname: validateString(fullname, 'Name', { maxLength: 255 }),
        email: validateEmail(email),
        password: validateString(password, 'Password', { minLength: 8 })
    };


    const user = await createUserModel(validatedData);
    if (!user) {
        return next(new AppError('User registration failed', 500));
    }

    const verificationId = await GenerateVerificationTokenModel(email, userTypeConstants.USER);

    if (verificationId && verificationId.id) {
        sendVerificationEmail(email, fullname, `${process.env.FRONTEND_URL}/verify/${verificationId.id}`);
    }

    sendSuccess(res, user, "User registered successfully. A verification link has been sent.", 201);
    // sendSuccess(res, user, "User registered successfully", 201);
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
