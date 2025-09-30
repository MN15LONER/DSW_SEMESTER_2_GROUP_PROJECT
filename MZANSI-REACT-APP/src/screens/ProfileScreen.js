import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { List, Divider, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  // Get display name - prefer displayName, fallback to firstName + lastName, then email
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return user?.email?.split('@')[0] || 'User';
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
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
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
                    // Navigation will switch automatically via isAuthenticated in AppNavigator
                  }
                }
              ]
            );
          }}
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
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: 16,
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