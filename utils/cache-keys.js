/**
 * Standardized cache key patterns for the application
 * This ensures consistent naming and easy cache invalidation
 */

/**
 * User-related cache keys
 */
export const USER_KEYS = {
    // Get user by ID: user:123
    byId: (userId) => `user:${userId}`,
    
    // Get user by email: user:email:john@example.com
    byEmail: (email) => `user:email:${email}`,
    
    // User profile: user:123:profile
    profile: (userId) => `user:${userId}:profile`,
    
    // User organisations: user:123:organisations
    organisations: (userId) => `user:${userId}:organisations`,
    
    // User sessions: user:123:session:abc123
    session: (userId, sessionId) => `user:${userId}:session:${sessionId}`,
    
    // All user keys pattern
    all: () => `user:*`,
};

/**
 * Organisation-related cache keys
 */
export const ORG_KEYS = {
    // Get org by ID: org:456
    byId: (orgId) => `org:${orgId}`,
    
    // Get org by slug: org:slug:acme-corp
    bySlug: (slug) => `org:slug:${slug}`,
    
    // Organisation members: org:456:members
    members: (orgId) => `org:${orgId}:members`,
    
    // Organisation candidates: org:456:candidates
    candidates: (orgId) => `org:${orgId}:candidates`,
    
    // All org keys pattern
    all: () => `org:*`,
};

/**
 * Candidate-related cache keys
 */
export const CANDIDATE_KEYS = {
    // Get candidate by ID: candidate:789
    byId: (candidateId) => `candidate:${candidateId}`,
    
    // Get candidate by email: candidate:email:jane@example.com
    byEmail: (email) => `candidate:email:${email}`,
    
    // Candidate profile: candidate:789:profile
    profile: (candidateId) => `candidate:${candidateId}:profile`,
    
    // All candidate keys pattern
    all: () => `candidate:*`,
};

/**
 * Resume-related cache keys
 */
export const RESUME_KEYS = {
    // Resume data: resume:123
    byId: (resumeId) => `resume:${resumeId}`,
    
    // Resume by candidate: resume:candidate:789
    byCandidate: (candidateId) => `resume:candidate:${candidateId}`,
    
    // Resume analysis result: resume:123:analysis
    analysis: (resumeId) => `resume:${resumeId}:analysis`,
    
    // Resume parsed data: resume:123:parsed
    parsed: (resumeId) => `resume:${resumeId}:parsed`,
    
    // Resume file metadata: resume:123:metadata
    metadata: (resumeId) => `resume:${resumeId}:metadata`,
    
    // All resume keys pattern
    all: () => `resume:*`,
};

/**
 * Authentication-related cache keys
 */
export const AUTH_KEYS = {
    // Token blacklist: auth:blacklist:token123
    blacklist: (token) => `auth:blacklist:${token}`,
    
    // Refresh token: auth:refresh:abc123
    refreshToken: (token) => `auth:refresh:${token}`,
    
    // Verification token: auth:verify:xyz789
    verifyToken: (token) => `auth:verify:${token}`,
    
    // Password reset token: auth:reset:def456
    resetToken: (token) => `auth:reset:${token}`,
    
    // Rate limiting: auth:ratelimit:192.168.1.1
    rateLimit: (identifier) => `auth:ratelimit:${identifier}`,
    
    // All auth keys pattern
    all: () => `auth:*`,
};

/**
 * API-related cache keys
 */
export const API_KEYS = {
    // API response cache: api:GET:/user/123
    response: (method, path) => `api:${method}:${path}`,
    
    // Rate limiting: api:ratelimit:192.168.1.1:/api/v1/users
    rateLimit: (ip, endpoint) => `api:ratelimit:${ip}:${endpoint}`,
    
    // All API keys pattern
    all: () => `api:*`,
};

/**
 * Job/Queue-related cache keys
 */
export const JOB_KEYS = {
    // Job result: job:resume-analysis:12345
    result: (jobName, jobId) => `job:${jobName}:${jobId}`,
    
    // Job status: job:status:12345
    status: (jobId) => `job:status:${jobId}`,
    
    // All job keys pattern
    all: () => `job:*`,
};

/**
 * Stats and analytics cache keys
 */
export const STATS_KEYS = {
    // Daily stats: stats:daily:2024-11-06
    daily: (date) => `stats:daily:${date}`,
    
    // Organisation stats: stats:org:456:monthly:2024-11
    orgStats: (orgId, period, date) => `stats:org:${orgId}:${period}:${date}`,
    
    // All stats keys pattern
    all: () => `stats:*`,
};

/**
 * Helper function to invalidate related cache keys
 */
export const INVALIDATE_PATTERNS = {
    // Invalidate all user-related caches
    user: (userId) => [
        USER_KEYS.byId(userId),
        USER_KEYS.profile(userId),
        USER_KEYS.organisations(userId),
        `${USER_KEYS.byId(userId)}:*`
    ],
    
    // Invalidate all org-related caches
    organisation: (orgId) => [
        ORG_KEYS.byId(orgId),
        ORG_KEYS.members(orgId),
        ORG_KEYS.candidates(orgId),
        `${ORG_KEYS.byId(orgId)}:*`
    ],
    
    // Invalidate all resume-related caches
    resume: (resumeId) => [
        RESUME_KEYS.byId(resumeId),
        RESUME_KEYS.analysis(resumeId),
        RESUME_KEYS.parsed(resumeId),
        RESUME_KEYS.metadata(resumeId),
        `${RESUME_KEYS.byId(resumeId)}:*`
    ],
};

/**
 * TTL constants (in seconds)
 */
export const TTL = {
    MINUTE_1: 60,
    MINUTE_5: 300,
    MINUTE_15: 900,
    MINUTE_30: 1800,
    HOUR_1: 3600,
    HOUR_6: 21600,
    HOUR_12: 43200,
    DAY_1: 86400,
    DAY_7: 604800,
    DAY_30: 2592000,
    
    // Specific use cases
    SESSION: 86400,           // 1 day
    TOKEN: 900,               // 15 minutes
    RATE_LIMIT: 60,           // 1 minute
    API_RESPONSE: 300,        // 5 minutes
    USER_PROFILE: 3600,       // 1 hour
    RESUME_ANALYSIS: 86400,   // 1 day
    STATS: 1800,              // 30 minutes
};

export default {
    USER_KEYS,
    ORG_KEYS,
    CANDIDATE_KEYS,
    RESUME_KEYS,
    AUTH_KEYS,
    API_KEYS,
    JOB_KEYS,
    STATS_KEYS,
    INVALIDATE_PATTERNS,
    TTL
};
