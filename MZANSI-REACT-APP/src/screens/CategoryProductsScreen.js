import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { realProductDataService, formatPrice, getPromotionLabel } from '../services/realProductDataService';
import { useCart } from '../context/CartContext';
import { COLORS } from '../styles/colors';

export default function CategoryProductsScreen({ navigation, route }) {
  const { category } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const categoryProducts = await realProductDataService.getProductsByCategory(category, 50);
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.hasPromotion ? product.promotionPrice : product.price,
      image: product.image,
      quantity: 1,
      storeId: 'category_store', // Generic store for category browsing
      storeName: `${category} Store`
    };

    addToCart(cartItem);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.hasPromotion && (
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionText}>{getPromotionLabel(item)}</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productUnit}>{item.unit}</Text>

        <View style={styles.storeInfo}>
          <Ionicons name="storefront-outline" size={12} color={COLORS.primary} />
          <Text style={styles.storeName} numberOfLines={1}>{item.storeName}</Text>
          <Text style={styles.storeDistance}>• {item.storeDistance}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>

        <View style={styles.priceContainer}>
          {item.hasPromotion ? (
            <>
              <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.promotionPrice}>{formatPrice(item.promotionPrice)}</Text>
              <Text style={styles.savings}>Save {formatPrice(item.savings)}</Text>
            </>
          ) : (
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            !item.inStock && styles.addButtonDisabled
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={!item.inStock}
        >
          <Ionicons 
            name={item.inStock ? "add-circle" : "ban"} 
            size={20} 
            color={item.inStock ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[
            styles.addButtonText,
            !item.inStock && styles.addButtonTextDisabled
          ]}>
            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>{category} Products</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading {category.toLowerCase()} products...</Text>
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
        <Text style={styles.headerTitle}>{category} Products</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadProducts}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {products.length} products found • {products.filter(p => p.hasPromotion).length} on special
        </Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadProducts}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productsList: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    maxWidth: '48%',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  promotionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  outOfStockText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  productUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  promotionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  savings: {
    fontSize: 10,
    color: '#E53E3E',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  addButtonTextDisabled: {
    color: COLORS.gray,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeName: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
  },
  storeDistance: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
});
