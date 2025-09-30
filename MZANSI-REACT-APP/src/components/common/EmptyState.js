import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

const EmptyState = ({ 
  icon = "basket-outline", 
  title = "Nothing here yet", 
  message = "Items will appear here when available",
  actionText,
  onAction,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={80} color={COLORS.lightGray} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <Button
          mode="outlined"
          onPress={onAction}
          style={styles.actionButton}
          labelStyle={styles.actionButtonText}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.primary,
  },
});

export default EmptyState;
