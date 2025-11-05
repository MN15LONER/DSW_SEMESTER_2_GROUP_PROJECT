import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { listLeaflets } from '../services/localLeafletsService';
import { COLORS } from '../styles/colors';

export default function LeafletBrowserScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await listLeaflets();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.fileUri }} style={styles.image} />
      <View style={styles.meta}>
        <Text style={styles.title}>{item.title || 'Untitled'}</Text>
        {!!item.notes && <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>}
        <Text style={styles.sub}>Type: {item.docType || 'photo'}</Text>
        <Text style={styles.sub}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.empty}> 
          <Text style={styles.emptyText}>No leaflets yet. Ask an admin to add one.</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}><Text style={styles.refreshText}>Refresh</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 12 },
  card: { backgroundColor: COLORS.white, marginBottom: 12, borderRadius: 10, overflow: 'hidden', elevation: 2 },
  image: { width: '100%', height: 220 },
  meta: { padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  notes: { fontSize: 14, color: COLORS.gray, marginBottom: 6 },
  sub: { fontSize: 12, color: COLORS.grayDark },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: COLORS.gray, marginBottom: 12 },
  refreshBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 8 },
  refreshText: { color: '#fff', fontWeight: '600' },
});


