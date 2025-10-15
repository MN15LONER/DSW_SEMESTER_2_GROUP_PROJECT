import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip } from 'react-native-paper';
import { productSearchService } from '../services/productSearchService';
import { useCart } from '../context/CartContext';
import { COLORS } from '../styles/colors';
import EmptyState from '../components/common/EmptyState';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { getImageForProduct } from '../utils/imageHelper';

export default function DailyDealsScreen({ navigation }) {
  const [deals, setDeals] = useState([]);
  const [promotionalProducts, setPromotionalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadDealsAndPromotions();
  }, []);

  const loadDealsAndPromotions = async () => {
    try {
      setLoading(true);
      const dailyDeals = productSearchService.getDailyDeals();
      const promoProducts = productSearchService.getPromotionalProducts();
      
      setDeals(dailyDeals);
      setPromotionalProducts(promoProducts);
    } catch (error) {
      console.error('Error loading deals:', error);
      Alert.alert('Error', 'Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, store) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: store.promotion ? store.promotion.originalPrice - (store.promotion.originalPrice * store.promotion.value / 100) : store.price,
      image: product.image,
      quantity: 1,
      storeId: store.storeId,
      storeName: store.storeName
    };
    
    addToCart(cartItem);
    Alert.alert('Added to Cart', `${product.name} added to cart with special price!`);
  };

  const renderDealItem = ({ item: deal }) => (
    <TouchableOpacity style={styles.dealCard}>
      <ImageWithFallback source={{ uri: deal.image }} style={styles.dealImage} />
      <View style={styles.dealContent}>
        <View style={styles.dealHeader}>
          <Text style={styles.dealTitle}>{deal.title}</Text>
          <Chip mode="flat" style={styles.discountChip} textStyle={styles.discountText}>
            {deal.discount > 0 ? `${deal.discount}% OFF` : 'SPECIAL OFFER'}
          </Chip>
        </View>
        
        <Text style={styles.dealDescription}>{deal.description}</Text>
        
        <View style={styles.dealFooter}>
          <View style={styles.storesContainer}>
            <Ionicons name="storefront" size={14} color={COLORS.primary} />
            <Text style={styles.storesText}>
              Available at {deal.stores.length} store{deal.stores.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.validityContainer}>
            <Ionicons name="time" size={14} color={COLORS.textSecondary} />
            <Text style={styles.validityText}>Valid until {new Date(deal.validUntil).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text style={styles.dealTerms}>{deal.terms}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPromotionalProduct = ({ item: product }) => {
    const bestPromoStore = product.promotionalStores.reduce((best, current) => {
      if (!best) return current;
      const bestDiscount = best.promotion?.value || 0;
      const currentDiscount = current.promotion?.value || 0;
      return currentDiscount > bestDiscount ? current : best;
    }, null);

    return (
    <View style={styles.productCard}>
      <ImageWithFallback source={{ uri: product.image || getImageForProduct(product) }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews})</Text>
          </View>
        </View>

        <View style={styles.promotionSection}>
          <Text style={styles.promotionLabel}>Best Deal:</Text>
          <View style={styles.priceContainer}>
            {bestPromoStore?.promotion && (
              <>
                <Text style={styles.originalPrice}>
                  R{bestPromoStore.promotion.originalPrice?.toFixed(2) || bestPromoStore.price.toFixed(2)}
                </Text>
                <Text style={styles.salePrice}>
                  R{bestPromoStore.price.toFixed(2)}
                </Text>
                <Chip mode="flat" style={styles.saveChip} textStyle={styles.saveText}>
                  SAVE {bestPromoStore.promotion.value}%
                </Chip>
              </>
            )}
          </View>
          
          <Text style={styles.storeInfo}>
            at {productSearchService.getStoreById(bestPromoStore?.storeId)?.name || 'Store'}
          </Text>
        </View>

        <View style={styles.productActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ProductSearch', { 
              initialQuery: product.name 
            })}
            style={styles.compareButton}
            labelStyle={styles.compareButtonText}
          >
            Compare Prices
          </Button>
          
          <Button
            mode="contained"
            onPress={() => handleAddToCart(product, bestPromoStore)}
            style={styles.addButton}
            disabled={!bestPromoStore?.inStock}
          >
            Add to Cart
          </Button>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Daily Deals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading deals...</Text>
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
        <Text style={styles.headerTitle}>Daily Deals</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDealsAndPromotions}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <>
            {deals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Today's Special Offers</Text>
                <FlatList
                  data={deals}
                  renderItem={renderDealItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dealsContainer}
                />
              </View>
            )}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Products on Promotion</Text>
              {promotionalProducts.length === 0 && (
                <EmptyState
                  icon="pricetag"
                  title="No promotions available"
                  message="Check back later for new deals and promotions"
                  style={styles.emptyState}
                />
              )}
            </View>
          </>
        )}
        data={promotionalProducts}
        renderItem={renderPromotionalProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dealsContainer: {
    paddingHorizontal: 8,
  },
  dealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 8,
    width: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  dealContent: {
    padding: 16,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  discountChip: {
    backgroundColor: COLORS.error,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dealDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  dealFooter: {
    marginBottom: 8,
  },
  storesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storesText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dealTerms: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
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
  promotionSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  promotionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  salePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginRight: 8,
  },
  saveChip: {
    backgroundColor: COLORS.success,
    height: 24,
  },
  saveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storeInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compareButton: {
    flex: 0.48,
    borderColor: COLORS.primary,
  },
  compareButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  addButton: {
    flex: 0.48,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    marginTop: 40,
  },
});
