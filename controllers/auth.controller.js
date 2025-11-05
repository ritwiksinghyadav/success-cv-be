import { AppError, asyncHandler } from "../middleware/error.js";
import { GenerateVerificationTokenModel, getActiveVerificationDataByEmailModel, getActiveVerificationDataByToken, markVerificationTokenAsUsedModel } from "../models/auth.model.js";
import { createUserModel, getUserByEmailModel, verifyUserModel } from "../models/user.model.js";
import { sendVerificationEmail } from "../services/email/emailTrigger.js";
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