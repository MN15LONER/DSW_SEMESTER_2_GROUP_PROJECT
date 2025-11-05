import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';

const DriverDashboard = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('Loading real orders from Firebase...');

      const allOrders = await firebaseService.orders.getAll();
      console.log('Orders loaded from Firebase:', allOrders);

      const transformedOrders = allOrders.map(order => ({
        id: order.id,
        customerName: order.customerName || 'Customer',
        customerPhone: order.contactNumber || 'No phone',
        items: order.items || [],
        total: order.total || 0,
        deliveryAddress: order.deliveryAddress || 'No address',
        orderDate: order.orderDate || order.createdAt?.toISOString() || new Date().toISOString(),
        status: order.status || 'pending',
        estimatedDelivery: order.estimatedDelivery || '45-60 minutes',
        userId: order.userId,
        paymentMethod: order.paymentMethod || 'cash',
        specialInstructions: order.specialInstructions || ''
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders from Firebase:', error);

      console.log('Falling back to mock data...');
      const mockOrders = [
        {
          id: '1',
          customerName: 'John Smith',
          customerPhone: '+27 82 123 4567',
          items: [
            { name: 'Coca Cola 2L', quantity: 2, price: 25.99 },
            { name: 'Bread Loaf', quantity: 1, price: 12.50 },
            { name: 'Milk 1L', quantity: 3, price: 18.99 }
          ],
          total: 95.46,
          deliveryAddress: '123 Main Street, Cape Town',
          orderDate: '2024-01-15T10:30:00Z',
          status: 'pending',
          estimatedDelivery: '45-60 minutes'
        },
        {
          id: '2',
          customerName: 'Sarah Johnson',
          customerPhone: '+27 83 987 6543',
          items: [
            { name: 'Chicken Breast 1kg', quantity: 1, price: 89.99 },
            { name: 'Rice 5kg', quantity: 1, price: 45.00 },
            { name: 'Vegetables Mix', quantity: 2, price: 35.50 }
          ],
          total: 170.49,
          deliveryAddress: '456 Oak Avenue, Johannesburg',
          orderDate: '2024-01-15T11:15:00Z',
          status: 'pending',
          estimatedDelivery: '30-45 minutes'
        }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAcceptOrder = (orderId) => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              console.log('Accepting order:', orderId);

              const success = await firebaseService.orders.updateStatus(orderId, 'accepted');

              if (success) {

                setOrders(prevOrders =>
                  prevOrders.map(order =>
                    order.id === orderId
                      ? { ...order, status: 'accepted' }
                      : order
                  )
                );
                Alert.alert('Success', 'Order accepted successfully!');
              } else {
                Alert.alert('Error', 'Failed to accept order. Please try again.');
              }
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Error', 'Failed to accept order. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleStartDelivery = (orderId) => {
    Alert.alert(
      'Start Delivery',
      'Are you ready to start delivery for this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              console.log('Starting delivery for order:', orderId);

              const success = await firebaseService.orders.updateStatus(orderId, 'in-transit');

              if (success) {

                setOrders(prevOrders =>
                  prevOrders.map(order =>
                    order.id === orderId
                      ? { ...order, status: 'in-transit' }
                      : order
                  )
                );
                Alert.alert('Success', 'Delivery started!');
              } else {
                Alert.alert('Error', 'Failed to start delivery. Please try again.');
              }
            } catch (error) {
              console.error('Error starting delivery:', error);
              Alert.alert('Error', 'Failed to start delivery. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCompleteDelivery = (orderId) => {
    Alert.alert(
      'Complete Delivery',
      'Has the order been delivered successfully?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              console.log('Completing delivery for order:', orderId);

              const success = await firebaseService.orders.updateStatus(orderId, 'delivered');

              if (success) {

                setOrders(prevOrders =>
                  prevOrders.map(order =>
                    order.id === orderId
                      ? { ...order, status: 'delivered' }
                      : order
                  )
                );
                Alert.alert('Success', 'Order delivered successfully!');
              } else {
                Alert.alert('Error', 'Failed to complete delivery. Please try again.');
              }
            } catch (error) {
              console.error('Error completing delivery:', error);
              Alert.alert('Error', 'Failed to complete delivery. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'accepted':
        return orders.filter(order => order.status === 'accepted');
      case 'in-transit':
        return orders.filter(order => order.status === 'in-transit');
      case 'delivered':
        return orders.filter(order => order.status === 'delivered');
      default:
        return orders;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF6B6B';
      case 'accepted': return '#4ECDC4';
      case 'in-transit': return '#45B7D1';
      case 'delivered': return '#96CEB4';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'in-transit': return 'car-outline';
      case 'delivered': return 'checkmark-done-outline';
      default: return 'help-outline';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.customerPhone}>{item.customerPhone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.orderDate).toLocaleString()}
        </Text>
        <Text style={styles.deliveryAddress}>
          📍 {item.deliveryAddress}
        </Text>
        <Text style={styles.estimatedDelivery}>
          ⏱️ {item.estimatedDelivery}
        </Text>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items:</Text>
        {item.items.map((product, index) => (
          <Text key={index} style={styles.itemText}>
            {product.quantity}x {product.name} - R{product.price.toFixed(2)}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>Total: R{item.total.toFixed(2)}</Text>

        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptOrder(item.id)}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          )}

          {item.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStartDelivery(item.id)}
            >
              <Ionicons name="play-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          )}

          {item.status === 'in-transit' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteDelivery(item.id)}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate('DriverChat', { 
              orderId: item.id, 
              customerId: item.userId 
            })}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
            <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No orders found</Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'pending' 
          ? 'No pending orders at the moment'
          : `No ${activeTab} orders at the moment`
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <Text style={styles.headerSubtitle}>Customer orders awaiting delivery</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['pending', 'accepted', 'in-transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  estimatedDelivery: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  startButton: {
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
  },
  completeButton: {
    backgroundColor: '#96CEB4',
    borderColor: '#96CEB4',
  },
  chatButton: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default DriverDashboard;
