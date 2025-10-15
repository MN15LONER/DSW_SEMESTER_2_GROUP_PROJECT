import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    // If not admin (and not loading), redirect to main user stack
    if (!loading && !isAdmin) {
      // replace so user cannot go back to admin
      navigation.replace('Main');
    }
  }, [isAdmin, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome — admin-only area</Text>
      <View style={styles.actions}>
        <Button title="Upload Document" onPress={() => navigation.navigate('AdminUpload')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    marginTop: 12,
  },
});
