import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../../context/CartContext';
import ProductDetailModal from './ProductDetailModal';
import ImageWithFallback from '../common/ImageWithFallback';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleProductPress = () => {
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleProductPress}>
        <ImageWithFallback 
          source={{ uri: product.image }} 
          style={styles.productImage}
          resizeMode="cover"
          fallbackIcon="basket-outline"
          fallbackIconSize={30}
        />
        
        {product.isSpecial && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>SPECIAL</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              R{product.price.toFixed(2)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                R{product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ProductDetailModal
        visible={modalVisible}
        product={product}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  specialBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  specialText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProductCard;