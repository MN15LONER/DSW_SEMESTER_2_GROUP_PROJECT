import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';
import { COLORS } from '../styles/colors';

export default function CartScreen({ navigation }) {
  const { cartItems, getCartTotal, getStoreGroups, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some items from your favorite stores
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          style={styles.shopButton}
        >
          Start Shopping
        </Button>
      </View>
    );
  }

  const storeGroups = getStoreGroups();
  const total = getCartTotal();

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {Object.entries(storeGroups).map(([storeId, group]) => (
          <View key={storeId} style={styles.storeGroup}>
            <Text style={styles.storeName}>{group.storeName}</Text>
            {group.items.map((item) => (
              <CartItem key={`${item.id}-${item.storeId}`} item={item} />
            ))}
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalText}>
                Subtotal: R{group.subtotal.toFixed(2)}
              </Text>
            </View>
            <Divider style={styles.divider} />
          </View>
        ))}
      </ScrollView>

      {/* Checkout Section */}
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>R{total.toFixed(2)}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={styles.checkoutButton}
          contentStyle={styles.checkoutButtonContent}
        >
          Proceed to Checkout
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
  scrollContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
  },
  storeGroup: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  subtotalContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  divider: {
    marginTop: 16,
  },
  checkoutContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
  },
  checkoutButtonContent: {
    height: 48,
  },
});
