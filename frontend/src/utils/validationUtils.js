/**
 * Extracts field-specific errors from an error object.
 * Returns an object map { fieldName: "Error message" }.
 */
export const extractFieldErrors = (error) => {
    if (!error?.response?.data || typeof error.response.data !== 'object') {
        return {};
    }

    const data = error.response.data;
    const fieldErrors = {};

    // Check standard fields
    ['email', 'password', 'name', 'phone_number', 'non_field_errors', 'detail'].forEach(field => {
        if (data[field]) {
            if (Array.isArray(data[field])) {
                fieldErrors[field] = data[field][0];
            } else if (typeof data[field] === 'string') {
                fieldErrors[field] = data[field];
            }
        }
    });

    // Also scan for any other keys just in case
    Object.keys(data).forEach(key => {
        if (!fieldErrors[key]) {
            if (Array.isArray(data[key])) {
                fieldErrors[key] = data[key][0];
            } else if (typeof data[key] === 'string') {
                fieldErrors[key] = data[key];
            }
        }
    });

    return fieldErrors;
};

export const validateRegistration = (formData) => {
    const errors = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }
    // Add other checks as needed
    return errors;
};
