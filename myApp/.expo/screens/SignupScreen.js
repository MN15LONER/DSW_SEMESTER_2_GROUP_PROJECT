import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import Background from "../components/Background";
import AnimatedCard from "../components/AnimatedCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const roles = ["customer", "retailer", "admin"]; 

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      if (!name || !email || !password) {
        Alert.alert("Missing fields", "Please fill all fields.");
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email: email.trim(),
        role,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Account created!");
    } catch (err) {
      Alert.alert("Signup error", err.message);
    }
  };

  return (
    <Background source={require("../assets/bg.jpg")}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <View style={styles.center}>
          <AnimatedCard delay={100}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join and pick your role</Text>

            <View style={styles.field}>
              <Ionicons name="person-outline" size={18} />
              <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} />
            </View>

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
              <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
            </View>

            {/* Simple role selector: tap cycles through roles (minimal deps) */}
            <TouchableOpacity onPress={() => {
              const idx = roles.indexOf(role);
              const next = roles[(idx + 1) % roles.length];
              setRole(next);
            }} style={styles.rolePill}>
              <Text style={styles.roleText}>Role: {role.toUpperCase()} (tap to change)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignup} activeOpacity={0.8} style={{ marginTop: 10 }}>
              <LinearGradient colors={["#34D399", "#10B981"]} style={styles.btn}>
                <Text style={styles.btnText}>Create account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 14 }}>
              <Text style={{ textAlign: "center" }}>
                Already have an account? <Text style={{ color: "#10B981", fontWeight: "700" }}>Log in</Text>
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
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 999,
  },
  roleText: { fontWeight: "700", color: "#065F46" },
  btn: { height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
