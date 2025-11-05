import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
export default function ErrorMessage({ 
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
  showRetry = true,
  icon = 'alert-circle-outline',
  style
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={60} color={COLORS.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {showRetry && onRetry && (
        <Button
          mode="outlined"
          onPress={onRetry}
          style={styles.retryButton}
        >
          Try Again
        </Button>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    borderColor: COLORS.primary,
  },
});