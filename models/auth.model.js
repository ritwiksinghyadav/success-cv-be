import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import crypto from 'crypto';
import { forgotPasswordTokenTable, usersTable, verifyTable } from "../drizzle/schema.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateEmail, validateInteger } from "../utils/validate-helper.js";
import { createProfile } from "./profile.model.js";
import { getUserByEmailModel, updateUserPasswordModel } from "./user.model.js";
import { AppError } from "../middleware/error.js";
import { userTypeConstants } from "../utils/constants.js";

export const createVerificationTokenModel = async (email, userType) => {
    try {
        const validatedEmail = validateEmail(email);

        const existingUser = await getUserByEmailModel(validatedEmail);

        if (!existingUser) {
            throw new AppError('User with this email does not exist', 404);
        }

        const [verifyObj] = await db.insert(verifyTable).values({
            userID: existingUser.id,
            userType: userType || 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            isUsed: false
        }).returning();

        return verifyObj;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to create verification token: ${error.message}`, 500);
    }
}

export const getActiveVerificationDataByEmailModel = async (email, userType) => {
    try {
        const validatedEmail = validateEmail(email);
        const existingUser = await getUserByEmailModel(validatedEmail);

        if (!existingUser) {
            throw new AppError('User with this email does not exist', 404);
        }

        const [verificationData] = await db.select()
            .from(verifyTable)
            .where(and(
                eq(verifyTable.userID, existingUser.id),
                eq(verifyTable.userType, userType),
                eq(verifyTable.isUsed, false)
            )).limit(1);
        return verificationData || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get verification data by email: ${error.message}`, 500);
    }
}
export const getActiveVerificationDataByToken = async (token) => {
    try {

        const [verificationData] = await db.select()
            .from(verifyTable)
            .where(and(
                eq(verifyTable.id, token),
                eq(verifyTable.isUsed, false)
            )).limit(1);

        return verificationData || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get verification data by token: ${error.message}`, 500);
    }
}

export const GenerateVerificationTokenModel = async (email, userType) => {
    try {
        const validatedEmail = validateEmail(email);


        // Get active token for user
        const activeToken = await getActiveVerificationDataByEmailModel(validatedEmail, userType);
        if (activeToken) {
            return activeToken;
        }

        const newToken = await createVerificationTokenModel(validatedEmail, userType);
        return newToken;

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to generate verification token: ${error.message}`, 500);
    }
}

export const markVerificationTokenAsUsedModel = async (tokenId) => {
    try {
        const updatedRows = await db.update(verifyTable)
            .set({
                isUsed: true,
                updatedAt: new Date()
            })
            .where(eq(verifyTable.id, tokenId));

        return updatedRows;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to mark verification token as used: ${error.message}`, 500);
    }
}
export const forgotpasswordTokenGeneration = async (id, type) => {
    const validatedId = validateInteger(id, 'User ID');
    try {
        const activeToken = await checkActiveForgotPasswordTokenByUserId(validatedId);
        if (activeToken) {
            return activeToken.token;
        }
        const token = crypto.randomBytes(32).toString('hex');
        let dataobj = {
            token
        }
        if (type == userTypeConstants.CANDIDATE) {
            dataobj.candidateID = validatedId;
            dataobj.userType = userTypeConstants.CANDIDATE;
        }
        else {
            dataobj.userID = validatedId;
            dataobj.userType = userTypeConstants.USER;
        }
        const newToken = await db.insert(forgotPasswordTokenTable).values({
            ...dataobj,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
            isUsed: false
        }).returning();

        if (newToken && newToken[0] && newToken[0].token) {
            return newToken[0].token;
        }
        return null;

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to generate forgot password token: ${error.message}`, 500);
    }
}

export const checkActiveForgotPasswordTokenByUserId = async (userId) => {
    const validatedUserId = validateInteger(userId, 'User ID');
    try {
        const [tokenData] = await db.select()
            .from(forgotPasswordTokenTable)
            .where(and(
                eq(forgotPasswordTokenTable.userID, validatedUserId),
                eq(forgotPasswordTokenTable.isUsed, false)
            ))
            .limit(1);

        return tokenData || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to check active forgot password token: ${error.message}`, 500);
    }
}


export const forgotpasswordTokenValidation = async (token) => {
    // Validate the token
    const record = await db.select()
        .from(forgotPasswordTokenTable)
        .where(and(
            eq(forgotPasswordTokenTable.token, token)
        ));

    if (!record || record.length === 0) {
        throw new AppError('Invalid or expired token', 400);
    }
    const tokenRecord = record[0];

    // // Check if token is expired
    // if (new Date() > new Date(tokenRecord.expiresAt)) {
    //     throw new AppError('Token has expired', 400);
    // }
    if (tokenRecord.isUsed) {
        throw new AppError('Token has already been used', 400);
    }
    return tokenRecord;
}


export const resetPasswordUsingToken = async (token, newPassword) => {
    // Validate the token
    const tokenRecord = await forgotpasswordTokenValidation(token);

    const updatedPasswordHash = await updateUserPasswordModel(tokenRecord.userID || tokenRecord.candidateID, newPassword);

    if (!updatedPasswordHash) {
        throw new AppError('Failed to update password', 500);
    }
    // Mark the token as used
    await db.update(forgotPasswordTokenTable).set({
        isUsed: true,
        updatedAt: new Date()
    }).where(eq(forgotPasswordTokenTable.id, tokenRecord.id));
    return true;
};