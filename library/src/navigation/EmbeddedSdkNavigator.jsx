import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SdkMenuProvider } from '../context/SdkMenuContext';
import { SdkToastProvider } from '../context/SdkToastContext';
import SdkSideMenu from '../components/SdkSideMenu';
import SdkGlobalListeners from '../components/SdkGlobalListeners';
import SdkBackHandler from './SdkBackHandler';
import SdkStackShell from './SdkStackShell';
import ConnectComtechScreen from '../screens/ConnectComtechScreen';
import SdkHomeScreen from '../screens/SdkHomeScreen';
import KycScreen from '../screens/KycScreen';
import KycVerificationScreen from '../screens/KycVerificationScreen';
import TradeScreen from '../screens/TradeScreen';
import BuyGoldScreen from '../screens/BuyGoldScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddFundScreen from '../screens/AddFundScreen';
import GeideaPaymentScreen from '../screens/GeideaPaymentScreen';
import FundDepositHistoryScreen from '../screens/FundDepositHistoryScreen';
import StatementHistoryScreen from '../screens/StatementHistoryScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

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
    <SdkToastProvider>
      <SdkMenuProvider>
      <View style={styles.shell}>
        <SdkGlobalListeners />
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={defaultScreenOptions}
          screenLayout={({ children }) => (
            <SdkStackShell>{children}</SdkStackShell>
          )}>
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
          <Stack.Screen name="BuyGold" component={BuyGoldScreen} />
          <Stack.Screen name="AddFund" component={AddFundScreen} />
          <Stack.Screen
            name="GeideaPayment"
            component={GeideaPaymentScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="FundDepositHistory"
            component={FundDepositHistoryScreen}
          />
          <Stack.Screen
            name="StatementHistory"
            component={StatementHistoryScreen}
          />
          <Stack.Screen name="AboutUs" component={AboutUsScreen} />
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
    </SdkToastProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
