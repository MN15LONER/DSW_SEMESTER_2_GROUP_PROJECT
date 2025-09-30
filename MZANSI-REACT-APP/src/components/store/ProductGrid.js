// src/components/store/ProductGrid.js
import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAddToCart }) {
  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      onAddToCart={() => onAddToCart(item)}
    />
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={item => item.id}
      numColumns={2}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
});