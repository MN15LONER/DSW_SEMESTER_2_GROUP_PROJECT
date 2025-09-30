# Google Sign-In Fix - Authorization Error Resolved

## 🐛 Problem

The Google Sign-In was failing with **"Access blocked: Authorization Error"** due to:

1. **Wrong redirect URI**: Using local `exp://192.x.x.x:8081` instead of Expo proxy
2. **Incorrect client ID configuration**: Passing Web Client ID as `androidClientId` and `iosClientId`

## ✅ Solution Applied

### Changes Made to `src/services/googleAuth.js`

**Before:**
```javascript
Google.useAuthRequest(
  {
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,  // ❌ Wrong
    iosClientId: GOOGLE_WEB_CLIENT_ID,      // ❌ Wrong
  },
  {
    useProxy: true,
    redirectUri: redirectUri,
  }
);
```

**After:**
```javascript
Google.useAuthRequest(
  {
    clientId: GOOGLE_WEB_CLIENT_ID,  // ✅ Correct - single Web Client ID
    prompt: 'select_account',         // ✅ Always show account chooser
  },
  {
    useProxy: true,                   // ✅ Always use Expo proxy
    redirectUri: redirectUri,         // ✅ Explicit redirect URI
  }
);
```

### Key Changes

1. **Removed platform-specific client IDs**
   - Removed `androidClientId` and `iosClientId`
   - Using only `clientId` with the Web Client ID from Google Cloud Console

2. **Added account selection prompt**
   - `prompt: 'select_account'` forces Google account chooser to appear every time
   - Users can select which account to use, even if already signed in
   - Prevents automatic sign-in with cached credentials

3. **Forced Expo proxy redirect**
   - `useProxy: true` ensures Expo AuthSession proxy is always used
   - Explicit `redirectUri` prevents fallback to `exp://` URIs
   - Redirect URI: `https://auth.expo.io/@mn15loner/mzansi-react`

4. **Kept Firebase login flow intact**
   - `GoogleAuthProvider.credential(id_token)` - unchanged
   - `signInWithCredential(auth, credential)` - unchanged
   - All error handling preserved

5. **Console logging maintained**
   - Logs redirect URI on app startup for verification
   - Helps confirm correct configuration

## 🔍 Verification

When you start the app, you should see:
```
🔗 Google Auth Redirect URI: https://auth.expo.io/@mn15loner/mzansi-react
📝 Add this URI to Firebase Console > Authentication > Google > Authorized redirect URIs
```

## 📝 Firebase Configuration Required

Ensure this redirect URI is added to Firebase Console:

1. Go to Firebase Console → Authentication → Sign-in method
2. Click **Google** provider
3. Scroll to **Authorized redirect URIs**
4. Add: `https://auth.expo.io/@mn15loner/mzansi-react`
5. Click **Save**

## 🎯 Why This Works

### Single Client ID
- Google OAuth expects a **single client ID** per request
- Using `clientId` (not `webClientId`, `androidClientId`, `iosClientId`) tells the library to use the Web Client ID for all platforms
- This is the correct approach for Expo Go and Expo AuthSession proxy

### Expo Proxy Redirect
- `useProxy: true` routes the OAuth callback through Expo's servers
- The proxy redirect URI (`https://auth.expo.io/@...`) is stable and works across:
  - Development (Expo Go)
  - Production builds
  - All platforms (iOS, Android, Web)
- Local `exp://` URIs are device-specific and can't be whitelisted in Firebase

### Explicit redirectUri
- Passing `redirectUri` explicitly prevents the library from generating local URIs
- Ensures consistent behavior across all environments

## 🚀 Testing

After this fix:

1. Restart your Expo development server
2. Open the app in Expo Go
3. Navigate to Login screen
4. Tap **Sign in with Google**
5. You should see the Google sign-in page (no authorization error)
6. Complete sign-in
7. You'll be redirected back to the app successfully

## 📊 Expected Flow

```
User taps button
    ↓
App opens browser with Google OAuth
    ↓
User signs in with Google
    ↓
Google redirects to: https://auth.expo.io/@mn15loner/mzansi-react
    ↓
Expo proxy forwards to your app
    ↓
App receives ID token
    ↓
Firebase authenticates user
    ↓
User is logged in ✅
```

## ⚠️ Common Issues

### Still seeing "Authorization Error"
- **Check**: Is the redirect URI added to Firebase Console?
- **Check**: Did you restart the Expo server after changes?
- **Check**: Is the URI exactly `https://auth.expo.io/@mn15loner/mzansi-react`?

### "redirect_uri_mismatch" error
- **Cause**: The redirect URI in Firebase doesn't match
- **Solution**: Copy the exact URI from console logs and add to Firebase

### Browser doesn't redirect back
- **Check**: Is `WebBrowser.maybeCompleteAuthSession()` called? (Yes, it's in the code)
- **Check**: Is the app scheme configured? (Yes, in `app.config.js`)

## 📚 References

- [Expo AuthSession Proxy](https://docs.expo.dev/guides/authentication/#proxy)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase OAuth Providers](https://firebase.google.com/docs/auth/web/google-signin)
