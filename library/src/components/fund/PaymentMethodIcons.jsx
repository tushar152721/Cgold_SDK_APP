import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { SDK_COLORS } from '../../constants';

const SIZE = 30;

function IconCanvas({ children, selected }) {
  return (
    <View style={[styles.canvas, !selected && styles.canvasMuted]} pointerEvents="none">
      {children}
    </View>
  );
}

/** Gold stacked card — matches ComTech brand tiles */
export function CardPaymentIcon({ selected = true }) {
  return (
    <IconCanvas selected={selected}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 30 30">
        <Rect x="4" y="11" width="22" height="13" rx="2" fill="#D1D5DB" />
        <Rect
          x="4"
          y="7"
          width="22"
          height="13"
          rx="2"
          fill={selected ? SDK_COLORS.primary : '#C4B896'}
        />
        <Rect x="7" y="10" width="7" height="4.5" rx="0.8" fill="#FFF8E7" />
        <Rect x="7" y="15.5" width="12" height="1.2" rx="0.6" fill="#1A1A1A" opacity={0.25} />
      </Svg>
    </IconCanvas>
  );
}

/** Google Pay — full-color G (brand) */
export function GooglePayIcon({ selected = true }) {
  return (
    <IconCanvas selected={selected}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 48 48">
        <Path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <Path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <Path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <Path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </Svg>
    </IconCanvas>
  );
}

/** Apple — grey when idle, black when selected */
export function ApplePayIcon({ selected = true }) {
  const fill = selected ? '#1A1A1A' : '#9CA3AF';
  return (
    <IconCanvas selected={selected}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
        <Path
          fill={fill}
          d="M17.05 20.28c-.98 1.16-2.03 2.28-3.75 2.28-1.58 0-2.6-1.12-4.35-1.12-1.8 0-2.98 1.14-4.52 1.14-1.75 0-2.95-1.14-4.08-3.31-2.51-4.56 1.19-10.06 5.65-10.33 1.55-.09 2.94 1.04 3.93 1.04.95 0 2.77-1.28 4.68-1.09.8.03 3.05.32 4.49 2.44-3.87 2.33-3.25 7.14 2.98 8.44zM12.03 7.25c.73-.88 1.23-2.1 1.09-3.33-1.06.04-2.33.71-3.09 1.59-.68.78-1.27 2.05-1.11 3.26 1.18.09 2.38-.6 3.11-1.52z"
        />
      </Svg>
    </IconCanvas>
  );
}

/** Direct transfer — filled gold bank (same visual weight as card icon) */
export function DirectTransferIcon({ selected = true }) {
  const gold = selected ? SDK_COLORS.primary : '#C4B896';
  const dark = selected ? SDK_COLORS.primaryDark : '#9A7B1A';
  return (
    <IconCanvas selected={selected}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 30 30">
        <Path d="M3 15h24v11H3V15z" fill={gold} />
        <Path d="M5 15V11l10-5 10 5v4" fill={dark} />
        <Rect x="8" y="18" width="3.5" height="6" rx="0.5" fill="#FFF8E7" />
        <Rect x="13.25" y="18" width="3.5" height="6" rx="0.5" fill="#FFF8E7" />
        <Rect x="18.5" y="18" width="3.5" height="6" rx="0.5" fill="#FFF8E7" />
        <Circle cx="23" cy="9" r="4.5" fill={dark} />
        <Path
          d="M21.2 9h3.6M23 7.2v3.6"
          stroke="#FFF8E7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </Svg>
    </IconCanvas>
  );
}

const ICON_MAP = {
  card: CardPaymentIcon,
  google: GooglePayIcon,
  apple: ApplePayIcon,
  transfer: DirectTransferIcon,
};

export function PaymentMethodIcon({ type, selected = false }) {
  const Component = ICON_MAP[type] || DirectTransferIcon;
  return <Component selected={selected} />;
}

const styles = StyleSheet.create({
  canvas: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasMuted: {
    opacity: 0.72,
  },
});
