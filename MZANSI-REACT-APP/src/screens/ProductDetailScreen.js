import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProductDetailModal from '../components/store/ProductDetailModal';
export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params || {};
  return (
    <View style={styles.container}>
      <ProductDetailModal
        visible={true}
        product={product}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});