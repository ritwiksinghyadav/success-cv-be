export const validateInteger = (value, fieldName, options = {}) => {
    const { min = 1, max = Number.MAX_SAFE_INTEGER, required = true } = options;

    if (!required && (value === null || value === undefined)) {
        return null;
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (!Number.isInteger(numValue) || numValue < min || numValue > max) {
        throw new Error(`${fieldName} must be an integer between ${min} and ${max}`);
    }

    return numValue;
};

export const validateString = (value, fieldName, options = {}) => {
    const {
        minLength = 0,
        maxLength = 255,
        required = true,
        trim = true,
        allowEmpty = false
    } = options;

    if (!required && (value === null || value === undefined)) {
        return null;
    }

    if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
    }

    const processedValue = trim ? value.trim() : value;

    if (!allowEmpty && processedValue.length === 0 && required) {
        throw new Error(`${fieldName} is required and cannot be empty`);
    }

    if (processedValue.length < minLength || processedValue.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    }

    return processedValue;
};

export const validateEmail = (email, fieldName = 'Email', required = true) => {
    if (!required && (!email || email.trim() === '')) {
        return null;
    }

    if (!email || typeof email !== 'string') {
        throw new Error(`${fieldName} is required`);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new Error(`${fieldName} format is invalid`);
    }

    if (normalizedEmail.length > 255) {
        throw new Error(`${fieldName} cannot exceed 255 characters`);
    }

    return normalizedEmail;
};
