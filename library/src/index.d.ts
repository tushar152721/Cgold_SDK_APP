import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type ComtechGoldEnvironment = 'local' | 'demo' | 'prod';

export interface ComtechGoldUserDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface ComtechGoldInitParams {
  mobile: string;
  countryCode: string;
  loyaltyId?: string;
  partnerCode?: string;
  partnerKey?: string;
  apiKey?: string;
  secretKey?: string;
  userToken?: string;
  environment?: ComtechGoldEnvironment;
  apiBaseUrl?: string;
  userDetails?: ComtechGoldUserDetails;
  /** Default `in_app` — uses react-native-webview when installed, else system browser */
  kycOpenMode?: 'in_app' | 'external';
  onKycStarted?: (payload: {
    reference?: string | null;
    verificationUrl?: string | null;
  }) => void | Promise<void>;
}

export interface ComtechGoldConfig {
  initialized: boolean;
  mobile: string;
  countryCode: string;
  loyaltyId: string;
  partnerCode: string;
  partnerKey: string;
  userToken?: string | null;
  environment: ComtechGoldEnvironment;
  apiBaseUrl: string;
  userDetails?: ComtechGoldUserDetails;
}

export interface ComtechGoldBuyEventPayload {
  action?: 'placed' | 'executed' | 'completed' | 'failed' | 'rejected' | 'open';
  success?: boolean;
  goldGm?: number;
  status?: string;
  message?: string;
  buyGoldId?: string;
  [key: string]: unknown;
}

export interface ComtechGoldMaintenancePayload {
  enabled?: boolean;
  message?: string;
}

export interface ComtechGoldEvent {
  type: 'init' | 'register' | 'kyc' | 'buy' | 'error';
  payload?: ComtechGoldBuyEventPayload | Record<string, unknown>;
}

export interface ComtechGoldProviderProps {
  HostScreen?: ComponentType;
  onEvent?: (event: ComtechGoldEvent) => void;
  initialRouteName?: string;
  children?: React.ReactNode;
}

export interface ComtechGoldSdkProps extends ComtechGoldInitParams {
  config?: ComtechGoldInitParams;
  onEvent?: (event: ComtechGoldEvent) => void;
  onKycStarted?: ComtechGoldInitParams['onKycStarted'];
  kycOpenMode?: ComtechGoldInitParams['kycOpenMode'];
  onReady?: (config: ComtechGoldConfig | null) => void;
  onInitError?: (error: unknown) => void;
  initialRouteName?: 'ConnectComtech' | 'LinkAccount' | 'SdkHome';
  style?: StyleProp<ViewStyle>;
}

declare const ComtechGold: {
  init(params: ComtechGoldInitParams): Promise<ComtechGoldConfig>;
  restoreSession(): Promise<ComtechGoldConfig | null>;
  getConfig(): ComtechGoldConfig | null;
  isInitialized(): boolean;
  setEventListener(listener: (event: ComtechGoldEvent) => void): void;
  openLink(): void;
  openRegister(): void;
  openSdk(): void;
  openKyc(): void;
  openBuy(): void;
  logout(): Promise<void>;
};

export function ComtechGoldProvider(props: ComtechGoldProviderProps): JSX.Element;

export function ComtechGoldSdk(props: ComtechGoldSdkProps): JSX.Element;

export const Sdk: typeof ComtechGoldSdk;

export default ComtechGold;
