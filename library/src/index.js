import ComtechGold from './ComtechGold';
import ComtechGoldProvider from './provider/ComtechGoldProvider';
import ComtechGoldSdk from './ComtechGoldSdk';
import SdkNavigator from './navigation/SdkNavigator';
import EmbeddedSdkNavigator from './navigation/EmbeddedSdkNavigator';
import RegisterEntryScreen from './screens/RegisterEntryScreen';
import SdkHomeScreen from './screens/SdkHomeScreen';
import KycScreen from './screens/KycScreen';
import BuyGoldScreen from './screens/BuyGoldScreen';
import TradeHistoryScreen from './screens/TradeHistoryScreen';
import AddFundScreen from './screens/AddFundScreen';
import FundDepositHistoryScreen from './screens/FundDepositHistoryScreen';

export {
  ComtechGold,
  ComtechGoldProvider,
  ComtechGoldSdk,
  SdkNavigator,
  EmbeddedSdkNavigator,
  RegisterEntryScreen,
  SdkHomeScreen,
  KycScreen,
  BuyGoldScreen,
  TradeHistoryScreen,
  AddFundScreen,
  FundDepositHistoryScreen,
};

/** Drop-in component — init, navigation, register, KYC, and buy handled internally. */
export const Sdk = ComtechGoldSdk;

export default ComtechGold;
