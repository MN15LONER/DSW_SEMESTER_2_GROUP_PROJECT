/**
 * Password Reset Service
 * 
 * Handles secure password reset functionality using Firebase Authentication.
 * Includes rate limiting, security logging, and strong password validation.
 */

import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_RESET_ATTEMPTS = 3; // Maximum attempts per window
const RATE_LIMIT_KEY = 'password_reset_attempts';

/**
 * Password validation rules
 */
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with success status and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { success: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

/**
 * Check if rate limit has been exceeded
 * @param {string} email - User's email
 * @returns {Promise<Object>} Rate limit status
 */
const checkRateLimit = async (email) => {
  try {
    const attemptsData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : {};
    
    const userAttempts = attempts[email] || [];
    const now = Date.now();
    
    // Filter out attempts outside the rate limit window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    if (recentAttempts.length >= MAX_RESET_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts);
      const timeUntilReset = RATE_LIMIT_WINDOW - (now - oldestAttempt);
      const minutesRemaining = Math.ceil(timeUntilReset / 60000);

      return {
        allowed: false,
        message: `Too many password reset attempts. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow the request if rate limit check fails
    return { allowed: true };
  }
};

/**
 * Record a password reset attempt
 * @param {string} email - User's email
 */
const recordAttempt = async (email) => {
  try {
    const attemptsData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : {};
    
    const userAttempts = attempts[email] || [];
    const now = Date.now();
    
    // Add current attempt and filter old ones
    const recentAttempts = [...userAttempts, now].filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    attempts[email] = recentAttempts;
    await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Error recording attempt:', error);
  }
};

/**
 * Log password reset request for security monitoring
 * @param {string} email - User's email
 * @param {string} status - Request status (success/failed)
 * @param {string} reason - Additional information
 */
const logPasswordResetRequest = async (email, status, reason = '') => {
  try {
    const logsRef = collection(db, 'security_logs');
    await addDoc(logsRef, {
      type: 'password_reset_request',
      email,
      status,
      reason,
      timestamp: new Date().toISOString(),
      userAgent: 'Expo Mobile App',
    });
  } catch (error) {
    // Don't fail the operation if logging fails
    console.error('Error logging password reset request:', error);
  }
};

/**
 * Send password reset email
 * 
 * Security features:
 * - Rate limiting to prevent abuse
 * - Generic success message to prevent email enumeration
 * - Security logging for monitoring
 * - Time-limited reset links (handled by Firebase)
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Result with success status and message
 */
export const sendPasswordReset = async (email) => {
  try {
    // Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      await logPasswordResetRequest(normalizedEmail, 'rate_limited', rateLimitCheck.message);
      return {
        success: false,
        error: rateLimitCheck.message,
      };
    }

    // Record this attempt
    await recordAttempt(normalizedEmail);

    // Send password reset email via Firebase
    // Firebase automatically handles:
    // - Token generation (secure, time-limited)
    // - Email delivery with reset link
    // - Token expiration (default: 1 hour)
    await sendPasswordResetEmail(auth, normalizedEmail, {
      // Custom action code settings
      // Use Firebase-authorized domain to avoid "Domain not allowlisted" error
      url: 'https://mzansi-react.firebaseapp.com/reset-password',
      // Handle code in app for secure in-app password reset
      handleCodeInApp: true,
    });

    // Log successful request
    await logPasswordResetRequest(normalizedEmail, 'success');

    // Return generic success message (don't reveal if email exists)
    // This prevents email enumeration attacks
    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions shortly.',
    };

  } catch (error) {
    console.error('Password reset error:', error);

    // Log failed request
    await logPasswordResetRequest(email, 'failed', error.code);

    // Handle specific Firebase errors
    let errorMessage = 'Failed to send password reset email. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        // Don't reveal that user doesn't exist (prevent enumeration)
        errorMessage = 'If an account exists with this email, you will receive password reset instructions shortly.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Verify password reset code
 * 
 * Checks if the reset code is valid and not expired.
 * 
 * @param {string} code - Password reset code from email link
 * @returns {Promise<Object>} Verification result with email if valid
 */
export const verifyResetCode = async (code) => {
  try {
    if (!code) {
      return {
        success: false,
        error: 'Invalid reset code',
      };
    }

    // Verify the code and get the email
    const email = await verifyPasswordResetCode(auth, code);

    return {
      success: true,
      email,
    };

  } catch (error) {
    console.error('Reset code verification error:', error);

    let errorMessage = 'Invalid or expired reset link.';

    switch (error.code) {
      case 'auth/expired-action-code':
        errorMessage = 'This reset link has expired. Please request a new one.';
        break;
      case 'auth/invalid-action-code':
        errorMessage = 'This reset link is invalid or has already been used.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found for this reset link.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Reset password with code
 * 
 * Completes the password reset process with a new password.
 * The code is automatically invalidated after successful reset.
 * 
 * @param {string} code - Password reset code from email link
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset result
 */
export const resetPassword = async (code, newPassword) => {
  try {
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.success) {
      return {
        success: false,
        error: passwordValidation.errors[0], // Return first error
        errors: passwordValidation.errors,
      };
    }

    // Verify code is still valid
    const verification = await verifyResetCode(code);
    if (!verification.success) {
      return verification;
    }

    // Reset the password
    // Firebase automatically invalidates the code after successful reset
    await confirmPasswordReset(auth, code, newPassword);

    // Log successful password reset
    await logPasswordResetRequest(verification.email, 'password_reset_completed');

    return {
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    };

  } catch (error) {
    console.error('Password reset error:', error);

    let errorMessage = 'Failed to reset password. Please try again.';

    switch (error.code) {
      case 'auth/expired-action-code':
        errorMessage = 'This reset link has expired. Please request a new one.';
        break;
      case 'auth/invalid-action-code':
        errorMessage = 'This reset link is invalid or has already been used.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Get recent password reset attempts for monitoring
 * @param {string} email - User's email
 * @returns {Promise<number>} Number of recent attempts
 */
export const getRecentAttempts = async (email) => {
  try {
    const attemptsData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : {};
    
    const userAttempts = attempts[email] || [];
    const now = Date.now();
    
    return userAttempts.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    ).length;
  } catch (error) {
    console.error('Error getting recent attempts:', error);
    return 0;
  }
};
