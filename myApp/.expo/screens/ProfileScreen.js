import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import Background from "../components/Background";
import RoleBadge from "../components/RoleBadge";

export default function ProfileScreen() {
  const { profile } = useContext(AuthContext);
  return (
    <Background source={require("../assets/bg.jpg")}>
      <View style={styles.wrap}>
        <RoleBadge role={profile?.role} />
        <Text style={styles.h1}>Profile</Text>
        <Text style={styles.row}>Name: {profile?.name}</Text>
        <Text style={styles.row}>Email: {profile?.email}</Text>
        <Text style={styles.row}>Role: {profile?.role}</Text>
      </View>
    </Background>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center" },
  h1: { fontSize: 26, fontWeight: "800", color: "white", marginBottom: 12 },
  row: { color: "white", marginBottom: 6, fontSize: 16 },
});
