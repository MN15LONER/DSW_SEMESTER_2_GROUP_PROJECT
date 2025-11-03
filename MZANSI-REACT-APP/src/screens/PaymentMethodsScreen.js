import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, FAB, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentMethodsScreen({ navigation }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Reload on focus (after returning from add/edit screens)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPaymentMethods();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        // Try Firebase first
        const firebaseMethods = await firebaseService.paymentMethods.getByUser(user.uid);
        if (firebaseMethods.length > 0) {
          setPaymentMethods(firebaseMethods);
          // Also save to AsyncStorage as backup
          await AsyncStorage.setItem(`paymentMethods_${user.uid}`, JSON.stringify(firebaseMethods));
        } else {
          // Fallback to AsyncStorage
          const savedMethods = await AsyncStorage.getItem(`paymentMethods_${user.uid}`);
          if (savedMethods) {
            setPaymentMethods(JSON.parse(savedMethods));
          }
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback to AsyncStorage on Firebase error
      try {
        const savedMethods = await AsyncStorage.getItem(`paymentMethods_${user?.uid}`);
        if (savedMethods) {
          setPaymentMethods(JSON.parse(savedMethods));
        }
      } catch (asyncError) {
        console.error('Error loading from AsyncStorage:', asyncError);
      }
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethodToFirebase = async (methodData, isUpdate = false, methodId = null) => {
    try {
      if (isUpdate && methodId) {
        await firebaseService.paymentMethods.update(methodId, methodData);
      } else {
        const newMethodId = await firebaseService.paymentMethods.create(user.uid, methodData);
        return newMethodId;
      }
    } catch (error) {
      console.error('Firebase save error:', error);
      // Continue with local storage as fallback
    }
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddEditPaymentMethod', { mode: 'add' });
  };

  const handleEditPaymentMethod = (method) => {
    navigation.navigate('AddEditPaymentMethod', { mode: 'edit', paymentMethod: method });
  };

  const handleDeletePaymentMethod = (methodId) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Firebase
              await firebaseService.paymentMethods.delete(methodId);
              
              const updatedMethods = paymentMethods.filter(pm => pm.id !== methodId);
              setPaymentMethods(updatedMethods);
              
              // Update AsyncStorage
              await AsyncStorage.setItem(`paymentMethods_${user.uid}`, JSON.stringify(updatedMethods));
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === methodId
      }));
      
      // Update all payment methods in Firebase
      for (const pm of updatedMethods) {
        await savePaymentMethodToFirebase({ isDefault: pm.isDefault }, true, pm.id);
      }
      
      setPaymentMethods(updatedMethods);
      
      // Save to AsyncStorage as backup
      await AsyncStorage.setItem(`paymentMethods_${user.uid}`, JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method. Please try again.');
    }
  };

  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'american express':
        return 'card';
      default:
        return 'credit-card';
    }
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const renderPaymentMethodCard = (method) => (
    <Card key={method.id} style={styles.methodCard}>
      <Card.Content>
        <View style={styles.methodHeader}>
          <View style={styles.methodInfo}>
            <View style={styles.cardTypeRow}>
              <Ionicons name={getCardIcon(method.type)} size={24} color={COLORS.primary} />
              <Text style={styles.cardType}>{method.type}</Text>
              {method.isDefault && (
                <Chip style={styles.defaultChip} textStyle={styles.defaultChipText}>
                  Default
                </Chip>
              )}
            </View>
            <Text style={styles.cardNumber}>{maskCardNumber(method.cardNumber)}</Text>
            <Text style={styles.cardHolder}>{method.cardholderName}</Text>
            <Text style={styles.expiryDate}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
          </View>
          <View style={styles.methodActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPaymentMethod(method)}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePaymentMethod(method.id)}
            >
              <Ionicons name="trash" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {!method.isDefault && (
          <Button
            mode="outlined"
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(method.id)}
          >
            Set as Default
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Payment Methods</Text>
      <Text style={styles.emptySubtitle}>
        Add your payment methods for faster and secure checkout
      </Text>
      <Button
        mode="contained"
        style={styles.addFirstMethodButton}
        onPress={handleAddPaymentMethod}
      >
        Add Your First Card
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paymentMethods.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.headerText}>
            Manage your payment methods for secure transactions
          </Text>
          {paymentMethods.map(renderPaymentMethodCard)}
        </ScrollView>
      )}
      
      {paymentMethods.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleAddPaymentMethod}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  methodCard: {
    marginBottom: 16,
    elevation: 2,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodInfo: {
    flex: 1,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
    marginRight: 8,
  },
  defaultChip: {
    backgroundColor: COLORS.success,
    height: 24,
  },
  defaultChipText: {
    color: COLORS.white,
    fontSize: 12,
  },
  cardNumber: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  cardHolder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  expiryDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  methodActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  setDefaultButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  addFirstMethodButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});
