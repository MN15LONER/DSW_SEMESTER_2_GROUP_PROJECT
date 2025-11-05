import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/store/ProductGrid';
import StoreHeader from '../components/store/StoreHeader';
import { useCart } from '../context/CartContext';
import { getStoreProducts, generateProductsForStore } from '../data/mockData';
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

        const storeProducts = await firebaseService.products.getByStore(store.id);
        if (!storeProducts || (Array.isArray(storeProducts) && storeProducts.length === 0)) {

          const generated = generateProductsForStore(store, 24);
          setProducts(generated);
        } else {
          setProducts(storeProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);

        const generated = generateProductsForStore(store, 24);
        setProducts(generated);
      }
    };

    loadProducts();
  }, [store.id]);

  const categories = ['All', 'Specials'];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : selectedCategory === 'Specials'
      ? products.filter(product => product.isSpecial)
      : products;

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

  const Header = () => (
    <>
      <StoreHeader store={store} />

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

      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>Browse Products</Text>
        <View style={styles.categoryChipsRow}>
          {categories.map((category) => (
            <Chip
              key={category}
              mode="outlined"
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
        </View>
      </View>
    </>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="basket-outline" size={50} color={COLORS.gray} />
      <Text style={styles.emptyStateText}>
        No products found in {selectedCategory}
      </Text>
      <Text style={styles.emptyStateSubText}>
        Try selecting a different category
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ProductGrid
        products={filteredProducts}
        onAddToCart={handleAddToCart}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={EmptyComponent}
        extraData={selectedCategory}
      />

      {}
      <View style={styles.contactContainer}>
        <Button
          mode="outlined"
          icon="message-outline"
          onPress={() => {

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
  categoryChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.gray,
    textAlign: 'center',
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
