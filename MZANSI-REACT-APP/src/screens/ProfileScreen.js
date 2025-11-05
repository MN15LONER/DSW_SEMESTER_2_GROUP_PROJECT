import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert, TouchableOpacity, Image } from 'react-native';
import { List, Divider, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import { firebaseService, auth } from '../services/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserProfile, deleteAccount } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return user?.email?.split('@')[0] || 'User';
  };

 
  const pickImage = async () => {

    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const camPerm = await ImagePicker.requestCameraPermissionsAsync();
              if (camPerm.granted === false) {
                Alert.alert('Permission Required', 'Permission to access the camera is required!');
                return;
              }

              const cameraResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!cameraResult.canceled && cameraResult.assets[0]) {
                await uploadProfilePicture(cameraResult.assets[0].uri);
              }
            } catch (error) {
              console.error('Error taking photo:', error);
              Alert.alert('Error', 'Failed to take photo. Please try again.');
            }
          }
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                await uploadProfilePicture(result.assets[0].uri);
              }
            } catch (error) {
              console.error('Error picking image:', error);
              Alert.alert('Error', 'Failed to pick image. Please try again.');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setIsUploading(true);

      if (!user?.uid) {
        throw new Error('No logged-in user');
      }

      const downloadUrl = await firebaseService.users.uploadProfilePicture(user.uid, imageUri);
      if (!downloadUrl) {
        throw new Error('Failed to upload image to storage');
      }


      const updateResult = await updateUserProfile({ photoURL: downloadUrl });

      try {
        await updateProfile(auth.currentUser, { photoURL: downloadUrl });
      } catch (err) {
        console.warn('Could not update Firebase Auth profile photoURL:', err);
      }

      if (updateResult.success) {
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', updateResult.error || 'Failed to update profile picture in profile.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

 
  const deleteProfilePicture = () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploading(true);
              const result = await updateUserProfile({ photoURL: '' });
              
              if (result.success) {
                Alert.alert('Success', 'Profile picture deleted successfully!');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete profile picture.');
              }
            } catch (error) {
              console.error('Error deleting profile picture:', error);
              Alert.alert('Error', 'Failed to delete profile picture. Please try again.');
            } finally {
              setIsUploading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for extra safety
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and all associated data. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsUploading(true);
                      const result = await deleteAccount();
                      
                      if (result.success) {
                        Alert.alert(
                          'Account Deleted',
                          'Your account has been permanently deleted.',
                          [{ text: 'OK' }]
                        );
                        
                      } else {
                        Alert.alert('Error', result.error || 'Failed to delete account. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    const email = 'trellis973@gmail.com';
    const subject = 'Mzansi App Support Request';
    const body = `Hello Mzansi Support Team,

I need assistance with the following:

[Please describe your issue here]

User: ${getDisplayName()}
Email: ${user?.email || 'Not provided'}

Thank you for your help!`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please contact our support team at: ${email}`,
            [
              {
                text: 'Copy Email',
                onPress: () => {
                  // Note: Clipboard functionality would require expo-clipboard
                  Alert.alert('Support Email', email);
                }
              },
              { text: 'OK' }
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert(
          'Contact Support',
          `Please email us at: ${email}`,
          [{ text: 'OK' }]
        );
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
          )}
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={pickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="camera" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
          {user?.photoURL && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={deleteProfilePicture}
              disabled={isUploading}
            >
              <Ionicons name="trash" size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.userName}>{getDisplayName()}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
      </View>

      <View style={styles.menuSection}>
        <List.Item
          title="Order History"
          description="View your past orders"
          left={(props) => <List.Icon {...props} icon="history" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('OrderHistory')}
        />
        <List.Item
          title="Edit Profile"
          description="Change your name, email, password, and phone"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="Favorites"
          description="Your favorite products"
          left={(props) => <List.Icon {...props} icon="heart" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Favorites')}
        />
        
        <Divider />
        
        <List.Item
          title="Delivery Address"
          description="Manage your delivery locations"
          left={props => <List.Icon {...props} icon="map-marker" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('DeliveryAddress')}
        />
        
        <Divider />
        
        <List.Item
          title="Payment Methods"
          description="Manage your payment options"
          left={props => <List.Icon {...props} icon="credit-card" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('PaymentMethods')}
        />
        
        <Divider />
        
        <List.Item
          title="Notifications"
          description="Manage your notification preferences"
          left={props => <List.Icon {...props} icon="bell" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        
        <Divider />
        
        <List.Item
          title="API Test"
          description="Test Google Places & Unsplash APIs"
          left={(props) => <List.Icon {...props} icon="api" color="#4CAF50" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ApiTest')}
        />
        
        <List.Item
          title="Help & Support"
          description="Get help with your orders"
          left={props => <List.Icon {...props} icon="help-circle" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleContactSupport}
        />

        <Divider />

        <List.Item
          title="Sign Out"
          description="Log out of your account"
          titleStyle={{ color: COLORS.error, fontWeight: '600' }}
          left={props => <List.Icon {...props} icon="logout" color={COLORS.error} />}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await logout();
                    if (!result?.success) {
                      Alert.alert('Logout Failed', result?.error || 'Please try again.');
                    }
                    
                  }
                }
              ]
            );
          }}
        />

        <Divider />

        <List.Item
          title="Delete Account"
          description="Permanently delete your account and all data"
          titleStyle={{ color: '#d32f2f', fontWeight: '600' }}
          left={props => <List.Icon {...props} icon="account-remove" color="#d32f2f" />}
          onPress={handleDeleteAccount}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray,
  },
  menuSection: {
    backgroundColor: COLORS.white,
  },
});