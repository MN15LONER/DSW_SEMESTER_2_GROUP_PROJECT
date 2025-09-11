import React from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

export default function Background({ children, source }) {
  return (
    <ImageBackground
      source={source}
      style={styles.bg}
      imageStyle={{ opacity: 0.85 }}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
});
