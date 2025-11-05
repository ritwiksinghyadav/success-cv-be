import crypto from 'crypto';
import bcrypt from 'bcrypt';
export const hashPassword = async (password, saltRounds = 12) => {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    return await bcrypt.hash(password, saltRounds);
};

export const excludeFields = (obj, fieldsToExclude = ['passwordHash', 'deletedAt']) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = { ...obj };

    for (const field of fieldsToExclude) {
        delete result[field];
    }

    return result;
};