import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List, Divider, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        <Text style={styles.userName}>Mavin Pro</Text>
        <Text style={styles.userEmail}>profoundpro2@email.com</Text>
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
          onPress={() => {}}
        />
        
        <Divider />
        
        <List.Item
          title="Payment Methods"
          description="Manage your payment options"
          left={props => <List.Icon {...props} icon="credit-card" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
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
          title="Help & Support"
          description="Get help with your orders"
          left={props => <List.Icon {...props} icon="help-circle" color={COLORS.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
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