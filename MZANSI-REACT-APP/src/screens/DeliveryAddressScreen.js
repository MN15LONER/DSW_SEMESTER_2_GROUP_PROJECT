import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, FAB, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { firebaseService } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function DeliveryAddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { updateLocation, updateUserLocation } = useLocation();
  useEffect(() => {
    loadAddresses();
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAddresses();
    });
    return unsubscribe;
  }, [navigation]);
  const loadAddresses = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const firebaseAddresses = await firebaseService.addresses.getByUser(user.uid);
        if (firebaseAddresses.length > 0) {
          setAddresses(firebaseAddresses);
          await AsyncStorage.setItem(`addresses_${user.uid}`, JSON.stringify(firebaseAddresses));
        } else {
          const savedAddresses = await AsyncStorage.getItem(`addresses_${user.uid}`);
          if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      try {
        const savedAddresses = await AsyncStorage.getItem(`addresses_${user?.uid}`);
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      } catch (asyncError) {
        console.error('Error loading from AsyncStorage:', asyncError);
      }
    } finally {
      setLoading(false);
    }
  };
  const saveAddressToFirebase = async (addressData, isUpdate = false, addressId = null) => {
    try {
      if (isUpdate && addressId) {
        await firebaseService.addresses.update(addressId, addressData);
      } else {
        const newAddressId = await firebaseService.addresses.create(user.uid, addressData);
        return newAddressId;
      }
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  };
  const handleAddAddress = () => {
    navigation.navigate('AddEditAddress', { mode: 'add' });
  };
  const handleEditAddress = (address) => {
    navigation.navigate('AddEditAddress', { mode: 'edit', address });
  };
  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.addresses.delete(addressId);
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              setAddresses(updatedAddresses);
              await AsyncStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updatedAddresses));
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          }
        }
      ]
    );
  };
  const handleSetDefault = async (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      for (const addr of updatedAddresses) {
        await saveAddressToFirebase({ isDefault: addr.isDefault }, true, addr.id);
      }
      setAddresses(updatedAddresses);
      await AsyncStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updatedAddresses));
      const defaultAddr = updatedAddresses.find(a => 
        a.isDefault);
      if (defaultAddr) {
        try {
          await AsyncStorage.setItem(`default_address_${user.uid}`, JSON.stringify(defaultAddr));
        } catch (e) {
          console.error('Error caching default address:', e);
        }
        const formatted = defaultAddr.formattedAddress || [defaultAddr.street, defaultAddr.city, defaultAddr.province].filter(Boolean).join(', ');
        if (updateLocation) updateLocation(formatted);
        if (updateUserLocation && defaultAddr.latitude && defaultAddr.longitude) updateUserLocation({ latitude: defaultAddr.latitude, longitude: defaultAddr.longitude });
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address. Please try again.');
    }
  };
  const renderAddressCard = (address) => (
    <Card key={address.id} style={styles.addressCard}>
      <Card.Content>
        <View style={styles.addressHeader}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>{address.title}</Text>
            {address.isDefault && (
              <Chip style={styles.defaultChip} textStyle={styles.defaultChipText}>
                Default
              </Chip>
            )}
          </View>
          <View style={styles.addressActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAddress(address)}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAddress(address.id)}
            >
              <Ionicons name="trash" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.addressText}>
          {address.street}
        </Text>
        <Text style={styles.addressText}>
          {address.city}, {address.province} {address.postalCode}
        </Text>
        {address.phone && (
          <Text style={styles.phoneText}>
            <Ionicons name="call" size={14} color={COLORS.gray} /> {address.phone}
          </Text>
        )}
        {!address.isDefault && (
          <Button
            mode="outlined"
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(address.id)}
          >
            Set as Default
          </Button>
        )}
      </Card.Content>
    </Card>
  );
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Delivery Addresses</Text>
      <Text style={styles.emptySubtitle}>
        Add your delivery addresses to make checkout faster
      </Text>
      <Button
        mode="contained"
        style={styles.addFirstAddressButton}
        onPress={handleAddAddress}
      >
        Add Your First Address
      </Button>
    </View>
  );
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {addresses.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.headerText}>
            Manage your delivery addresses for faster checkout
          </Text>
          {addresses.map(renderAddressCard)}
        </ScrollView>
      )}
      {addresses.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleAddAddress}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  addressCard: {
    marginBottom: 16,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  defaultChip: {
    backgroundColor: COLORS.success,
    height: 24,
  },
  defaultChipText: {
    color: COLORS.white,
    fontSize: 12,
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 12,
  },
  setDefaultButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstAddressButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});