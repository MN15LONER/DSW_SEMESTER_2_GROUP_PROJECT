import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StoreMapView from '../components/common/StoreMapView';
import { firebaseService } from '../services/firebase';
import { mockStores } from '../data/mockData';
import { COLORS } from '../styles/colors';

export default function StoreMapScreen({ navigation, route }) {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      let storeData = await firebaseService.stores.getAll();
      
      // If no stores in Firebase, use mock data with coordinates
      if (!storeData || storeData.length === 0) {
        storeData = mockStores;
      }
      
      // Ensure all stores have coordinates
      const storesWithCoords = storeData.filter(store => 
        store.latitude && store.longitude
      );
      
      setStores(storesWithCoords);
    } catch (error) {
      console.error('Error loading stores:', error);
      Alert.alert('Error', 'Unable to load stores. Please try again.');
      setStores(mockStores.filter(store => store.latitude && store.longitude));
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setShowStoreModal(true);
  };

  const handleVisitStore = () => {
    setShowStoreModal(false);
    navigation.navigate('StoreDetail', { store: selectedStore });
  };

  const handleGetDirections = () => {
    const { latitude, longitude, name } = selectedStore;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${name}`;
    
    Alert.alert(
      'Get Directions',
      `Open directions to ${name} in Google Maps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => {
          // In a real app, you would use Linking.openURL(url)
          console.log('Opening directions:', url);
        }}
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Locations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading stores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Locations</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadStores}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <StoreMapView
        stores={stores}
        onStoreSelect={handleStoreSelect}
        selectedStore={selectedStore}
      />

      {/* Store Details Modal */}
      <Modal
        visible={showStoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStore && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedStore.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowStoreModal(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <Image
                  source={{ uri: selectedStore.image }}
                  style={styles.storeImage}
                  resizeMode="cover"
                />

                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <View style={styles.storeStatus}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: selectedStore.isOpen ? '#4CAF50' : '#F44336' }
                      ]} />
                      <Text style={styles.statusText}>
                        {selectedStore.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.rating}>{selectedStore.rating}</Text>
                      <Text style={styles.reviews}>({selectedStore.reviews})</Text>
                    </View>
                  </View>

                  <Text style={styles.category}>{selectedStore.category}</Text>
                  <Text style={styles.address}>{selectedStore.address}</Text>
                  
                  {selectedStore.phone && (
                    <Text style={styles.phone}>{selectedStore.phone}</Text>
                  )}

                  <Text style={styles.deliveryTime}>
                    Delivery: {selectedStore.deliveryTime}
                  </Text>

                  {selectedStore.description && (
                    <Text style={styles.description}>{selectedStore.description}</Text>
                  )}

                  {selectedStore.promotions && selectedStore.promotions.length > 0 && (
                    <View style={styles.promotionsSection}>
                      <Text style={styles.promotionsTitle}>Current Promotions:</Text>
                      {selectedStore.promotions.map((promotion, index) => (
                        <Text key={index} style={styles.promotion}>
                          • {promotion}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.directionsButton]}
                    onPress={handleGetDirections}
                  >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.visitButton]}
                    onPress={handleVisitStore}
                  >
                    <Ionicons name="storefront" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Visit Store</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  storeImage: {
    width: '100%',
    height: 200,
  },
  storeInfo: {
    padding: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  category: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 16,
  },
  promotionsSection: {
    marginTop: 16,
  },
  promotionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  promotion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  directionsButton: {
    backgroundColor: COLORS.secondary,
  },
  visitButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
