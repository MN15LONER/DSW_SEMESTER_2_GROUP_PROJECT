import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

// Mock order data - in real app this would come from Firebase/API
const mockOrders = [
  {
    id: 'ORD001',
    date: '2024-01-15',
    status: 'delivered',
    total: 245.50,
    items: [
      { name: 'Fresh Bananas (1kg)', quantity: 2, price: 24.99 },
      { name: 'Full Cream Milk (2L)', quantity: 1, price: 32.99 },
    ],
    storeName: 'Pick n Pay Sandton',
    deliveryAddress: '123 Main Street, Johannesburg',
  },
  {
    id: 'ORD002',
    date: '2024-01-12',
    status: 'cancelled',
    total: 156.75,
    items: [
      { name: 'Chicken Breast (1kg)', quantity: 1, price: 89.99 },
      { name: 'Brown Bread (700g)', quantity: 2, price: 16.99 },
    ],
    storeName: 'Checkers Hyper Eastgate',
    deliveryAddress: '456 Oak Avenue, Sandton',
  },
  {
    id: 'ORD003',
    date: '2024-01-10',
    status: 'delivered',
    total: 89.25,
    items: [
      { name: 'Tomatoes (1kg)', quantity: 1, price: 18.99 },
      { name: 'Potatoes (2kg)', quantity: 1, price: 22.99 },
    ],
    storeName: 'Shoprite Soweto',
    deliveryAddress: '789 Pine Road, Soweto',
  },
];

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // In real app, fetch orders from API/Firebase
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your order history will appear here once you place your first order
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            onPress={() => navigation.navigate('OrderDetail', { order })}
          >
            <Card style={styles.orderCard}>
              <Card.Content>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
                    textStyle={styles.statusText}
                  >
                    {getStatusText(order.status)}
                  </Chip>
                </View>

                {/* Store Info */}
                <View style={styles.storeInfo}>
                  <Ionicons name="storefront-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.storeName}>{order.storeName}</Text>
                </View>

                {/* Items Preview */}
                <View style={styles.itemsPreview}>
                  <Text style={styles.itemsTitle}>Items:</Text>
                  {order.items.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.itemText}>
                      • {item.quantity}x {item.name}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={styles.moreItems}>
                      +{order.items.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <Text style={styles.totalAmount}>
                    Total: R{order.total.toFixed(2)}
                  </Text>
                  <View style={styles.viewMore}>
                    <Text style={styles.viewMoreText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    padding: 16,
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
    lineHeight: 20,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeName: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
});
