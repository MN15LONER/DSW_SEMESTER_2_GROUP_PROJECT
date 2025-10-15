import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import NetworkStatus from './src/components/common/NetworkStatus';
import { theme } from './src/styles/globalStyles';
import { seedFirebaseData } from './src/utils/seedFirebase.js';

export default function App() {
  
  useEffect(() => {
    const shouldSeed = process.env.EXPO_PUBLIC_SEED_ON_START === 'true';
    if (shouldSeed) {
      seedFirebaseData();
    }
  }, []);
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <FavoritesProvider>
                  <NavigationContainer>
                    <NetworkStatus />
                    <AppNavigator />
                    <StatusBar style="auto" />
                  </NavigationContainer>
                </FavoritesProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}