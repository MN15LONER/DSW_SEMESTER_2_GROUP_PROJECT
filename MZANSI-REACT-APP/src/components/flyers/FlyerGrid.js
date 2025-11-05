import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import FlyerCard from './FlyerCard';

export default function FlyerGrid({ stores, onStorePress }) {
  const renderStore = ({ item }) => (
    <FlyerCard 
      store={item} 
      onPress={() => onStorePress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stores}
        renderItem={renderStore}
        keyExtractor={item => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
});
