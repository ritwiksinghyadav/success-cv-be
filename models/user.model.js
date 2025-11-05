import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";
import { excludeFields, hashPassword } from "../utils/security-helper.js";
import { validateEmail, validateInteger, validateString } from "../utils/validate-helper.js";
import { createProfile } from "./profile.model.js";
import { AppError } from "../middleware/error.js";

export const createUserModel = async (userData) => {

    try {
        // Validate and process userData
        const { email, password, fullname } = userData;

        // Perform necessary validations
        const validatedEmail = validateEmail(email);
        const validatedPassword = validateString(password, "Password", { minLength: 6 });
        const validatedFullname = validateString(fullname, "Full Name", { minLength: 2, maxLength: 100 });

        // Create user object
        const newUser = {
            email: validatedEmail,
            password: await hashPassword(validatedPassword),
            fullname: validatedFullname
        };

        const existingUser = await getUserByEmailModel(validatedEmail);

        if (existingUser?.id) {
            throw new AppError('User with this email already exists', 409);
        }
        const [createdUser] = await db.insert(usersTable).values({
            fullname: newUser.fullname,
            email: newUser.email,
            passwordHash: newUser.password,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        if (createdUser && createdUser.id) {
            await createProfile({ userID: createdUser.id });
        }

        return excludeFields(createdUser, ['passwordHash', 'deletedAt']);
    } catch (error) {
        // If it's already an AppError, don't wrap it
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to create user: ${error.message}`, 500);
    }
}

export const getUserByEmailModel = async (email) => {
    try {
        const validatedEmail = validateEmail(email);
        const [user] = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, validatedEmail));
        return user || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get user by email: ${error.message}`);
    }
};

export const getUserByIDModel = async (id) => {
    try {
        const validUserID = validateInteger(id, "User ID", { min: 1 });
        const [user] = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, validUserID));
        return user || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get user by ID: ${error.message}`, 500);
    }
}
export const verifyUserModel = async (id) => {
    try {
        const validUserID = validateInteger(id, "User ID", { min: 1 });

        const [user] = await db.update(usersTable)
            .set({ isVerified: true })
            .where(eq(usersTable.id, validUserID)).returning();

        return user || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get user by ID: ${error.message}`, 500);
    }
}

export const updateUserPasswordModel = async (id, newPassword) => {
    try {
        const validUserID = validateInteger(id, "User ID", { min: 1 });
        const validatedPassword = validateString(newPassword, "New Password", { minLength: 6 });
        let passwordHash = await hashPassword(validatedPassword);
        const [updatedUser] = await db.update(usersTable)
            .set({ passwordHash: passwordHash })
            .where(eq(usersTable.id, validUserID)).returning();

        return updatedUser || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to update user password: ${error.message}`, 500);
    }
}