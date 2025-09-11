import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

const { width } = Dimensions.get('window');

export default function FlyerCard({ store, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Store Image/Flyer */}
      <Image 
        source={{ uri: store.flyerImage }} 
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
          <Image 
            source={{ uri: store.image }} 
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