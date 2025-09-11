import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { theme } from './src/styles/globalStyles';
import { useEffect } from 'react';
import { seedFirebaseData } from './utils/seedFirebase';

export default function App() {
  
  useEffect(() => {
    seedFirebaseData();
  }, []);
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <LocationProvider>
          <CartProvider>
            <FavoritesProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </FavoritesProvider>
            </CartProvider>
          </LocationProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}