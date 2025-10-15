import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUploadScreen from '../screens/admin/AdminUploadScreen';
import { View, Text } from 'react-native';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin' }} />
      <Stack.Screen name="AdminUpload" component={AdminUploadScreen} options={{ title: 'Upload Document' }} />
    </Stack.Navigator>
  );
}
