import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userOrders = await firebaseService.orders.getByUser(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserOrders}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state - no orders
  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your order history will appear here once you place your first order
        </Text>
        <TouchableOpacity 
          style={styles.shopNowButton} 
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.shopNowButtonText}>Start Shopping</Text>
        </TouchableOpacity>
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
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() => navigation.navigate('CustomerChat', { 
                        orderId: order.id, 
                        driverId: order.driverId || 'placeholder' 
                      })}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <View style={styles.viewMore}>
                      <Text style={styles.viewMoreText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: COLORS.lightBlue,
  },
  chatButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
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
