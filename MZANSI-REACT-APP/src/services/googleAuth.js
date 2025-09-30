
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// This is required for the browser to close properly after authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Sign-In Configuration
 * Using Web Client ID with Expo AuthSession proxy for universal compatibility
 */
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Redirect URI Configuration
 * Uses Expo's AuthSession proxy to ensure compatibility across:
 * - Expo Go (development)
 * - Standalone builds (production)
 * 
 * The proxy redirect URI resolves to: https://auth.expo.io/@mn15loner/mzansi-react
 * This must be added to Firebase Console > Authentication > Google provider > Authorized redirect URIs
 */
const redirectUri = makeRedirectUri({
  useProxy: true,
});

/**
 * Hook to manage Google authentication flow
 * 
 * Configuration:
 * - Uses only Web Client ID (no platform-specific client IDs)
 * - Always uses Expo AuthSession proxy for redirect handling
 * - Forces account selection prompt on every sign-in
 * - Redirect URI: https://auth.expo.io/@mn15loner/mzansi-react
 * 
 * @returns {Object} Authentication request, response, and prompt function
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      // Use only the Web Client ID from Google Cloud Console
      clientId: GOOGLE_WEB_CLIENT_ID,
      // Force Google account chooser to appear every time
      // This ensures users can select which account to use, even if already signed in
      prompt: 'select_account',
    },
    {
      // Always use Expo's AuthSession proxy - never use exp:// redirects
      useProxy: true,
      // Explicitly set the redirect URI to prevent fallback to exp:// URIs
      redirectUri: redirectUri,
    }
  );

  return { request, response, promptAsync };
};

/**
 * Sign in with Google using Firebase Authentication
 * 
 * This function:
 * 1. Prompts the user to sign in with Google
 * 2. Exchanges the Google token for Firebase credentials
 * 3. Signs the user into Firebase
 * 4. Returns the Firebase user object
 * 
 * @param {Function} promptAsync - The prompt function from useGoogleAuth hook
 * @returns {Promise<Object>} Result object with success status and user/error
 */
export const signInWithGoogle = async (promptAsync) => {
  try {
    // Check if Web Client ID is configured
    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new Error(
        'Google Web Client ID is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      );
    }

    // Prompt user to sign in with Google
    const result = await promptAsync();

    // Handle different response types
    if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Sign-in was cancelled',
        cancelled: true
      };
    }

    if (result.type !== 'success') {
      return {
        success: false,
        error: 'Failed to sign in with Google. Please try again.'
      };
    }

    // Get the ID token from Google
    const { id_token } = result.params;

    if (!id_token) {
      throw new Error('No ID token received from Google');
    }

    // Create Firebase credential with Google ID token
    const credential = GoogleAuthProvider.credential(id_token);

    // Sign in to Firebase with the Google credential
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // Return success with user data
    return {
      success: true,
      user: firebaseUser,
      isNewUser: userCredential.additionalUserInfo?.isNewUser || false
    };

  } catch (error) {
    console.error('Google Sign-In Error:', error);

    // Handle specific error cases
    let errorMessage = 'Failed to sign in with Google. Please try again.';

    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid credentials. Please try again.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled. Please contact support.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Validate Google authentication configuration
 * @returns {boolean} True if configuration is valid
 */
export const isGoogleAuthConfigured = () => {
  return !!GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID !== 'your_google_web_client_id_here';
};

/**
 * Get the redirect URI being used for Google authentication
 * Useful for debugging and verifying the correct URI is configured in Firebase
 * @returns {string} The redirect URI
 */
export const getRedirectUri = () => {
  return redirectUri;
};

// Log the redirect URI on module load for debugging
console.log('🔗 Google Auth Redirect URI:', redirectUri);
console.log('📝 Add this URI to Firebase Console > Authentication > Google > Authorized redirect URIs');
