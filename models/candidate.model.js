import { eq, and, inArray, isNull } from "drizzle-orm";
import { db } from "../config/db.js";
import { candidatesTable } from "../drizzle/schema.js";
import { createProfile } from "./profile.model.js";
import { AppError } from "../middleware/error.js";
import { validateEmail, validateInteger, validateString } from "../utils/validate-helper.js";
import { hashPassword, excludeFields } from "../utils/security-helper.js";

/**
 * Create a single candidate
 */
export const createCandidate = async (candidateData) => {
    try {
        const { fullname, email, password, organisationID } = candidateData;

        // Validate inputs
        const validatedData = {
            fullname: validateString(fullname, 'Full name', { maxLength: 255 }),
            email: validateEmail(email),
            password: validateString(password, 'Password', { minLength: 8 }),
            organisationID: validateInteger(organisationID, 'Organisation ID')
        };

        // Check if candidate already exists
        const existingCandidate = await getCandidateByEmail(validatedData.email);
        if (existingCandidate) {
            throw new AppError('Candidate with this email already exists', 409);
        }

        // Hash password
        const passwordHash = await hashPassword(validatedData.password);

        // Create candidate
        const [candidate] = await db.insert(candidatesTable).values({
            fullname: validatedData.fullname,
            email: validatedData.email,
            passwordHash,
            organisationID: validatedData.organisationID,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        // Create parallel profile for candidate
        await createProfile({ candidateID: candidate.id });

        return excludeFields(candidate, ['passwordHash', 'deletedAt']);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Failed to create candidate: ${error.message}`, 500);
    }
};

/**
 * Create multiple candidates in bulk
 */
export const createCandidatesBulk = async (candidatesData) => {
    try {
        if (!Array.isArray(candidatesData) || candidatesData.length === 0) {
            throw new AppError('Candidates data must be a non-empty array', 400);
        }

        const results = {
            successful: 0,
            failed: 0,
            successfulCandidates: [],
            failures: [],
            duplicateEmails: []
        };

        // Step 1: Validate and prepare data
        const validatedCandidates = [];
        const emailsToCheck = [];

        candidatesData.forEach((candidateData, index) => {
            try {
                const validatedData = {
                    index,
                    fullname: validateString(candidateData.fullname || candidateData.name, 'Full name', { maxLength: 255 }),
                    email: validateEmail(candidateData.email),
                    password: validateString(candidateData.password, 'Password', { minLength: 8 }),
                    organisationID: validateInteger(candidateData.organisationID, 'Organisation ID')
                };

                validatedCandidates.push(validatedData);
                emailsToCheck.push(validatedData.email);

            } catch (error) {
                results.failed++;
                results.failures.push({
                    index,
                    email: candidateData?.email || 'unknown',
                    error: error.message
                });
            }
        });

        if (validatedCandidates.length === 0) {
            return results;
        }

        // Step 2: Check for duplicate emails in database (single query)
        const existingCandidates = await db.select({ email: candidatesTable.email })
            .from(candidatesTable)
            .where(
                and(
                    inArray(candidatesTable.email, emailsToCheck),
                    isNull(candidatesTable.deletedAt)
                )
            );

        const existingEmailsSet = new Set(existingCandidates.map(c => c.email));

        // Step 3: Process candidates and hash passwords
        const candidatesToInsert = [];
        const hashPromises = [];

        validatedCandidates.forEach((candidateData) => {
            // Check for duplicate email
            if (existingEmailsSet.has(candidateData.email)) {
                results.failed++;
                results.duplicateEmails.push(candidateData.email);
                results.failures.push({
                    index: candidateData.index,
                    email: candidateData.email,
                    error: 'Candidate with this email already exists'
                });
                return;
            }

            // Add to hash queue
            hashPromises.push(
                hashPassword(candidateData.password).then(passwordHash => ({
                    ...candidateData,
                    passwordHash
                }))
            );
        });

        // Step 4: Hash all passwords in parallel
        const hashedCandidates = await Promise.all(hashPromises);
        
        // Prepare for insertion
        const currentTime = new Date();
        hashedCandidates.forEach(candidate => {
            candidatesToInsert.push({
                fullname: candidate.fullname,
                email: candidate.email,
                passwordHash: candidate.passwordHash,
                organisationID: candidate.organisationID,
                isVerified: false,
                createdAt: currentTime,
                updatedAt: currentTime,
                originalIndex: candidate.index
            });
        });

        // Step 5: Bulk insert (single query)
        if (candidatesToInsert.length > 0) {
            const insertedCandidates = await db.insert(candidatesTable)
                .values(candidatesToInsert.map(candidate => ({
                    fullname: candidate.fullname,
                    email: candidate.email,
                    passwordHash: candidate.passwordHash,
                    organisationID: candidate.organisationID,
                    isVerified: candidate.isVerified,
                    createdAt: candidate.createdAt,
                    updatedAt: candidate.updatedAt
                })))
                .returning();

            // Step 6: Create profiles in parallel (non-blocking)
            const profilePromises = insertedCandidates.map(candidate =>
                createProfile({ candidateID: candidate.id }).catch(error => {
                    console.error(`Failed to create profile for candidate ${candidate.id}:`, error);
                })
            );
            await Promise.all(profilePromises);

            // Process results
            insertedCandidates.forEach((candidate, i) => {
                results.successful++;
                results.successfulCandidates.push({
                    index: candidatesToInsert[i].originalIndex,
                    id: candidate.id,
                    email: candidate.email,
                    fullname: candidate.fullname,
                    organisationID: candidate.organisationID
                });
            });
        }

        return results;
    } catch (error) {
        throw new AppError(`Failed to create candidates in bulk: ${error.message}`, 500);
    }
};

/**
 * Get candidate by email
 */
export const getCandidateByEmail = async (email) => {
    try {
        const validatedEmail = validateEmail(email);
        const [candidate] = await db.select()
            .from(candidatesTable)
            .where(
                and(
                    eq(candidatesTable.email, validatedEmail),
                    isNull(candidatesTable.deletedAt)
                )
            );
        return candidate || null;
    } catch (error) {
        throw new AppError(`Failed to get candidate by email: ${error.message}`, 500);
    }
};

/**
 * Get candidate by ID
 */
export const getCandidateById = async (id) => {
    try {
        const validId = validateInteger(id, "Candidate ID", { min: 1 });
        const [candidate] = await db.select()
            .from(candidatesTable)
            .where(
                and(
                    eq(candidatesTable.id, validId),
                    isNull(candidatesTable.deletedAt)
                )
            );
        return candidate || null;
    } catch (error) {
        throw new AppError(`Failed to get candidate by ID: ${error.message}`, 500);
    }
};

/**
 * Update candidate
 */
export const updateCandidate = async (id, updateData) => {
    try {
        const validId = validateInteger(id, "Candidate ID", { min: 1 });

        const [candidate] = await db.update(candidatesTable)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(candidatesTable.id, validId),
                    isNull(candidatesTable.deletedAt)
                )
            )
            .returning();

        return candidate ? excludeFields(candidate, ['passwordHash']) : null;
    } catch (error) {
        throw new AppError(`Failed to update candidate: ${error.message}`, 500);
    }
};

/**
 * Soft delete candidate
 */
export const deleteCandidate = async (id) => {
    try {
        const validId = validateInteger(id, "Candidate ID", { min: 1 });

        const [candidate] = await db.update(candidatesTable)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(candidatesTable.id, validId),
                    isNull(candidatesTable.deletedAt)
                )
            )
            .returning();

        return candidate ? excludeFields(candidate, ['passwordHash']) : null;
    } catch (error) {
        throw new AppError(`Failed to delete candidate: ${error.message}`, 500);
    }
};