/**
 * Client-side validation utilities
 */

/**
 * Validate email address using more comprehensive regex
 * @param email Email address to validate
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) return false;
    
    // Additional checks
    const [localPart, domain] = email.split('@');
    
    // Check local part length
    if (localPart.length > 64) return false;
    
    // Check domain length
    if (domain.length > 255) return false;
    
    return true;
};

/**
 * Validate Philippine phone number
 * @param phone Phone number to validate
 * @returns boolean
 */
export const isValidPhilippinePhone = (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remove all non-digit characters
    const cleanedNumber = phone.replace(/[^0-9]/g, '');
    
    // Philippine mobile numbers (11 digits starting with 09)
    if (/^09\d{9}$/.test(cleanedNumber)) {
        return true;
    }
    
    // Philippine mobile numbers with country code (13 digits starting with 639)
    if (/^639\d{9}$/.test(cleanedNumber)) {
        return true;
    }
    
    // Philippine landline numbers with area codes
    if (/^\d{9,12}$/.test(cleanedNumber)) {
        const areaCodePatterns = [
            /^(2|3|4)\d{7,8}$/,           // Metro Manila and major cities
            /^(32|33|34|35|36|38)\d{7}$/, // Iloilo, Bacolod, Dumaguete, etc.
            /^(42|43|44|45|46|47|48|49)\d{7}$/, // Batangas, Lipa, etc.
            /^(52|53|54|55|56)\d{7}$/,    // Bicol region
            /^(62|63|64|65|68)\d{7}$/,    // Western Visayas
            /^(72|74|75|77|78)\d{7}$/,    // Central Visayas
            /^(82|83|84|85|86|87|88)\d{7}$/ // Mindanao
        ];
        
        return areaCodePatterns.some(pattern => pattern.test(cleanedNumber));
    }
    
    return false;
};

/**
 * Validate name (allows only letters, spaces, hyphens, and apostrophes)
 * @param name Name to validate
 * @returns boolean
 */
export const isValidName = (name: string): boolean => {
    if (!name || typeof name !== 'string') return false;
    return /^[a-zA-Z\s\-']+$/.test(name.trim());
};

/**
 * Format Philippine phone number for display
 * @param phone Phone number to format
 * @returns formatted phone number
 */
export const formatPhilippinePhone = (phone: string): string => {
    if (!phone) return '';
    
    const cleanedNumber = phone.replace(/[^0-9]/g, '');
    
    // Mobile number starting with 09
    if (/^09\d{9}$/.test(cleanedNumber)) {
        return cleanedNumber.replace(/^(09\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
    }
    
    // Mobile with country code
    if (/^639\d{9}$/.test(cleanedNumber)) {
        return cleanedNumber.replace(/^(639\d{2})(\d{3})(\d{4})$/, '+$1 $2 $3');
    }
    
    return phone; // Return original if no pattern matches
};

/**
 * Get validation error message for email
 * @param email Email to validate
 * @returns Error message or null if valid
 */
export const getEmailError = (email: string): string | null => {
    if (!email) return 'Email address is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    if (email !== email.toLowerCase()) return 'Email address must be in lowercase';
    return null;
};

/**
 * Get validation error message for Philippine phone number
 * @param phone Phone number to validate
 * @returns Error message or null if valid
 */
export const getPhoneError = (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    if (!isValidPhilippinePhone(phone)) return 'Please enter a valid Philippine phone number';
    return null;
};

/**
 * Get validation error message for name
 * @param name Name to validate
 * @param fieldName Display name for the field
 * @returns Error message or null if valid
 */
export const getNameError = (name: string, fieldName: string = 'Name'): string | null => {
    if (!name?.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long`;
    if (name.trim().length > 255) return `${fieldName} must not exceed 255 characters`;
    if (!isValidName(name)) return `${fieldName} may only contain letters, spaces, hyphens, and apostrophes`;
    return null;
};

/**
 * Validate password (requires uppercase, lowercase, and number)
 * @param password Password to validate
 * @returns boolean
 */
export const isValidPassword = (password: string): boolean => {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 8) return false;
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) return false;
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) return false;
    
    return true;
};

/**
 * Get validation error message for password
 * @param password Password to validate
 * @returns Error message or null if valid
 */
export const getPasswordError = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
};

/**
 * Real-time validation hook for forms
 */
export const validateField = (field: string, value: string, fieldName?: string): string | null => {
    switch (field) {
        case 'email':
            return getEmailError(value);
        case 'phone':
            return getPhoneError(value);
        case 'first_name':
            return getNameError(value, 'First name');
        case 'last_name':
            return getNameError(value, 'Last name');
        case 'name':
            return getNameError(value, fieldName || 'Name');
        case 'password':
            return getPasswordError(value);
        default:
            return null;
    }
};
