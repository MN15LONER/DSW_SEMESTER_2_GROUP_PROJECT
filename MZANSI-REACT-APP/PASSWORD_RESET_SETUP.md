# Password Reset - Quick Setup Guide

## ✅ What's Been Implemented

A complete, secure password reset flow has been added to your Mzansi React app with:

- 🔐 Firebase Authentication integration
- ⏱️ Rate limiting (3 attempts per 15 minutes)
- 🛡️ Email enumeration prevention
- 📊 Security logging to Firestore
- 💪 Strong password validation
- 🎨 Beautiful UI matching your app design

## 📁 Files Created

1. **`src/services/passwordResetService.js`** - Core password reset logic
2. **`src/screens/auth/ForgotPasswordScreen.js`** - User interface
3. **`PASSWORD_RESET_DOCUMENTATION.md`** - Comprehensive documentation
4. **`PASSWORD_RESET_SETUP.md`** - This setup guide

## 📝 Files Modified

1. **`src/context/AuthContext.js`** - Added `requestPasswordReset` method
2. **`src/screens/auth/LoginScreen.js`** - "Forgot Password" now navigates to reset screen
3. **`src/navigation/AuthStack.js`** - Added ForgotPassword route

## 🚀 Setup Steps

### Step 1: Restart Your Expo Server

The new files need to be loaded:

```bash
# Stop current server (Ctrl+C)
# Then restart
npx expo start --clear
```

### Step 2: Configure Firebase (If Not Already Done)

The password reset uses Firebase's built-in functionality. Ensure Firebase is properly configured:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mzansi-react**
3. Navigate to **Authentication** → **Sign-in method**
4. Ensure **Email/Password** provider is enabled

### Step 2.5: Verify Authorized Domains

Ensure the Firebase hosting domain is authorized:

1. In Firebase Console, go to **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Verify `mzansi-react.firebaseapp.com` is in the list
4. If not, click **Add domain** and add it

### Step 3: (Optional) Customize Email Template

Firebase sends a default password reset email. To customize it:

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click on **Password reset** template
3. Customize:
   - Subject line
   - Email body text
   - Sender name
   - Reply-to address
4. Click **Save**

### Step 4: Test the Flow

1. Open your app in Expo Go
2. Navigate to the Login screen
3. Tap **"Forgot Password?"**
4. Enter a registered email address
5. Tap **"Send Reset Link"**
6. Check your email inbox (and spam folder)
7. Click the reset link in the email
8. Enter a new password
9. Verify you can log in with the new password

## 🔒 Security Features

### 1. Rate Limiting
- **Max 3 attempts per email per 15 minutes**
- Prevents brute force attacks
- Clear error message shows time remaining

### 2. Email Enumeration Prevention
- **Generic success messages**
- Doesn't reveal if email exists
- Same response for all cases

### 3. Security Logging
- **All requests logged to Firestore**
- Collection: `security_logs`
- Includes: email, status, timestamp, reason
- Useful for monitoring suspicious activity

### 4. Strong Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 5. Token Security (Firebase Handles)
- Time-limited (1 hour expiration)
- One-time use (invalidated after reset)
- Cryptographically secure
- Automatic verification

## 🎯 User Flow

```
Login Screen
    ↓
Tap "Forgot Password?"
    ↓
Enter Email
    ↓
Tap "Send Reset Link"
    ↓
See Success Message
    ↓
Check Email
    ↓
Click Reset Link
    ↓
Enter New Password
    ↓
Password Reset Complete
    ↓
Log In with New Password
```

## 📊 Monitoring

### View Security Logs in Firestore

1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. Look for `security_logs` collection
4. Each document contains:
   ```javascript
   {
     type: 'password_reset_request',
     email: 'user@example.com',
     status: 'success' | 'failed' | 'rate_limited',
     reason: 'Additional context',
     timestamp: '2025-10-01T00:00:00.000Z',
     userAgent: 'Expo Mobile App'
   }
   ```

### What to Monitor

- **Sudden spikes** in reset requests (possible attack)
- **High failure rates** (configuration issues or attacks)
- **Multiple requests** for same email (suspicious activity)
- **Rate limited requests** (abuse attempts)

## ⚙️ Configuration

### Adjust Rate Limiting

Edit `src/services/passwordResetService.js`:

```javascript
// Line 11-12
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // Change to desired minutes
const MAX_RESET_ATTEMPTS = 3; // Change to desired max attempts
```

### Adjust Password Rules

Edit `src/services/passwordResetService.js`:

```javascript
// Line 18-24
const PASSWORD_RULES = {
  minLength: 8,                // Change minimum length
  requireUppercase: true,      // Set to false to disable
  requireLowercase: true,      // Set to false to disable
  requireNumber: true,         // Set to false to disable
  requireSpecialChar: true,    // Set to false to disable
};
```

## 🧪 Testing Checklist

- [ ] Navigate to Forgot Password screen
- [ ] Submit with empty email (should show validation error)
- [ ] Submit with invalid email format (should show validation error)
- [ ] Submit with valid email (should show success message)
- [ ] Check email inbox for reset link
- [ ] Click reset link (should open in browser)
- [ ] Enter weak password (should show validation errors)
- [ ] Enter strong password (should succeed)
- [ ] Log in with new password (should work)
- [ ] Try to use reset link again (should show "already used" error)
- [ ] Request reset 4 times quickly (4th should be rate limited)

## 🚨 Troubleshooting

### Email Not Received

**⚠️ IMPORTANT: Check your spam/junk folder first!** Password reset emails from Firebase often end up in spam.

**Check**:
1. **Spam/junk folder** (most common location)
2. Email address is correct
3. Wait a few minutes (emails can be delayed)
4. Firebase email quota not exceeded
5. Email provider not blocking Firebase emails

**Solution**: 
- Check spam folder thoroughly
- If still not received after 5 minutes, request a new reset link

### Rate Limit Too Strict

**Symptom**: Users blocked after few attempts

**Solution**: 
- Increase `MAX_RESET_ATTEMPTS` in `passwordResetService.js`
- Or decrease `RATE_LIMIT_WINDOW`

### Password Validation Too Strict

**Symptom**: Users can't create valid passwords

**Solution**: Adjust `PASSWORD_RULES` in `passwordResetService.js`

### "Network Error" Message

**Symptom**: Can't send reset email

**Solution**:
- Check internet connection
- Verify Firebase is accessible
- Check Firebase project status

## 📚 Documentation

For detailed information, see:
- **`PASSWORD_RESET_DOCUMENTATION.md`** - Complete technical documentation
- **Firebase Auth Docs**: https://firebase.google.com/docs/auth

## ✨ Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Password Reset Email | ✅ | Firebase sends secure, time-limited link |
| Rate Limiting | ✅ | 3 attempts per 15 minutes per email |
| Email Enumeration Prevention | ✅ | Generic messages for all cases |
| Security Logging | ✅ | All requests logged to Firestore |
| Password Validation | ✅ | Strong password requirements enforced |
| Token Expiration | ✅ | Links expire after 1 hour |
| One-Time Use | ✅ | Tokens invalidated after use |
| Error Handling | ✅ | Comprehensive error messages |
| Beautiful UI | ✅ | Matches app design system |
| Help Text | ✅ | Clear instructions for users |

## 🎉 You're All Set!

The password reset flow is now fully functional and production-ready. Users can securely reset their passwords with:

- ✅ Time-limited, one-time use reset links
- ✅ Rate limiting to prevent abuse
- ✅ Strong password requirements
- ✅ Security monitoring and logging
- ✅ Clear error handling and user guidance

Test the flow and monitor the security logs to ensure everything works as expected!
