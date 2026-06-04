import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HostPlaceholderScreen from '../screens/HostPlaceholderScreen';
import ConnectComtechScreen from '../screens/ConnectComtechScreen';
import SdkHomeScreen from '../screens/SdkHomeScreen';
import KycScreen from '../screens/KycScreen';
import KycVerificationScreen from '../screens/KycVerificationScreen';
import TradeScreen from '../screens/TradeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddFundScreen from '../screens/AddFundScreen';
import FundDepositHistoryScreen from '../screens/FundDepositHistoryScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: '#0F1419' },
  headerTintColor: '#C9A227',
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: '#0F1419' },
};

/**
 * @param {Object} props
 * @param {React.ComponentType | undefined} props.HostScreen
 * @param {string} [props.initialRouteName]
 */
export default function SdkNavigator({
  HostScreen = HostPlaceholderScreen,
  initialRouteName = 'Host',
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={screenOptions}>
      <Stack.Screen
        name="Host"
        component={HostScreen}
        options={{ title: 'Partner App', headerShown: false }}
      />
      <Stack.Screen
        name="ConnectComtech"
        component={ConnectComtechScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LinkAccount"
        component={ConnectComtechScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SdkHome"
        component={SdkHomeScreen}
        options={{ title: 'ComTech Gold' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TradeHistory"
        component={TradeHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Kyc"
        component={KycScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Trade"
        component={TradeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BuyGold"
        component={TradeScreen}
        options={{ title: 'Buy gold' }}
      />
      <Stack.Screen
        name="AddFund"
        component={AddFundScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FundDepositHistory"
        component={FundDepositHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KycVerification"
        component={KycVerificationScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
