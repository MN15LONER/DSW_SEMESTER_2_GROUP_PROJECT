import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import ImageWithFallback from '../common/ImageWithFallback';
import { getImageForProduct } from '../../utils/imageHelper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { unsplashService, imageCache, getOptimizedImageUrl } from '../../services/unsplashApi';
const { width } = Dimensions.get('window');
const ProductDetailModal = ({ visible, product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const isFavorite = checkIsFavorite(product.id);
  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    onClose();
  };
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#ff4757" : "#333"} 
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {}
            <View style={styles.imageContainer}>
              <ImageWithFallback
                source={{ uri: product.image || getImageForProduct(product) }}
                loader={async () => {
                  const key = `product:${product.name}::${product.category}`;
                  if (imageCache.has(key)) {
                    const cached = imageCache.get(key);
                    const url = cached.url || cached.thumb || cached.small || null;
                    return getOptimizedImageUrl(url, 900, 600, 90) || url;
                  }
                  try {
                    const img = await unsplashService.getProductImages(product.name || '', product.category || '');
                    if (img) {
                      imageCache.set(key, img);
                      const raw = img.url || img.downloadUrl || img.small || img.thumb || null;
                      return getOptimizedImageUrl(raw, 900, 600, 90) || raw;
                    }
                  } catch (e) {
                  }
                  return null;
                }}
                style={styles.productImage}
                resizeMode="cover"
                fallbackIcon="image"
              />
              {product.isSpecial && (
                <View style={styles.specialBadge}>
                  <Text style={styles.specialText}>SPECIAL</Text>
                </View>
              )}
            </View>
            {}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>R{(product.price || 0).toFixed(2)}</Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text style={styles.originalPrice}>R{(product.originalPrice || 0).toFixed(2)}</Text>
                )}
              </View>
              {}
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>
                  {product.description || 'Fresh and high-quality product available at great prices. Perfect for your daily needs.'}
                </Text>
              </View>
              {}
              {product.nutritionalInfo && (
                <View style={styles.nutritionContainer}>
                  <Text style={styles.sectionTitle}>Nutritional Information</Text>
                  <Text style={styles.nutritionText}>{product.nutritionalInfo}</Text>
                </View>
              )}
              {}
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand:</Text>
                  <Text style={styles.detailValue}>{product.brand || 'Generic'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight/Size:</Text>
                  <Text style={styles.detailValue}>{product.size || 'Standard'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Origin:</Text>
                  <Text style={styles.detailValue}>{product.origin || 'South Africa'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          {}
          <View style={styles.actionBar}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={decrementQuantity}
              >
                <Ionicons name="remove" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={incrementQuantity}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>
                Add to Cart - R{((product.price || 0) * quantity).toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  specialBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nutritionContainer: {
    marginBottom: 20,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginRight: 16,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default ProductDetailModal;