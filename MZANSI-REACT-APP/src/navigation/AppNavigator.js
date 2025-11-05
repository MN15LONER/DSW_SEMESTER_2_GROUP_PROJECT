import React, { useEffect } from 'react';
import { logInfo } from '../utils/errorLogger';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import AdminStack from './AdminStack';
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
import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
// New driver and chat screens
import DriverLoginScreen from '../screens/auth/DriverLoginScreen';
import DriverDashboard from '../screens/DriverDashboard';
import DriverChat from '../screens/DriverChat';
import CustomerChat from '../screens/CustomerChat';
import StockManagementScreen from '../screens/StockManagementScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import LeafletBrowserScreen from '../screens/LeafletBrowserScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { COLORS } from '../styles/colors';

const Stack = createStackNavigator();

const DriverStack = () => {
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
        name="DriverDashboard" 
        component={DriverDashboard}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="DriverChat" 
        component={DriverChat}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const MainStack = React.memo(() => {
  const { user } = useAuth();
  
  logInfo('MainStack', `render - userType: ${user?.userType}`);
  
  return (
    <Stack.Navigator
      initialRouteName="Main"
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
      {/* Compatibility route: allow actions that directly target 'Home' to be handled */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      {/* Driver and Chat Screens */}
      <Stack.Screen 
        name="DriverLogin" 
        component={DriverLoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="DriverDashboard" 
        component={DriverDashboard}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="DriverChat" 
        component={DriverChat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="CustomerChat" 
        component={CustomerChat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="StockManagement" 
        component={StockManagementScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Leaflets"
        component={LeafletBrowserScreen}
        options={{
          title: 'Browse Leaflets',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
});

export default function AppNavigator() {
  const { isAuthenticated, initializing, user, isAdmin } = useAuth();

  logInfo('AppNavigator', `render - isAuthenticated:${isAuthenticated} initializing:${initializing} userType:${user?.userType} isAdmin:${isAdmin}`);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Check authentication first
  if (!isAuthenticated) return <AuthStack />;

  // If authenticated, check user type in priority order
  // Admin takes precedence
  if (isAdmin) {
    logInfo('AppNavigator', 'Rendering AdminStack for admin');
    return <AdminStack />;
  }

  // Then check for driver
  if (user?.userType === 'driver') {
    logInfo('AppNavigator', 'Rendering DriverStack for driver');
    return <DriverStack />;
  }

  // Default authenticated user (regular user)
  logInfo('AppNavigator', 'Rendering MainStack for regular user');
  return <MainStack />;
}