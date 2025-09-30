/**
 * Google Sign-In Button Component
 * 
 * A reusable button component for Google authentication.
 * Styled to match Google's brand guidelines with white background and Google logo.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Google Sign-In Button
 * @param {Function} onPress - Function to call when button is pressed
 * @param {boolean} loading - Whether the button is in loading state
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} text - Button text (default: "Sign in with Google")
 */
const GoogleSignInButton = ({ 
  onPress, 
  loading = false, 
  disabled = false,
  text = "Sign in with Google" 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#666" size="small" />
      ) : (
        <>
          {/* Google Logo Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
          </View>
          
          {/* Button Text */}
          <Text style={styles.buttonText}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 12,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;
