import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SdkMenuProvider } from '../context/SdkMenuContext';
import SdkSideMenu from '../components/SdkSideMenu';
import SdkBackHandler from './SdkBackHandler';
import ConnectComtechScreen from '../screens/ConnectComtechScreen';
import SdkHomeScreen from '../screens/SdkHomeScreen';
import KycScreen from '../screens/KycScreen';
import KycVerificationScreen from '../screens/KycVerificationScreen';
import TradeScreen from '../screens/TradeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#F5F0E6' },
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  animation: 'slide_from_right',
};

export default function EmbeddedSdkNavigator({
  initialRouteName = 'ConnectComtech',
}) {
  return (
    <SdkMenuProvider>
      <View style={styles.shell}>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={defaultScreenOptions}>
          <Stack.Screen
            name="ConnectComtech"
            component={ConnectComtechScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="LinkAccount"
            component={ConnectComtechScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="SdkHome"
            component={SdkHomeScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="TradeHistory" component={TradeHistoryScreen} />
          <Stack.Screen name="Kyc" component={KycScreen} />
          <Stack.Screen name="Trade" component={TradeScreen} />
          <Stack.Screen name="BuyGold" component={TradeScreen} />
          <Stack.Screen
            name="KycVerification"
            component={KycVerificationScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
        <SdkBackHandler />
        <SdkSideMenu />
      </View>
    </SdkMenuProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: 'hidden',
  },
});
