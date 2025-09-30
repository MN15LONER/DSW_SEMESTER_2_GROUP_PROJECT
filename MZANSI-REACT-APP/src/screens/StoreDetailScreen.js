import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/store/ProductGrid';
import StoreHeader from '../components/store/StoreHeader';
import { useCart } from '../context/CartContext';
import { getStoreProducts } from '../data/mockData';
import { firebaseService } from '../services/firebase';
import { COLORS } from '../styles/colors';

export default function StoreDetailScreen({ route, navigation }) {
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try Firebase first, fallback to mock data
        const storeProducts = await firebaseService.products.getByStore(store.id);
        setProducts(storeProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to mock data
        const fallbackProducts = getStoreProducts(store.id);
        setProducts(fallbackProducts);
      }
    };
    
    loadProducts();
  }, [store.id]);

  const categories = ['All', 'Specials', 'Fresh Produce', 'Meat', 'Dairy', 'Bakery'];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: store.id,
      storeName: store.name,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Store Header */}
        <StoreHeader store={store} />

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>
              Delivery: {store.deliveryTime || 'Same day for food items'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>
              Serves: {store.location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.infoText}>
              {store.rating} ({store.reviews} reviews)
            </Text>
          </View>
        </View>

        {/* Current Promotions */}
        {store.promotions && store.promotions.length > 0 && (
          <View style={styles.promotionsContainer}>
            <Text style={styles.sectionTitle}>Current Promotions</Text>
            {store.promotions.map((promo, index) => (
              <View key={index} style={styles.promoCard}>
                <Ionicons name="pricetag-outline" size={20} color={COLORS.success} />
                <Text style={styles.promoText}>{promo}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Browse Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.selectedCategoryChipText
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </View>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={50} color={COLORS.gray} />
            <Text style={styles.emptyStateText}>
              No products found in {selectedCategory}
            </Text>
            <Text style={styles.emptyStateSubText}>
              Try selecting a different category
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Contact Store Button */}
      <View style={styles.contactContainer}>
        <Button
          mode="outlined"
          icon="message-outline"
          onPress={() => {
            // In real app, this would open in-app messaging
            alert('Contact feature coming soon!');
          }}
          style={styles.contactButton}
        >
          Contact Store
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  storeInfo: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 14,
  },
  promotionsContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  promoText: {
    marginLeft: 8,
    color: COLORS.success,
    fontWeight: '500',
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 10,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.gray,
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  productsContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 70,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 8,
    textAlign: 'center',
  },
  contactContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactButton: {
    borderColor: COLORS.primary,
  },
});