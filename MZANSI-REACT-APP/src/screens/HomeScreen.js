import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Searchbar, FAB, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import FlyerGrid from '../components/flyers/FlyerGrid';
import LocationPicker from '../components/common/LocationPicker';
import SearchFilter from '../components/common/SearchFilter';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { mockStores, getMockStores } from '../data/mockData';
import { firebaseService } from '../services/firebase';
import { COLORS } from '../styles/colors';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const { selectedLocation } = useLocation();
  const { cartItems } = useCart();

  const loadStores = useCallback(async () => {
    try {
      let storeData;
      if (selectedLocation) {
        // Try Firebase first, fallback to mock data
        storeData = await firebaseService.stores.getByLocation(selectedLocation);
      } else {
        // Try Firebase first, fallback to mock data
        storeData = await firebaseService.stores.getAll();
      }
      setStores(storeData);
    } catch (error) {
      console.error('Error loading stores:', error);
      // Fallback to mock data on error
      const fallbackData = selectedLocation 
        ? getMockStores(selectedLocation)
        : mockStores;
      setStores(fallbackData);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadStores();
  }, [selectedLocation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadStores();
    setTimeout(() => setRefreshing(false), 1000);
  }, [selectedLocation]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredStores = stores.filter(store => {
    // Text search
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || filters.category === 'All' || 
      store.category === filters.category;
    
    // Open only filter
    const matchesOpen = !filters.openOnly || store.isOpen;
    
    // Specials only filter
    const matchesSpecials = !filters.specialsOnly || 
      (store.promotions && store.promotions.length > 0);
    
    return matchesSearch && matchesCategory && matchesOpen && matchesSpecials;
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Location Header */}
        <View style={styles.locationContainer}>
          <LocationPicker />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Discover the best deals in {selectedLocation || 'your area'}
          </Text>
          <Text style={styles.subText}>
            Browse flyers and shop from local retailers
          </Text>
        </View>

        {/* Search Bar */}
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

        {/* Quick Stats */}
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

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Food', 'Clothing', 'Electronics', 'Health'].map((category) => (
              <TouchableOpacity key={category} style={styles.categoryCard}>
                <Ionicons name="storefront-outline" size={30} color={COLORS.primary} />
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Stores */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Stores & Deals</Text>
          <FlyerGrid 
            stores={filteredStores} 
            onStorePress={(store) => 
              navigation.navigate('StoreDetail', { store, storeName: store.name })
            }
          />
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <FAB
          style={styles.fab}
          icon="cart"
          label={cartItemCount.toString()}
          onPress={() => navigation.navigate('Cart')}
        />
      )}

      {/* Search Filter Modal */}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    width: 100,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});