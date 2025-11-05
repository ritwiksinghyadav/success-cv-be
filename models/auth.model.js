import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable, verifyTable } from "../drizzle/schema.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateEmail } from "../utils/validate-helper.js";
import { createProfile } from "./profile.model.js";
import { getUserByEmailModel } from "./user.model.js";
import { AppError } from "../middleware/error.js";

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