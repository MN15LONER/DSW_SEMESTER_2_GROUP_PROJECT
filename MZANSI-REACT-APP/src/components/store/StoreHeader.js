import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageWithFallback from '../common/ImageWithFallback';
import { getImageForProduct } from '../../utils/imageHelper';
import { COLORS } from '../../styles/colors';

const { width } = Dimensions.get('window');

export default function StoreHeader({ store }) {

  let localLogo = null;
  if (store && store.name) {
    const name = store.name.toLowerCase();
    if (name.includes('pick')) localLogo = require('../../../assets/images/Store_Logos/Pick_N_Pay.jpg');
    else if (name.includes('mr')) localLogo = require('../../../assets/images/Store_Logos/Mr-Price-logo.jpg');
    else if (name.includes('incredible')) localLogo = require('../../../assets/images/Store_Logos/Incredible_connections.png');
  }

  const src = localLogo ? localLogo : { uri: store.flyerImage || store.image || getImageForProduct({ name: store.name, category: store.category }) };

  return (
    <View style={styles.container}>
      <ImageWithFallback source={src} style={styles.storeImage} resizeMode={localLogo ? 'contain' : 'cover'} />
      <View style={styles.overlay}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeDescription}>{store.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    position: 'relative',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
});
