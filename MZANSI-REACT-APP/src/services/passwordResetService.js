import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; 
const MAX_RESET_ATTEMPTS = 3; 
const RATE_LIMIT_KEY = 'password_reset_attempts';
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};
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
const checkRateLimit = async (email) => {
  try {
    const attemptsData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : {};
    const userAttempts = attempts[email] || [];
    const now = Date.now();
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
    return { allowed: true };
  }
};
const recordAttempt = async (email) => {
  try {
    const attemptsData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : {};
    const userAttempts = attempts[email] || [];
    const now = Date.now();
    const recentAttempts = [...userAttempts, now].filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );
    attempts[email] = recentAttempts;
    await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Error recording attempt:', error);
  }
};
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
    console.error('Error logging password reset request:', error);
  }
};
export const sendPasswordReset = async (email) => {
  try {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitCheck = await checkRateLimit(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      await logPasswordResetRequest(normalizedEmail, 'rate_limited', rateLimitCheck.message);
      return {
        success: false,
        error: rateLimitCheck.message,
      };
    }
    await recordAttempt(normalizedEmail);
    await sendPasswordResetEmail(auth, normalizedEmail, {
      url: 'https:
      handleCodeInApp: true,
    });
    await logPasswordResetRequest(normalizedEmail, 'success');
    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions shortly.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    await logPasswordResetRequest(email, 'failed', error.code);
    let errorMessage = 'Failed to send password reset email. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
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
export const verifyResetCode = async (code) => {
  try {
    if (!code) {
      return {
        success: false,
        error: 'Invalid reset code',
      };
    }
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
export const resetPassword = async (code, newPassword) => {
  try {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.success) {
      return {
        success: false,
        error: passwordValidation.errors[0], 
        errors: passwordValidation.errors,
      };
    }
    const verification = await verifyResetCode(code);
    if (!verification.success) {
      return verification;
    }
    await confirmPasswordReset(auth, code, newPassword);
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