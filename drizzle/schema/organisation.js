import { boolean, integer, pgTable, timestamp, varchar, text, uuid, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const organisationsTable = pgTable("organisations", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    creatorID: integer("creatorID").references(() => usersTable.id).notNull(),
    address: text(), // Optional field - no .notNull()
    country: varchar({ length: 100 }), // Optional field - no .notNull()
    state: varchar({ length: 100 }), // Optional field - no .notNull()
    city: varchar({ length: 100 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(), // Soft delete - null means not deleted
});

export const orgMembersTable = pgTable("organisation_members", {
    id: serial().primaryKey(),
    userID: integer("userID").references(() => usersTable.id).notNull(),
    organisationID: integer("organisationID").references(() => organisationsTable.id).notNull(),
    role: varchar({ length: 100 }).notNull(), // e.g., 'admin', 'member',
    inviteRef: uuid("invite_ref").references(() => inviteTable.id), // Reference to the invite used
    joinedAt: timestamp().defaultNow().notNull(),
});

export const inviteTable = pgTable("invites", {
    id: uuid("id").primaryKey().defaultRandom(),
    generatedBy: integer("generatedBy").references(() => usersTable.id).notNull(),
    organisationID: integer("organisationID").references(() => organisationsTable.id).notNull(),
    type: varchar({ length: 50 }).notNull(), // e.g., 'member', 'admin'
    email: varchar({ length: 255 }),
    isAccepted: boolean().default(false),
    acceptedCount: integer().default(0).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    expiresAt: timestamp().notNull(),
});