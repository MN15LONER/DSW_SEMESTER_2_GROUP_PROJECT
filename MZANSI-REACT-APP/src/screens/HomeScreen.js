import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Searchbar, FAB, IconButton, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import FlyerGrid from '../components/flyers/FlyerGrid';
import LocationPicker from '../components/common/LocationPicker';
import SearchFilter from '../components/common/SearchFilter';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { mockStores, getMockStores } from '../data/mockData';
import { firebaseService } from '../services/firebase';
import { COLORS } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const { selectedLocation } = useLocation();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [defaultAddress, setDefaultAddress] = useState(null);
  const loadStores = useCallback(async () => {
    const storeData = mockStores;
    console.log('✅ Loaded ALL mock stores:', storeData.length);
    console.log('Sample stores:', storeData.slice(0, 5).map(s => `${s.name} (${s.category})`));
    console.log('📊 Category breakdown:', {
      Food: storeData.filter(s => s.category === 'Food').length,
      Clothing: storeData.filter(s => s.category === 'Clothing').length,
      Electronics: storeData.filter(s => s.category === 'Electronics').length
    });
    setStores(storeData);
  }, []);
  useEffect(() => {
    loadStores();
  }, [loadStores]);
  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (user?.uid) {
        try {
          const cachedAddress = await AsyncStorage.getItem(`default_address_${user.uid}`);
          if (cachedAddress) {
            setDefaultAddress(JSON.parse(cachedAddress));
          } else {
            setDefaultAddress(null);
          }
        } catch (error) {
          console.error('Error loading default address:', error);
          setDefaultAddress(null);
        }
      } else {
        setDefaultAddress(null);
      }
    };
    loadDefaultAddress();
  }, [user]);
  useEffect(() => {
    const checkForAddressUpdates = async () => {
      if (user?.uid) {
        try {
          const cachedAddress = await AsyncStorage.getItem(`default_address_${user.uid}`);
          if (cachedAddress) {
            const parsedAddress = JSON.parse(cachedAddress);
            if (!defaultAddress || defaultAddress.id !== parsedAddress.id) {
              setDefaultAddress(parsedAddress);
            }
          }
        } catch (error) {
          console.error('Error checking for address updates:', error);
        }
      }
    };
    checkForAddressUpdates();
    const interval = setInterval(checkForAddressUpdates, 2000); 
    return () => clearInterval(interval);
  }, [user, defaultAddress]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStores().finally(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  }, [loadStores]);
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };
  const filteredStores = stores.filter(store => {
    const query = searchQuery.toLowerCase().trim().replace(/\s+/g, ' ');
    const searchableText = [
      store.name,
      store.brand,
      store.category,
      store.location,
      store.address,
      store.description,
      ...(store.services || []),
      ...(store.specialties || [])
    ]
      .filter(Boolean)
      .join(' ') 
      .toLowerCase()
      .replace(/\s+/g, ' ');
    const matchesSearch = !query || searchableText.includes(query);
    let matchesCategory = true;
    if (filters.category && filters.category !== 'All') {
      matchesCategory = store.category === filters.category;
    }
    const matchesOpen = !filters.openOnly || store.isOpen;
    const matchesSpecials = !filters.specialsOnly || 
      (store.promotions && store.promotions.length > 0);
    return matchesSearch && matchesCategory && matchesOpen && matchesSpecials;
  });
  useEffect(() => {
    if (filters.category) {
      console.log('🔍 Active filter:', filters.category);
      console.log('📊 Filtered results:', filteredStores.length);
      if (filteredStores.length > 0) {
        console.log('Sample filtered:', filteredStores.slice(0, 3).map(s => s.name));
      }
    }
  }, [filters, filteredStores.length]);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {}
        <View style={styles.locationContainer}>
          <LocationPicker />
        </View>
        {}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Discover the best deals in {defaultAddress?.city || 'your area'}
          </Text>
          <Text style={styles.subText}>
            Browse flyers and shop from local retailers
          </Text>
          <Button
            mode="contained"
            style={styles.leafletsBtn}
            onPress={() => navigation.navigate('Leaflets')}
          >
            Browse Leaflets
          </Button>
        </View>
        {}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('OrderTracking')}
          >
            <Ionicons name="receipt-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Track Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="time-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Order History</Text>
          </TouchableOpacity>
        </View>
        {}
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <Searchbar
              placeholder="Search stores, products, deals..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <IconButton
              icon="tune"
              size={24}
              iconColor={COLORS.primary}
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            />
          </View>
        </View>
        {}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stores.length}</Text>
            <Text style={styles.statLabel}>Stores Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Daily Deals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Free</Text>
            <Text style={styles.statLabel}>Delivery*</Text>
          </View>
        </View>
        {}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Food', 'Clothing', 'Electronics'].map((category) => (
              <TouchableOpacity 
                key={category} 
                style={[
                  styles.categoryCard,
                  filters.category === category && styles.categoryCardActive
                ]}
                onPress={() => {
                  console.log('🔘 Category button clicked:', category);
                  setFilters({ ...filters, category });
                }}
              >
                <Ionicons 
                  name="storefront-outline" 
                  size={30} 
                  color={filters.category === category ? COLORS.white : COLORS.primary} 
                />
                <Text style={[
                  styles.categoryText,
                  filters.category === category && styles.categoryTextActive
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stores & Deals</Text>
            <Text style={styles.resultsCount}>
              {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}
            </Text>
          </View>
          {filteredStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No stores found</Text>
              <Text style={styles.emptySubtext}>
                {filters.category ? `Try selecting "All" or a different category` : 'Try adjusting your search'}
              </Text>
              {filters.category && (
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => setFilters({})}
                >
                  <Text style={styles.resetButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlyerGrid 
              stores={filteredStores} 
              onStorePress={(store) => 
                navigation.navigate('StoreDetail', { store, storeName: store.name })
              }
            />
          )}
        </View>
      </ScrollView>
      {}
      {cartItemCount > 0 && (
        <FAB
          style={styles.fab}
          icon="cart"
          label={cartItemCount.toString()}
          onPress={() => navigation.navigate('Cart')}
        />
      )}
      {}
      <SearchFilter
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={applyFilters}
        initialFilters={filters}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  locationContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
  leafletsBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    width: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  resetButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});