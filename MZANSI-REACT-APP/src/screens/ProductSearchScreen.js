import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Modal, Portal } from 'react-native-paper';
import { productSearchService } from '../services/productSearchService';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { COLORS } from '../styles/colors';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { getImageForProduct } from '../utils/imageHelper';

export default function ProductSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    brand: 'All',
    minPrice: null,
    maxPrice: null,
    inStockOnly: false,
    onPromotionOnly: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { selectedLocation, userLocation } = useLocation();
  const { addToCart } = useCart();

  // Get filter options
  const categories = useMemo(() => productSearchService.getCategories(), []);
  const brands = useMemo(() => productSearchService.getBrands(), []);

  useEffect(() => {
    performSearch();
  }, [searchQuery, filters, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    try {
      let results = productSearchService.searchProducts(searchQuery, filters);
      results = productSearchService.sortProducts(results, sortBy, userLocation);
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, store) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: store.price,
      image: product.image,
      quantity: 1,
      storeId: store.storeId,
      storeName: store.storeName
    };
    
    addToCart(cartItem);
    Alert.alert('Added to Cart', `${product.name} from ${store.storeName} added to cart.`);
  };

  const handleCallStore = (phone) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device.');
        }
      })
      .catch((err) => console.error('Error opening phone:', err));
  };

  const handleGetDirections = (coordinates, storeName) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}&destination_place_id=${storeName}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Maps are not supported on this device.');
        }
      })
      .catch((err) => console.error('Error opening maps:', err));
  };

  const renderProductItem = ({ item: product }) => (
    <View style={styles.productCard}>
      <View style={styles.productRow}>
        <ImageWithFallback
          source={{ uri: product.image || getImageForProduct(product) }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews} reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Price Range:</Text>
        <Text style={styles.priceRange}>
          R{product.priceRange.min.toFixed(2)} - R{product.priceRange.max.toFixed(2)}
        </Text>
        {product.priceRange.savings > 0 && (
          <Text style={styles.savings}>Save up to R{product.priceRange.savings.toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.storesSection}>
        <Text style={styles.storesLabel}>Available at {product.availableStores} stores:</Text>
        {product.stores.slice(0, 3).map((store, index) => (
          <View key={store.storeId} style={styles.storeItem}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.storeName}</Text>
              <Text style={styles.storeLocation}>{store.storeLocation}</Text>
              <View style={styles.storeDetails}>
                <Text style={styles.storePrice}>R{store.price.toFixed(2)}</Text>
                {store.promotion && (
                  <Chip mode="flat" style={styles.promotionChip} textStyle={styles.promotionText}>
                    {store.promotion.type === 'discount' ? `${store.promotion.value}% OFF` : 'SPECIAL'}
                  </Chip>
                )}
                <Text style={[styles.stockStatus, { color: store.inStock ? COLORS.success : COLORS.error }]}>
                  {store.inStock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>
            
            <View style={styles.storeActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={() => handleAddToCart(product, store)}
                disabled={!store.inStock}
              >
                <Ionicons name="add-circle" size={20} color={store.inStock ? 'white' : COLORS.gray} />
                <Text style={[styles.actionButtonText, { color: store.inStock ? 'white' : COLORS.gray }]}>
                  Add
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.contactButton]}
                onPress={() => setSelectedProduct({ product, store })}
              >
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {product.stores.length > 3 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('ProductDetail', { product })}
          >
            <Text style={styles.viewAllText}>View all {product.stores.length} stores</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal visible={showFilters} onDismiss={() => setShowFilters(false)} contentContainerStyle={styles.modalContainer}>
        <Text style={styles.modalTitle}>Filter & Sort</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Category</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                mode={filters.category === item ? 'flat' : 'outlined'}
                onPress={() => setFilters(prev => ({ ...prev, category: item }))}
                style={styles.filterChip}
                selectedColor={COLORS.primary}
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <FlatList
            data={[
              { key: 'relevance', label: 'Relevance' },
              { key: 'price_low', label: 'Price: Low to High' },
              { key: 'price_high', label: 'Price: High to Low' },
              { key: 'rating', label: 'Rating' },
              { key: 'savings', label: 'Best Savings' },
              { key: 'distance', label: 'Distance' }
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                mode={sortBy === item.key ? 'flat' : 'outlined'}
                onPress={() => setSortBy(item.key)}
                style={styles.filterChip}
                selectedColor={COLORS.primary}
              >
                {item.label}
              </Chip>
            )}
            keyExtractor={(item) => item.key}
          />
        </View>

        <View style={styles.filterToggles}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
          >
            <Ionicons 
              name={filters.inStockOnly ? "checkbox" : "checkbox-outline"} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.toggleText}>In Stock Only</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setFilters(prev => ({ ...prev, onPromotionOnly: !prev.onPromotionOnly }))}
          >
            <Ionicons 
              name={filters.onPromotionOnly ? "checkbox" : "checkbox-outline"} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.toggleText}>On Promotion Only</Text>
          </TouchableOpacity>
        </View>

        <Button mode="contained" onPress={() => setShowFilters(false)} style={styles.applyButton}>
          Apply Filters
        </Button>
      </Modal>
    </Portal>
  );

  const renderStoreDetailModal = () => (
    <Portal>
      <Modal 
        visible={!!selectedProduct} 
        onDismiss={() => setSelectedProduct(null)} 
        contentContainerStyle={styles.storeModalContainer}
      >
        {selectedProduct && (
          <>
            <Text style={styles.storeModalTitle}>{selectedProduct.store.storeName}</Text>
            <Text style={styles.storeModalLocation}>{selectedProduct.store.storeLocation}</Text>
            
            <View style={styles.storeModalActions}>
              <Button
                mode="contained"
                icon="phone"
                onPress={() => {
                  const storeData = productSearchService.getStoreById(selectedProduct.store.storeId);
                  if (storeData?.phone) {
                    handleCallStore(storeData.phone);
                  } else {
                    Alert.alert('Contact Info', 'Phone number not available for this store.');
                  }
                }}
                style={styles.storeActionButton}
              >
                Call Store
              </Button>
              
              <Button
                mode="outlined"
                icon="map"
                onPress={() => {
                  if (selectedProduct.store.coordinates) {
                    handleGetDirections(selectedProduct.store.coordinates, selectedProduct.store.storeName);
                  } else {
                    Alert.alert('Directions', 'Location not available for this store.');
                  }
                }}
                style={styles.storeActionButton}
              >
                Directions
              </Button>
            </View>
            
            <Button mode="text" onPress={() => setSelectedProduct(null)}>
              Close
            </Button>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Search</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products across all stores..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {products.length} products found
        </Text>
        <Text style={styles.locationText}>
          Near {selectedLocation || 'your location'}
        </Text>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          icon="search"
          title="No products found"
          message="Try adjusting your search terms or filters"
          actionText="Clear Filters"
          onAction={() => {
            setFilters({
              category: 'All',
              brand: 'All',
              minPrice: null,
              maxPrice: null,
              inStockOnly: false,
              onPromotionOnly: false
            });
            setSearchQuery('');
          }}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderFilterModal()}
      {renderStoreDetailModal()}
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  productsList: {
    padding: 8,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceRange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  savings: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 2,
  },
  storesSection: {
    marginBottom: 8,
  },
  storesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  storeLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
  promotionChip: {
    height: 24,
    marginRight: 8,
  },
  promotionText: {
    fontSize: 10,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  storeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  contactButton: {
    backgroundColor: COLORS.lightGray,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  filterToggles: {
    marginBottom: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  storeModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  storeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  storeModalLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  storeModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storeActionButton: {
    flex: 0.48,
  },
});
