import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { COLORS } from '../styles/colors';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StoreDetail" 
        component={StoreDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.storeName || 'Store Details' 
        })}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="OrderConfirmation" 
        component={OrderConfirmationScreen}
        options={{ title: 'Order Confirmed', headerLeft: null }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
      />
    </Stack.Navigator>
  );
}
