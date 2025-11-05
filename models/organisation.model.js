import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { organisationsTable } from "../drizzle/schema.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateInteger, validateSlug, validateString } from "../utils/validate-helper.js";
import { AppError } from "../middleware/error.js";

export const createOrg = async (userID, data) => {

    try {

        const { name, slug, ...rest } = data;

        const validatedName = validateString(name, "Organisation Name", { minLength: 2, maxLength: 100 });
        const validatedSlug = validateSlug(slug, "Organisation Slug", { minLength: 2, maxLength: 100 });

        const existingOrg = await getOrgBySlug(validatedSlug);

        if (existingOrg?.id) {
            throw new AppError('Organisation with this slug already exists', 409);
        }

        const [createdOrg] = await db.insert(organisationsTable).values({
            name: validatedName,
            slug: validatedSlug,
            creatorID: userID,
            ...rest,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return createdOrg;
    } catch (error) {
        // If it's already an AppError, don't wrap it
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to create user: ${error.message}`, 500);
    }
}

export const getOrgBySlug = async (slug) => {
    try {
        const validatedSlug = validateSlug(slug, "Organisation Slug", { minLength: 2, maxLength: 100 });
        const [org] = await db.select()
            .from(organisationsTable)
            .where(eq(organisationsTable.slug, validatedSlug)).limit(1);
        return excludeFields(org, ['deletedAt']) || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get organisation by slug: ${error.message}`, 500);
    }
}

export const getOrgByID = async (id) => {
    try {
        const validOrgID = validateInteger(id, "Organisation ID", { min: 1 });
        const [org] = await db.select()
            .from(organisationsTable)
            .where(eq(organisationsTable.id, validOrgID));
        return excludeFields(org, ['deletedAt']) || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get organisation by ID: ${error.message}`, 500);
    }
}


