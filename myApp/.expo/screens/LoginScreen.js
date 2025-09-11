import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Background from "../components/Background";
import AnimatedCard from "../components/AnimatedCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Missing fields", "Please enter email and password.");
        return;
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      Alert.alert("Login error", err.message);
    }
  };

  return (
    <Background source={require("../assets/bg.jpg")}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <View style={styles.center}>
          <AnimatedCard delay={100}>
            <Text style={styles.title}>Welcome To Mzansi's No.1 Retail Plug</Text>
            <Text style={styles.subtitle}>Log in to continue</Text>

            <View style={styles.field}>
              <Ionicons name="mail-outline" size={18} />
              <TextInput
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} />
              <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={{ marginTop: 10 }}>
              <LinearGradient colors={["#44efdbff", "#44efdbff"]} style={styles.btn}>
                <Text style={styles.btnText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={{ marginTop: 14 }}>
              <Text style={{ textAlign: "center" }}>
                Don’t have an account? <Text style={{ color: "#44efdbff", fontWeight: "700" }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </AnimatedCard>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4, color: "#0B1221" },
  subtitle: { color: "#334155", marginBottom: 16 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    marginBottom: 10,
  },
  input: { flex: 1 },
  btn: { height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
