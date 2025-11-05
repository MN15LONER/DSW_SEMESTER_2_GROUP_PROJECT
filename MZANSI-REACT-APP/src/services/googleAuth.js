
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

const redirectUri = 'https://auth.expo.io/@mn15loner/mzansi-react';

export const useGoogleAuth = () => {

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      prompt: 'select_account',
      responseType: 'id_token',
      scopes: ['openid', 'profile', 'email'],
    },
    {
      useProxy: true,
      redirectUri: redirectUri,
    }
  );

  return { request, response, promptAsync };
};

export const signInWithGoogle = async (promptAsync) => {
  try {

    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new Error(
        'Google Web Client ID is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      );
    }

    const result = await promptAsync();

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

    const idToken = result.params?.id_token || result.authentication?.idToken || result.authentication?.id_token;

    if (!idToken) {
      console.error('Full response object:', result);
      throw new Error('No ID token received from Google. Make sure responseType: "id_token" is set and the Web Client ID is correct.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    return {
      success: true,
      user: firebaseUser,
      isNewUser: userCredential.additionalUserInfo?.isNewUser || false
    };

  } catch (error) {
    console.error('Google Sign-In Error:', error);

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

export const isGoogleAuthConfigured = () => {
  return !!GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID !== 'your_google_web_client_id_here';
};

export const getRedirectUri = () => {
  return redirectUri;
};

console.log('🔗 Google Auth Redirect URI:', redirectUri);
console.log('📝 Add this URI to Firebase Console > Authentication > Google > Authorized redirect URIs');