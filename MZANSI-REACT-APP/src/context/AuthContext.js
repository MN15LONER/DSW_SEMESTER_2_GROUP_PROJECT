import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { firebaseService } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle } from '../services/googleAuth';
import { sendPasswordReset } from '../services/passwordResetService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Load user from AsyncStorage first for faster startup
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };

    loadStoredUser();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore using doc/getDoc
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          const userData = snap && snap.exists() ? snap.data() : null;

          const combinedProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            ...userData
          };

          // Keep backward-compatible `user` shape (combined fields)
          setUser(combinedProfile);
          // Expose Firestore-only profile separately
          setUserProfile(userData);
          await AsyncStorage.setItem('user', JSON.stringify(combinedProfile));
        } else {
          setUser(null);
          setUserProfile(null);
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // Fallback to stored user if Firebase fails
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser && !firebaseUser) {
            // Keep stored user if Firebase is offline but we had a user
            setUser(JSON.parse(storedUser));
          }
        } catch (storageError) {
          console.error('Error accessing stored user:', storageError);
        }
      } finally {
        if (initializing) {
          setInitializing(false);
        }
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [initializing]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      if (userData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: userData.displayName
        });
      }

      // Save additional user data to Firestore
      const userProfile = {
        email: firebaseUser.email,
        displayName: userData.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        createdAt: new Date().toISOString()
      };

      await firebaseService.users.create(firebaseUser.uid, userProfile);
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Failed to logout. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      setLoading(true);
      await firebaseService.users.update(user.uid, updatedData);
      
      // Update local user state
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google Sign-In
   * Handles authentication with Google and creates user profile if new user
   * @param {Function} promptAsync - The Google auth prompt function
   * @returns {Promise<Object>} Result object with success status
   */
  const loginWithGoogle = async (promptAsync) => {
    try {
      setLoading(true);
      
      // Sign in with Google
      const result = await signInWithGoogle(promptAsync);
      
      if (!result.success) {
        return result;
      }

      const firebaseUser = result.user;
      const isNewUser = result.isNewUser;

      // If this is a new user, create their profile in Firestore
      if (isNewUser) {
        const userProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          photoURL: firebaseUser.photoURL || '',
          authProvider: 'google',
          createdAt: new Date().toISOString()
        };

        await firebaseService.users.create(firebaseUser.uid, userProfile);
      }

      // The user state will be updated by the onAuthStateChanged listener
      return { success: true, user: firebaseUser };
      
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request Password Reset
   * Sends a password reset email to the user
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Result object with success status
   */
  const requestPasswordReset = async (email) => {
    try {
      const result = await sendPasswordReset(email);
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'Failed to send password reset email. Please try again.',
      };
    }
  };

  const isAdmin = userProfile?.role === 'admin' || user?.role === 'admin';
  useEffect(() => {
  console.log('AuthContext role check:', {
    userProfile,
    user,
    isAdmin,
  });
}, [userProfile, user]);


  /**
   * Delete User Account
   * Permanently deletes the user's account and all associated data
   * @returns {Promise<Object>} Result object with success status
   */
  const deleteAccount = async () => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      setLoading(true);
      
      // Delete user data from Firestore first
      try {
        await firebaseService.users.delete(user.uid);
      } catch (error) {
        console.error('Error deleting user data from Firestore:', error);
        // Continue with Firebase Auth deletion even if Firestore deletion fails
      }
      
      // Delete the Firebase Auth user
      await deleteUser(auth.currentUser);
      
      // Clear local state and storage
      setUser(null);
      await AsyncStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      let errorMessage = 'Failed to delete account. Please try again.';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'For security reasons, you need to sign in again before deleting your account.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User account not found.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    initializing,
    login,
    register,
    logout,
    updateUserProfile,
    loginWithGoogle,
    requestPasswordReset,
    deleteAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
