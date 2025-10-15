// src/components/store/ProductGrid.js
import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  onAddToCart,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  extraData,
  ListHeaderComponentStyle,
  contentContainerStyle,
}) {
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
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponentStyle={ListHeaderComponentStyle}
      extraData={extraData}
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
  // intentionally minimal styles here; container styles can be passed in via props
});