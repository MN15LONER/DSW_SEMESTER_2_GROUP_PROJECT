import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, ActivityIndicator, HelperText, Title } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { auth, firebaseService } from '../services/firebase';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { COLORS } from '../styles/colors';
export default function EditProfileScreen({ navigation }) {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const passwordsMatch = !newPassword || newPassword === confirmPassword;
  const requireReauth = (originalEmail, newEmail, newPassword) => {
    return (newEmail && newEmail !== originalEmail) || !!newPassword;
  };
  const handleSave = async () => {
    if (!user) return;
    if (!passwordsMatch) {
      Alert.alert('Validation', 'New passwords do not match');
      return;
    }
    setSaving(true);
    const authUser = auth.currentUser;
    const updates = {};
    try {
      if (requireReauth(user.email, email, newPassword)) {
        if (!currentPassword) {
          throw new Error('Please enter your current password to change email or password');
        }
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(authUser, credential);
      }
      if (displayName !== user.displayName) {
        try {
          await updateProfile(authUser, { displayName });
          updates.displayName = displayName;
        } catch (err) {
          console.error('Failed to update displayName in Auth:', err);
          throw err;
        }
      }
      if (email !== user.email) {
        try {
          await updateEmail(authUser, email);
          updates.email = email;
        } catch (err) {
          console.error('Failed to update email in Auth:', err);
          throw err;
        }
      }
      if (newPassword) {
        try {
          await updatePassword(authUser, newPassword);
        } catch (err) {
          console.error('Failed to update password in Auth:', err);
          throw err;
        }
      }
      if (phone !== user.phone) {
        updates.phone = phone;
      }
      if (Object.keys(updates).length > 0) {
        const success = await firebaseService.users.update(user.uid, updates);
        if (!success) {
          throw new Error('Failed to update user profile in database');
        }
        await updateUserProfile(updates);
      }
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('EditProfile save error:', error);
      let message = error?.message || 'Failed to update profile. Please try again.';
      if (error?.code === 'auth/requires-recent-login') {
        message = 'For security reasons, please sign in again and then try changing your email or password.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/email-already-in-use') {
        message = 'This email is already in use by another account.';
      } else if (error?.code === 'auth/wrong-password') {
        message = 'Current password is incorrect.';
      }
      Alert.alert('Update Failed', message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Title style={styles.title}>Edit Profile</Title>
        <TextInput
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
        />
        <HelperText type="info">If you want to change email or password, enter your current password below.</HelperText>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        {!passwordsMatch && <HelperText type="error">Passwords do not match</HelperText>}
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={saving || (!displayName && !email && !phone && !newPassword)}
          style={styles.saveButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          {saving ? <ActivityIndicator animating color={COLORS.white} /> : 'Save Changes'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    marginBottom: 12
  },
  input: {
    marginBottom: 12
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary
  }
});