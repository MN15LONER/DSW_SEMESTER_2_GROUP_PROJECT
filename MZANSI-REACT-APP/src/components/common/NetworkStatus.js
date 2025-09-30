import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = new Animated.Value(-50);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        
        if (!connected) {
          // Show offline banner
          setShowBanner(true);
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          // Hide banner after showing "back online" briefly
          setTimeout(() => {
            Animated.timing(slideAnim, {
              toValue: -50,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setShowBanner(false));
          }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  if (!showBanner) return null;

  return (
    <Animated.View 
      style={[
        styles.banner, 
        { 
          backgroundColor: isConnected ? COLORS.success : COLORS.error,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Ionicons 
        name={isConnected ? "wifi" : "wifi-off"} 
        size={16} 
        color="white" 
      />
      <Text style={styles.text}>
        {isConnected ? 'Back online' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default NetworkStatus;
