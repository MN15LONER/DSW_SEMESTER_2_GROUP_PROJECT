import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { COLORS } from '../../styles/colors';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const increaseQuantity = () => {
    updateQuantity(item.id, item.storeId, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.storeId, item.quantity - 1);
    } else {
      removeFromCart(item.id, item.storeId);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id, item.storeId);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          R{item.price.toFixed(2)} each
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={decreaseQuantity}
          >
            <Ionicons name="remove" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={increaseQuantity}
          >
            <Ionicons name="add" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
        
        <Text style={styles.totalPrice}>
          R{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});