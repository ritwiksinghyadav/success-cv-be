import { profilesTable } from "../drizzle/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { paginate, buildWhere, buildSearch, getCount } from "../utils/dbHelpers.js";
import { db } from "../config/db.js";
import { AppError } from "../middleware/error.js";

/**
 * Create a new profile
 */
export const createProfile = async (profileData) => {
    try {
        const [profile] = await db.insert(profilesTable)
            .values({
                ...profileData,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        return profile;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to create profile: ${error.message}`, 500);
    }
};

/**
 * Update profile by ID
 */
export const updateProfile = async (id, updateData) => {
    try {
        const [profile] = await db.update(profilesTable)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(profilesTable.id, id))
            .returning();

        return profile;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to update profile: ${error.message}`, 500);
    }
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id) => {
    try {
        const [profile] = await db.select()
            .from(profilesTable)
            .where(eq(profilesTable.id, id));

        return profile || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get profile: ${error.message}`, 500);
    }
};

/**
 * Get profile by user ID
 */
export const getProfileByUserId = async (userID) => {
    try {
        const [profile] = await db.select()
            .from(profilesTable)
            .where(eq(profilesTable.userID, userID));

        return profile || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get profile by user ID: ${error.message}`, 500);
    }
};

/**
 * Get profile by candidate ID
 */
export const getProfileByCandidateId = async (candidateID) => {
    try {
        const [profile] = await db.select()
            .from(profilesTable)
            .where(eq(profilesTable.candidateID, candidateID));

        return profile || null;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get profile by candidate ID: ${error.message}`, 500);
    }
};

/**
 * Delete profile by ID (hard delete)
 */
export const deleteProfile = async (id) => {
    try {
        const [deletedProfile] = await db.delete(profilesTable)
            .where(eq(profilesTable.id, id))
            .returning();

        return deletedProfile;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to delete profile: ${error.message}`, 500);
    }
};

/**
 * Get all profiles with simple pagination and filters
 */
export const getAllProfiles = async (options = {}) => {
    try {
        const { filters = {}, search, page = 1, limit = 10 } = options;

        // Build pagination
        const pagination = paginate(page, limit);

        // Build where conditions
        const filterWhere = buildWhere(profilesTable, filters);
        const searchWhere = buildSearch(profilesTable, search, ['bio', 'location', 'country', 'city']);

        const whereCondition = filterWhere && searchWhere ?
            and(filterWhere, searchWhere) :
            (filterWhere || searchWhere);

        // Get total count
        const total = await getCount(db, profilesTable, whereCondition);

        // Get data
        let query = db.select().from(profilesTable);
        if (whereCondition) query = query.where(whereCondition);
        query = query.limit(pagination.limit).offset(pagination.offset);

        const data = await query;

        return {
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to get profiles: ${error.message}`, 500);
    }
};

/**
 * Check if profile exists for user or candidate
 */
export const profileExists = async (userID = null, candidateID = null) => {
    try {
        let whereCondition;

        if (userID) {
            whereCondition = eq(profilesTable.userID, userID);
        } else if (candidateID) {
            whereCondition = eq(profilesTable.candidateID, candidateID);
        } else {
            throw new AppError("Either userID or candidateID must be provided", 400);
        }

        const [profile] = await db.select({ id: profilesTable.id })
            .from(profilesTable)
            .where(whereCondition);

        return !!profile;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to check profile existence: ${error.message}`, 500);
    }
};