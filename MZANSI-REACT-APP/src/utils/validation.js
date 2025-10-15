// Form validation utilities
export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },

  // Phone number validation (South African format)
  phone: (phone) => {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    if (!phone) return 'Phone number is required';
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid South African phone number';
    return null;
  },

  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, minLength, fieldName = 'This field') => {
    if (!value) return null; // Let required validator handle empty values
    if (value.toString().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, maxLength, fieldName = 'This field') => {
    if (!value) return null;
    if (value.toString().length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
    }
    return null;
  },

  // Address validation
  address: (address) => {
    if (!address) return 'Address is required';
    if (address.trim().length < 10) return 'Please enter a complete address';
    if (address.trim().length > 200) return 'Address is too long';
    return null;
  },

  // Name validation
  name: (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    if (!nameRegex.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return null;
  },

  // Postal code validation (South African format)
  postalCode: (code) => {
    const postalRegex = /^[0-9]{4}$/;
    if (!code) return 'Postal code is required';
    if (!postalRegex.test(code)) return 'Please enter a valid 4-digit postal code';
    return null;
  },

  // Special instructions validation
  specialInstructions: (instructions) => {
    if (!instructions) return null; // Optional field
    if (instructions.length > 500) return 'Special instructions must be less than 500 characters';
    return null;
  }
};

// Input sanitization utilities
export const sanitizers = {
  // Remove HTML tags and dangerous characters
  text: (input) => {
    if (!input) return '';
    return input
      .toString()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining angle brackets
      .trim();
  },

  // Sanitize email
  email: (email) => {
    if (!email) return '';
    return email.toString().toLowerCase().trim();
  },

  // Sanitize phone number
  phone: (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[^\d+]/g, '');
  },

  // Sanitize name (capitalize first letters)
  name: (name) => {
    if (!name) return '';
    return name
      .toString()
      .trim()
      .replace(/[<>]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  // Sanitize address
  address: (address) => {
    if (!address) return '';
    return address
      .toString()
      .trim()
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  },

  // Sanitize postal code
  postalCode: (code) => {
    if (!code) return '';
    return code.toString().replace(/\D/g, ''); // Keep only digits
  }
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

// Sanitize form data
export const sanitizeFormData = (formData, sanitizationRules) => {
  const sanitizedData = { ...formData };

  Object.keys(sanitizationRules).forEach(field => {
    const sanitizer = sanitizationRules[field];
    if (sanitizedData[field] !== undefined) {
      sanitizedData[field] = sanitizer(sanitizedData[field]);
    }
  });

  return sanitizedData;
};
