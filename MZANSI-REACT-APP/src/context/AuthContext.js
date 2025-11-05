import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
import { Platform, AppState } from 'react-native';
import AsyncStoragePackage from '@react-native-async-storage/async-storage';
let AsyncStorage = AsyncStoragePackage;

if (Platform.OS === 'web') {
  import('@react-native-async-storage/async-storage').then(module => {
    AsyncStorage = module.default;
  }).catch(error => {
    console.error('Error loading AsyncStorage for web:', error);
  });
}
import { signInWithGoogle } from '../services/googleAuth';
import { sendPasswordReset } from '../services/passwordResetService';

const SESSION_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours
const SESSION_KEYS = {
  LAST_ACTIVITY: 'session_last_activity',
  SESSION_START: 'session_start_time'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const currentUserRef = useRef(null);

  const inactivityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          setUser(prev => (prev && prev.uid === parsed.uid ? prev : parsed));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };

    loadStoredUser();
  }, []);

  const updateLastActivity = async () => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      await AsyncStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, now.toString());
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  };

  const checkSessionValidity = async () => {
    try {
      const lastActivityStr = await AsyncStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const now = Date.now();
        if (now - lastActivity > SESSION_TIMEOUT) {
          console.log('Session expired, logging out...');
          await autoLogout();
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return true; // Default to valid if error
    }
  };

  const autoLogout = async () => {
    try {
      console.log('Auto-logging out due to inactivity...');
      setUser(null);
      setUserProfile(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem(SESSION_KEYS.LAST_ACTIVITY);
      await AsyncStorage.removeItem(SESSION_KEYS.SESSION_START);
      await signOut(auth);
    } catch (error) {
      console.error('Error during auto logout:', error);
    }
  };

  const startInactivityTimer = () => {

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(async () => {
      console.log('Inactivity timeout reached');
      await checkSessionValidity();

      startInactivityTimer();
    }, SESSION_TIMEOUT);
  };

  const resetInactivityTimer = () => {
    updateLastActivity();
    startInactivityTimer();
  };

  const initializeSession = async () => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      await AsyncStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, now.toString());
      await AsyncStorage.setItem(SESSION_KEYS.SESSION_START, now.toString());
    } catch (error) {
      console.error('Error initializing session:', error);
    }
    startInactivityTimer();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && user) {

        const isValid = await checkSessionValidity();
        if (isValid) {
          resetInactivityTimer();
        }
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      initializeSession();
    } else {

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Auth state changed - firebaseUser:', firebaseUser?.uid);
        if (firebaseUser) {

          if (!currentUserRef.current || currentUserRef.current.uid !== firebaseUser.uid) {
            console.log('Fetching user data from Firestore for:', firebaseUser.uid);

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(userDocRef);
            const userData = snap && snap.exists() ? snap.data() : null;

            if (userData) {
              const combinedProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                ...userData
              };

              console.log('Setting user profile:', combinedProfile);

              setUser(combinedProfile);
              setUserProfile(userData);
              await AsyncStorage.setItem('user', JSON.stringify(combinedProfile));
            } else {
              console.log('No user data found in Firestore');
              setUser(null);
              setUserProfile(null);
              await AsyncStorage.removeItem('user');
            }
          }
        } else {
          console.log('No firebase user - setting user to null');
          setUser(null);
          setUserProfile(null);
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth state change error:', error);

        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser && !firebaseUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (storageError) {
          console.error('Error accessing stored user:', storageError);
        }
      } finally {

        setInitializing(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email);
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('Firebase auth successful, fetching user data...');

      const userData = await firebaseService.users.get(userCredential.user.uid);
      console.log('User data from Firestore:', userData);

      if (!userData) {
        console.error('No user data found in Firestore for:', userCredential.user.uid);
        return { success: false, error: 'User profile not found. Please contact support.' };
      }

      const userProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        ...userData
      };

      console.log('Complete user profile:', userProfile);
      console.log('User type:', userProfile.userType);

      setUser(userProfile);
      await AsyncStorage.setItem('user', JSON.stringify(userProfile));

      return { success: true, user: userProfile };
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
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
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

      if (userData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: userData.displayName
        });
      }

      const userProfile = {
        email: firebaseUser.email,
        displayName: userData.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        userType: userData.userType || 'customer', // Include userType
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

  const loginWithGoogle = async (promptAsync) => {
    try {
      setLoading(true);

      const result = await signInWithGoogle(promptAsync);

      if (!result.success) {
        return result;
      }

      const firebaseUser = result.user;
      const isNewUser = result.isNewUser;

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
    try {

      console.log('AuthContext role check:', { userProfile, user, isAdmin });
    } catch (e) {}
  }, [userProfile, user, isAdmin]);

  const deleteAccount = async () => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      setLoading(true);

      try {
        await firebaseService.users.delete(user.uid);
      } catch (error) {
        console.error('Error deleting user data from Firestore:', error);

      }

      await deleteUser(auth.currentUser);

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
