import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

export default function AdminDashboard() {
  const { isAdmin, loading, logout } = useAuth();
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
        <View style={{ height: 12 }} />
        <Button title="Sign Out" color="#d9534f" onPress={async () => {
          try {
            const result = await logout();
            if (!result || !result.success) {
              Alert.alert('Sign out failed', result?.error || 'Please try again');
            }
          } catch (err) {
            console.error('Sign out error', err);
            Alert.alert('Sign out failed', err.message || String(err));
          }
        }} />
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
