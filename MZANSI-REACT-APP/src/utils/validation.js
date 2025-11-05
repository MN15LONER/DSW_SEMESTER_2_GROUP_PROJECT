export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },
  phone: (phone) => {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    if (!phone) return 'Phone number is required';
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid South African phone number';
    return null;
  },
  required: (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },
  minLength: (value, minLength, fieldName = 'This field') => {
    if (!value) return null; 
    if (value.toString().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },
  maxLength: (value, maxLength, fieldName = 'This field') => {
    if (!value) return null;
    if (value.toString().length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
    }
    return null;
  },
  address: (address) => {
    if (!address) return 'Address is required';
    if (address.trim().length < 10) return 'Please enter a complete address';
    if (address.trim().length > 200) return 'Address is too long';
    return null;
  },
  name: (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    if (!nameRegex.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return null;
  },
  postalCode: (code) => {
    const postalRegex = /^[0-9]{4}$/;
    if (!code) return 'Postal code is required';
    if (!postalRegex.test(code)) return 'Please enter a valid 4-digit postal code';
    return null;
  },
  specialInstructions: (instructions) => {
    if (!instructions) return null; 
    if (instructions.length > 500) return 'Special instructions must be less than 500 characters';
    return null;
  }
};
export const sanitizers = {
  text: (input) => {
    if (!input) return '';
    return input
      .toString()
      .replace(/<[^>]*>/g, '') 
      .replace(/[<>]/g, '') 
      .trim();
  },
  email: (email) => {
    if (!email) return '';
    return email.toString().toLowerCase().trim();
  },
  phone: (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[^\d+]/g, '');
  },
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
  address: (address) => {
    if (!address) return '';
    return address
      .toString()
      .trim()
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' '); 
  },
  postalCode: (code) => {
    if (!code) return '';
    return code.toString().replace(/\D/g, ''); 
  }
};
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
        break; 
      }
    }
  });
  return { isValid, errors };
};
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