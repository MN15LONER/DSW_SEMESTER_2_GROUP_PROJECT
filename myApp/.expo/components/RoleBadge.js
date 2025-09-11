import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RoleBadge({ role = "customer" }) {
  const color =
    role === "admin" ? "#F97316" : role === "retailer" ? "#22C55E" : "#01abfaff";
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{role.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  text: { color: "white", fontWeight: "700", fontSize: 12, letterSpacing: 1 },
});
