import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiTestComponent from '../components/common/ApiTestComponent';
import { COLORS } from '../styles/colors';
export default function ApiTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ApiTestComponent />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});