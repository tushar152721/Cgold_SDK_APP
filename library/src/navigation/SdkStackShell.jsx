import React from 'react';
import { View, StyleSheet } from 'react-native';
import SdkMenuRouteSync from '../components/SdkMenuRouteSync';

/**
 * Wraps stack screens so menu route sync runs on every screen without duplicating headers.
 */
export default function SdkStackShell({ children }) {
  return (
    <View style={styles.shell}>
      <SdkMenuRouteSync />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
