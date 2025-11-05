import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderId, total, deliveryAddress, storeGroups } = route.params || {};

  const handleContinueShopping = () => {
    navigation.navigate('Main');
  };

  const handleViewOrders = () => {
    navigation.navigate('OrderHistory');
  };

  const handleChatWithDriver = () => {
    // For now, we'll navigate to a placeholder since we don't have driverId yet
    // In a real app, you'd get the driverId from the order data
    navigation.navigate('CustomerChat', { 
      orderId: orderId,
      driverId: 'placeholder' // This would be the actual driver ID
    });
  };

  // Handle undefined values
  const safeTotal = total || 0;
  const safeDeliveryAddress = deliveryAddress || 'Address not provided';
  const safeStoreGroups = storeGroups || {};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your order. We'll send you updates via SMS.
          </Text>
        </View>

        {/* Order Details */}
        <Card style={styles.section}>
          <Card.Title title="Order Details" />
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>#{orderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>R{safeTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Address:</Text>
              <Text style={styles.detailValue}>{safeDeliveryAddress}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Delivery:</Text>
              <Text style={styles.detailValue}>Same day (2-6 hours)</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Order Items */}
        <Card style={styles.section}>
          <Card.Title title="Order Items" />
          <Card.Content>
            {Object.entries(safeStoreGroups).map(([storeId, group]) => (
              <View key={storeId} style={styles.storeGroup}>
                <Text style={styles.storeName}>{group.storeName}</Text>
                {group.items.map((item) => (
                  <View key={`${item.id}-${item.storeId}`} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity}x R{(item.price || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Text style={styles.storeSubtotal}>
                  Subtotal: R{(group.subtotal || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card style={styles.section}>
          <Card.Title title="What's Next?" />
          <Card.Content>
            <View style={styles.nextStep}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.nextStepText}>
                Your order is being prepared by the store(s)
              </Text>
            </View>
            <View style={styles.nextStep}>
              <Ionicons name="car-outline" size={20} color={COLORS.primary} />
              <Text style={styles.nextStepText}>
                You'll receive SMS updates when your order is ready for delivery
              </Text>
            </View>
            <View style={styles.nextStep}>
              <Ionicons name="home-outline" size={20} color={COLORS.primary} />
              <Text style={styles.nextStepText}>
                Our delivery partner will bring your order to your door
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={handleViewOrders}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
        >
          View Order History
        </Button>
        <Button
          mode="outlined"
          onPress={handleChatWithDriver}
          style={[styles.secondaryButton, styles.chatButton]}
          contentStyle={styles.buttonContent}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          Chat with Driver
        </Button>
        <Button
          mode="contained"
          onPress={handleContinueShopping}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
        >
          Continue Shopping
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
  successHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  storeGroup: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  storeSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 8,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextStepText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
    flex: 1,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    height: 48,
  },
});
