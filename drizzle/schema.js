// Main schema export file - imports all tables from different modules
// This is the single entry point for all database schemas

// Export all tables directly - no need for separate imports
export {
    usersTable,
    profilesTable,
    candidatesTable,
    forgotPasswordTokenTable,
    verifyTable
} from './schema/auth.js';

export {
    organisationsTable,
    orgMembersTable,
    inviteTable
} from './schema/organisation.js';

export {
    userDocumentTable,
    analysisTable,
    processedAndRawDataTable,
    rewritesTable,
    candidateDocumentTable,
    candidateAnalysisTable,
    candidateProcessedAndRawDataTable,
    candidateRewritesTable
} from './schema/analytics-rewrite-schema.js';