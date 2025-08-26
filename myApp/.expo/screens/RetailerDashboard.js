import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import Background from "../components/Background";
import RoleBadge from "../components/RoleBadge";

export default function RetailerDashboard() {
  const { profile, logout } = useContext(AuthContext);
  return (
    <Background source={require("../assets/bg.jpg")}>
      <View style={styles.wrap}>
        <RoleBadge role={profile?.role} />
        <Text style={styles.h1}>Retailer Dashboard</Text>
        <Text style={styles.subtitle}>Hello {profile?.name || "Retailer"} 🛍️</Text>
        <TouchableOpacity onPress={logout} style={styles.logout}>
          <Text style={{ color: "white", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center" },
  h1: { fontSize: 26, fontWeight: "800", color: "white" },
  subtitle: { color: "white", opacity: 0.9, marginTop: 6, marginBottom: 16 },
  logout: { alignSelf: "flex-start", backgroundColor: "#44efdbff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
});
