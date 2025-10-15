import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import ImageWithFallback from '../common/ImageWithFallback';
import { getImageForProduct } from '../../utils/imageHelper';

// Local logo assets for featured brands
const localLogos = {
  'pick n pay': require('../../../assets/images/Store_Logos/Pick_N_Pay.jpg'),
  'mr price': require('../../../assets/images/Store_Logos/Mr-Price-logo.jpg'),
  'incredible connection': require('../../../assets/images/Store_Logos/Incredible_connections.png'),
};

const getLocalLogoForStore = (store) => {
  if (!store || !store.name) return null;
  const name = store.name.toLowerCase();
  if (name.includes('pick')) return localLogos['pick n pay'];
  if (name.includes('mr')) return localLogos['mr price'];
  if (name.includes('incredible')) return localLogos['incredible connection'];
  return null;
};

const { width } = Dimensions.get('window');

export default function FlyerCard({ store, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Store Image/Flyer */}
      <ImageWithFallback
        source={
          getLocalLogoForStore(store) || { uri: store.flyerImage || store.image || getImageForProduct({ name: store.name, category: store.category }) }
        }
        style={styles.flyerImage}
        resizeMode="cover"
      />
      
      {/* Special Badge */}
      {store.promotions && store.promotions.length > 0 && (
        <View style={styles.specialBadge}>
          <Text style={styles.specialText}>SPECIAL</Text>
        </View>
      )}

      {/* Store Info */}
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <ImageWithFallback
            source={ getLocalLogoForStore(store) || { uri: store.image || getImageForProduct({ name: store.name, category: store.category }) } }
            style={styles.storeLogo}
            resizeMode="cover"
          />
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeCategory}>{store.category}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rating}>{store.rating}</Text>
              <Text style={styles.reviewCount}>({store.reviews} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: store.isOpen ? COLORS.success : COLORS.error }
            ]} />
            <Text style={styles.statusText}>
              {store.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <Ionicons name="time-outline" size={16} color={COLORS.gray} />
          <Text style={styles.deliveryText}>
            Delivery: {store.deliveryTime}
          </Text>
        </View>

        {/* Top Promotion Preview */}
        {store.promotions && store.promotions[0] && (
          <View style={styles.promotionPreview}>
            <Ionicons name="pricetag" size={14} color={COLORS.success} />
            <Text style={styles.promotionText} numberOfLines={1}>
              {store.promotions[0]}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Store & Deals</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  flyerImage: {
    width: '100%',
    height: 180,
  },
  specialBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  specialText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeInfo: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
  promotionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  promotionText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});