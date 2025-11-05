// Simple Database Helpers

import { eq, and, like, count } from "drizzle-orm";

/**
 * Simple pagination
 */
export const paginate = (page = 1, limit = 10) => {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
    return {
        limit: l,
        offset: (p - 1) * l,
        page: p
    };
};

/**
 * Simple filter builder
 */
export const buildWhere = (table, filters = {}) => {
    const conditions = [];
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
            conditions.push(eq(table[key], value));
        }
    });
    
    return conditions.length > 0 ? and(...conditions) : undefined;
};

/**
 * Simple search
 */
export const buildSearch = (table, searchTerm, columns = []) => {
    if (!searchTerm) return undefined;
    
    const searchConditions = columns
        .filter(col => table[col])
        .map(col => like(table[col], `%${searchTerm}%`));
    
    return searchConditions.length > 0 ? and(...searchConditions) : undefined;
};

/**
 * Get count
 */
export const getCount = async (db, table, whereCondition) => {
    const query = db.select({ count: count() }).from(table);
    if (whereCondition) query.where(whereCondition);
    
    const [result] = await query;
    return result.count;
};