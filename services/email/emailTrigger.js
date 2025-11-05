import { AppError } from "../../middleware/error.js";
import { sendEmail } from "./setBrevo.js";

export const sendVerificationEmail = async (to, name, loginUrl) => {
    const subject = "Verify your email address";
    const text = `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n${loginUrl}\n\nThank you!`;
    const result = await sendEmail(to, subject, text);
    if (!result.success) {
        throw new AppError(result.error || 'Failed to send verification email', 500);
    }
    return result;
}

export const sendPasswordResetEmail = async (to, name, resetUrl) => {
    const subject = "Password Reset Request";
    const text = `Hi ${name},\n\nYou can reset your password by clicking the link below:\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email.\n\nThank you!`;
    const result = await sendEmail(to, subject, text);
    if (!result.success) {
        throw new AppError(result.error || 'Failed to send password reset email', 500);
    }
    return result;
}