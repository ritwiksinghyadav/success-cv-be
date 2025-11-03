import { boolean, integer, pgTable, timestamp, varchar, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullname: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar({ length: 255 }).notNull(),
    isVerified: boolean().default(false).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(), // Soft delete - null means not deleted
});

export const candidatesTable = pgTable("candidates", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullname: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    organisationID: integer('organisationID').notNull(),
    passwordHash: varchar({ length: 255 }).notNull(),
    isVerified: boolean().default(false).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(), // Soft delete - null means not deleted
});

export const profilesTable = pgTable("profiles", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: integer().references(() => usersTable.id, { onDelete: 'cascade' }),
    candidateID: integer().references(() => candidatesTable.id, { onDelete: 'cascade' }),
    bio: text(),
    imageURL: varchar({ length: 512 }),
    location: varchar({ length: 255 }),
    country: varchar({ length: 255 }),
    city: varchar({ length: 255 }),
    state: varchar({ length: 255 }),
    zipCode: varchar({ length: 20 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

export const forgotPasswordTokenTable = pgTable("forgot_password_tokens", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: integer("userID").references(() => usersTable.id, { onDelete: 'cascade' }),
    candidateID: integer("candidateID").references(() => candidatesTable.id, { onDelete: 'cascade' }),
    userType: varchar({ length: 20 }).notNull().default('user'), // 'user' or 'candidate'
    token: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    expiresAt: timestamp().notNull(),
    isUsed: boolean().default(false).notNull(),
})

export const verifyTable = pgTable("verify_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userID: integer("userID").references(() => usersTable.id, { onDelete: 'cascade' }),
    candidateID: integer("candidateID").references(() => candidatesTable.id, { onDelete: 'cascade' }),
    userType: varchar({ length: 20 }).notNull().default('user'), // 'user' or 'candidate'
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    isUsed: boolean().default(false).notNull(),
})
