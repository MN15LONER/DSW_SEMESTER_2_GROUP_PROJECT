import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Background from "../components/Background";

export default function SettingsScreen() {
  return (
    <Background source={require("../assets/bg.jpg")}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>Settings</Text>
        <Text style={styles.subtitle}>(we can our toggles and preferences here)</Text>
      </View>
    </Background>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center" },
  h1: { fontSize: 26, fontWeight: "800", color: "white" },
  subtitle: { color: "white", opacity: 0.9, marginTop: 6 },
});
