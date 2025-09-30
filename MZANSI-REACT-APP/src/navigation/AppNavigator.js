import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import DeliveryAddressScreen from '../screens/DeliveryAddressScreen';
import AddEditAddressScreen from '../screens/AddEditAddressScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddEditPaymentMethodScreen from '../screens/AddEditPaymentMethodScreen';
import StoreMapScreen from '../screens/StoreMapScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ApiTestScreen from '../screens/ApiTestScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import ProductSearchScreen from '../screens/ProductSearchScreen';
import DailyDealsScreen from '../screens/DailyDealsScreen';
import StoreFinderScreen from '../screens/StoreFinderScreen';
import { COLORS } from '../styles/colors';

const Stack = createStackNavigator();

const MainStack = () => {
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
      <Stack.Screen 
        name="DeliveryAddress" 
        component={DeliveryAddressScreen}
        options={{ title: 'Delivery Addresses' }}
      />
      <Stack.Screen 
        name="AddEditAddress" 
        component={AddEditAddressScreen}
        options={({ route }) => ({ 
          title: route.params?.mode === 'edit' ? 'Edit Address' : 'Add Address' 
        })}
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
        options={{ title: 'Payment Methods' }}
      />
      <Stack.Screen 
        name="AddEditPaymentMethod" 
        component={AddEditPaymentMethodScreen}
        options={{
          title: 'Payment Method',
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ApiTest" 
        component={ApiTestScreen}
        options={{
          title: 'API Test',
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ProductSearch" 
        component={ProductSearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="DailyDeals" 
        component={DailyDealsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="StoreFinder" 
        component={StoreFinderScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
