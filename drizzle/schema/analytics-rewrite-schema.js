import { boolean, integer, pgTable, timestamp, varchar, text, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const userDocumentTable = pgTable("documents", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: integer("userID").references(() => usersTable.id).notNull(),
    title: varchar({ length: 255 }),
    fileURL: varchar({ length: 512 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    meta: text(),
    deletedAt: timestamp(), // Soft delete - null means not deleted
});

export const analysisTable = pgTable("analyses", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: integer("userID").references(() => usersTable.id).notNull(),
    documentID: integer("documentID").references(() => userDocumentTable.id).notNull(),
    status: varchar({ length: 50 }).default("pending").notNull(), // e.g., 'pending', 'completed', 'failed'
    jpbID: varchar({ length: 255 }), // ID from jpb service
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    meta: text(),
    completedAt: timestamp(), // When the analysis was completed
});

export const processedAndRawDataTable = pgTable("processed_and_raw_data", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    analysisID: integer("analysisID").references(() => analysisTable.id).notNull(),
    documentID: integer("documentID").references(() => userDocumentTable.id).notNull(),
    rawData: text().notNull(), //extracted data
    processedData: text().notNull(), //AI generated DData
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    meta: text(),
});

export const rewritesTable = pgTable("rewrites", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    analysisID: integer("analysisID").references(() => analysisTable.id).notNull(),
    documentID: integer("documentID").references(() => userDocumentTable.id).notNull(),
    processedDataID: integer("processedDataID").references(() => processedAndRawDataTable.id).notNull(),
    rewriteContent: text(),
    jobID: varchar({ length: 255 }), // ID from jpb service for rewrite
    status: varchar({ length: 50 }).default("pending").notNull(), // e.g., 'pending', 'completed', 'failed'
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    meta: text(),
});
