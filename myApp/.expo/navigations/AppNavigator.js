import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthContext } from "../contexts/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AdminDashboard from "../screens/AdminDashboard";
import CustomerHome from "../screens/CustomerHome";
import RetailerDashboard from "../screens/RetailerDashboard";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function RoleDrawer() {
  const { profile } = useContext(AuthContext);
  const role = profile?.role || "customer";

  const HomeByRole = role === "admin"
    ? AdminDashboard
    : role === "retailer"
    ? RetailerDashboard
    : CustomerHome;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="Home" component={HomeByRole} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initializing } = useContext(AuthContext);

  if (initializing) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={RoleDrawer} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
