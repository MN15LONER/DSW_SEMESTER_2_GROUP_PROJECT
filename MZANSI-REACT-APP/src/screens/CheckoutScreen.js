import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Card, TextInput, RadioButton, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';
import { validators, sanitizers, validateForm, sanitizeFormData } from '../utils/validation';
import { useLocation } from '../context/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/colors';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal, getStoreGroups, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedLocation, updateLocation, updateUserLocation } = useLocation();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const storeGroups = getStoreGroups();
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 350 ? 0 : 35; // Free delivery over R350
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {

    const formData = {
      deliveryAddress: sanitizers.address(deliveryAddress),
      contactNumber: sanitizers.phone(contactNumber),
      specialInstructions: sanitizers.text(specialInstructions)
    };

    const validationRules = {
      deliveryAddress: [validators.address],
      contactNumber: [validators.phone],
      specialInstructions: [validators.specialInstructions]
    };

    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);

    if (!isValid) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setErrors({});
    setIsProcessing(true);

    try {

      const orderData = {
        userId: user?.uid || 'anonymous',
        customerName: user?.displayName || 'Customer',
        items: (cartItems || []).map(item => ({
          id: item.id || '',
          name: item.name || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          storeId: item.storeId || '',
          storeName: item.storeName || '',
          category: item.category || '',
          image: item.image || ''
        })),
        total: total || 0,
        deliveryAddress: formData.deliveryAddress || '',
        contactNumber: formData.contactNumber || '',
        paymentMethod: paymentMethod || 'cash',
        specialInstructions: formData.specialInstructions || '',
        location: selectedLocation || 'Cape Town',
        estimatedDelivery: '45-60 minutes',
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Order data being sent to Firebase:', JSON.stringify(orderData, null, 2));

      Object.entries(orderData).forEach(([key, value]) => {
        if (value === undefined) {
          console.error(`Undefined field found: ${key}`);
        }
      });

      const orderId = await firebaseService.orders.create(orderData);

      clearCart();
      navigation.replace('OrderConfirmation', {
        orderId,
        total: total,
        deliveryAddress: formData.deliveryAddress,
        storeGroups: getStoreGroups()
      });

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Order Failed', 'There was an error placing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadDefault = async () => {
      try {
        if (!user?.uid) return;

        const cached = await AsyncStorage.getItem(`default_address_${user.uid}`);
        if (cached) {
          const addr = JSON.parse(cached);
          const formatted = addr.formattedAddress || [addr.street, addr.city, addr.province].filter(Boolean).join(', ');
          if (mounted) {
            setDeliveryAddress(formatted);
            if (addr.phone) setContactNumber(addr.phone);

            if (updateLocation) updateLocation(formatted);
            if (updateUserLocation && addr.latitude && addr.longitude) updateUserLocation({ latitude: addr.latitude, longitude: addr.longitude });
          }
          return;
        }

        const addresses = await firebaseService.addresses.getByUser(user.uid);
        if (addresses && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          const formatted = defaultAddr.formattedAddress || [defaultAddr.street, defaultAddr.city, defaultAddr.province].filter(Boolean).join(', ');
          if (mounted) {
            setDeliveryAddress(formatted);
            if (defaultAddr.phone) setContactNumber(defaultAddr.phone);

            if (updateLocation) updateLocation(formatted);
            if (updateUserLocation && defaultAddr.latitude && defaultAddr.longitude) updateUserLocation({ latitude: defaultAddr.latitude, longitude: defaultAddr.longitude });
          }
        }
      } catch (error) {
        console.error('Error loading default delivery address:', error);
      }
    };

    loadDefault();
    return () => { mounted = false; };
  }, [user?.uid]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {}
        <Card style={styles.section}>
          <Card.Title title="Order Summary" />
          <Card.Content>
            {Object.entries(storeGroups).map(([storeId, group]) => (
              <View key={storeId} style={styles.storeGroup}>
                <Text style={styles.storeName}>{group.storeName}</Text>
                {group.items.map((item) => (
                  <View key={`${item.id}-${item.storeId}`} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity}x R{item.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Text style={styles.storeSubtotal}>
                  Subtotal: R{group.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {}
        <Card style={styles.section}>
          <Card.Title title="Delivery Information" />
          <Card.Content>
            <TextInput
              label="Delivery Address *"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Enter your full delivery address"
            />

            <TextInput
              label="Contact Number *"
              value={contactNumber}
              onChangeText={setContactNumber}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="e.g. 0821234567"
            />

            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>
                Delivering to: {selectedLocation}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {}
        <Card style={styles.section}>
          <Card.Title title="Payment Method" />
          <Card.Content>
            <RadioButton.Group
              onValueChange={setPaymentMethod}
              value={paymentMethod}
            >
              <View style={styles.radioOption}>
                <RadioButton value="cash" />
                <Text style={styles.radioLabel}>Cash on Delivery</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="card" />
                <Text style={styles.radioLabel}>Card on Delivery</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="eft" />
                <Text style={styles.radioLabel}>EFT (Pay Now)</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {}
        <Card style={styles.section}>
          <Card.Title title="Special Instructions (Optional)" />
          <Card.Content>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Any special delivery instructions..."
            />
          </Card.Content>
        </Card>

        {}
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>R{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee:</Text>
              <Text style={styles.totalValue}>
                {deliveryFee === 0 ? 'FREE' : `R${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            {deliveryFee === 0 && (
              <Text style={styles.freeDeliveryNote}>
                🎉 Free delivery on orders over R350!
              </Text>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>R{total.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {}
      <View style={styles.checkoutContainer}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
          loading={isProcessing}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Order...' : `Place Order - R${total.toFixed(2)}`}
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
  section: {
    margin: 16,
    marginBottom: 8,
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
  input: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  freeDeliveryNote: {
    fontSize: 12,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
  },
  placeOrderButtonContent: {
    height: 48,
  },
});
