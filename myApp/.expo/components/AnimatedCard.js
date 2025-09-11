import React from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { View, StyleSheet } from "react-native";

export default function AnimatedCard({ children, delay = 0, style }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(15)}
      style={[styles.card, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "88%",
    alignSelf: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
