import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Searchbar, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import { productSearchService } from '../services/productSearchService';
import { COLORS } from '../styles/colors';
import EmptyState from '../components/common/EmptyState';
export default function StoreFinderScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedChain, setSelectedChain] = useState('all');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const storeChains = [
    { id: 'all', name: 'All Stores' },
    { id: 'pick-n-pay', name: 'Pick n Pay' },
    { id: 'checkers', name: 'Checkers' },
    { id: 'woolworths', name: 'Woolworths' },
    { id: 'shoprite', name: 'Shoprite' },
    { id: 'makro', name: 'Makro' }
  ];
  useEffect(() => {
    loadStores();
    getCurrentLocation();
  }, []);
  useEffect(() => {
    filterStores();
  }, [stores, searchQuery, selectedChain, userLocation]);
  const loadStores = async () => {
    try {
      setLoading(true);
      const allStores = productSearchService.getAllStores();
      setStores(allStores);
    } catch (error) {
      console.error('Error loading stores:', error);
      Alert.alert('Error', 'Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is needed to show nearby stores and calculate distances.'
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location.');
    } finally {
      setLocationLoading(false);
    }
  };
  const calculateDistance = (storeCoords) => {
    if (!userLocation) return null;
    if (!storeCoords || typeof storeCoords.latitude !== 'number' || typeof storeCoords.longitude !== 'number') return null;
    const R = 6371; 
    const dLat = (storeCoords.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (storeCoords.longitude - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(storeCoords.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };
  const filterStores = () => {
    let filtered = [...stores];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(store => {
        const name = (store.name || '').toLowerCase();
        const address = (store.address || '').toLowerCase();
        const area = (store.area || store.location || '').toLowerCase();
        return (
          name.includes(q) ||
          address.includes(q) ||
          area.includes(q)
        );
      });
    }
    if (selectedChain !== 'all') {
      const normalized = selectedChain.replace(/-/g, ' ').toLowerCase();
      filtered = filtered.filter(store => (store.brand || '').toLowerCase().includes(normalized));
    }
    if (userLocation) {
      filtered = filtered.map(store => ({
        ...store,
        distance: store.coordinates ? calculateDistance(store.coordinates) : null
      })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    setFilteredStores(filtered);
  };
  const handleCallStore = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        Alert.alert('Error', 'Could not open phone app');
      });
  };
  const handleGetDirections = (store) => {
    if (!store.coordinates || typeof store.coordinates.latitude !== 'number' || typeof store.coordinates.longitude !== 'number') {
      Alert.alert('No coordinates', 'This store does not have location coordinates available.');
      return;
    }
    const { latitude, longitude } = store.coordinates;
    const label = encodeURIComponent(store.name || 'Store');
    let url;
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${latitude},${longitude}(${label})`;
    } else {
      url = `geo:0,0?q=${latitude},${longitude}(${label})`;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https:
          Linking.openURL(webUrl);
        }
      })
      .catch((error) => {
        console.error('Error opening maps app:', error);
        Alert.alert('Error', 'Could not open maps app');
      });
  };
  const renderStoreItem = ({ item: store }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeChain}>{store.brand}</Text>
        </View>
        <View style={styles.storeStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: store.isOpen ? COLORS.success : COLORS.error }
          ]} />
          <Text style={[
            styles.statusText,
            { color: store.isOpen ? COLORS.success : COLORS.error }
          ]}>
            {store.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      <View style={styles.storeDetails}>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color={COLORS.textSecondary} />
          <Text style={styles.address}>{store.address || store.location || 'Address not available'}</Text>
        </View>
        {typeof store.distance === 'number' && (
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate" size={16} color={COLORS.primary} />
            <Text style={styles.distance}>{store.distance.toFixed(1)} km away</Text>
          </View>
        )}
        <View style={styles.hoursContainer}>
          <Ionicons name="time" size={16} color={COLORS.textSecondary} />
          <Text style={styles.hours}>{store.hours}</Text>
        </View>
        {store.phone && (
          <View style={styles.phoneContainer}>
            <Ionicons name="call" size={16} color={COLORS.textSecondary} />
            <Text style={styles.phone}>{store.phone}</Text>
          </View>
        )}
      </View>
      <View style={styles.storeActions}>
        <Button
          mode="outlined"
          onPress={() => handleCallStore(store.phone)}
          style={styles.actionButton}
          labelStyle={styles.actionButtonText}
          disabled={!store.phone}
        >
          <Ionicons name="call" size={16} color={COLORS.primary} />
          Call
        </Button>
        <Button
          mode="outlined"
          onPress={() => handleGetDirections(store)}
          style={styles.actionButton}
          labelStyle={styles.actionButtonText}
        >
          <Ionicons name="navigate" size={16} color={COLORS.primary} />
          Directions
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ProductSearch', { 
            storeId: store.id,
            storeName: store.name 
          })}
          style={styles.shopButton}
        >
          Shop Now
        </Button>
      </View>
    </View>
  );
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Finder</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading stores...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Finder</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          <Ionicons 
            name={locationLoading ? "hourglass" : "location"} 
            size={24} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search stores by name or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <FlatList
          data={storeChains}
          renderItem={({ item }) => (
            <Chip
              selected={selectedChain === item.id}
              onPress={() => setSelectedChain(item.id)}
              style={[
                styles.filterChip,
                selectedChain === item.id && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                selectedChain === item.id && styles.selectedChipText
              ]}
            >
              {item.name}
            </Chip>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} found
        </Text>
        {userLocation && (
          <Text style={styles.sortedBy}>Sorted by distance</Text>
        )}
      </View>
      <FlatList
        data={filteredStores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="storefront"
            title="No stores found"
            message="Try adjusting your search or filters"
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedChain('all');
            }}
          />
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  locationButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  filtersContainer: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sortedBy: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  storesList: {
    paddingVertical: 8,
  },
  storeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  storeChain: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  storeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storeDetails: {
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hours: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  storeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.3,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  shopButton: {
    flex: 0.35,
    backgroundColor: COLORS.primary,
  },
});