import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  isFundStatementType,
  isGoldStatementType,
} from '../../utils/statementHistory';

let StatementSvg = null;
try {
  StatementSvg = require('../../../assets/icons/statement.svg').default;
} catch {
  StatementSvg = null;
}

const ICON_SIZE = 20;

/** Statement document — main app statement.svg (AED lines on doc) */
function StatementDocGlyph() {
  if (StatementSvg) {
    return <StatementSvg width={ICON_SIZE} height={ICON_SIZE} />;
  }
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.625 4.28125C16.4688 3.1875 15.3438 2.0625 14.1875 0.9375C13.75 0.5 13.2188 0.28125 12.5938 0.28125H4.5C2.96875 0.28125 1.78125 1.4375 1.78125 3V16.9688C1.78125 17.75 2.0625 18.4375 2.5625 18.9375C3.0625 19.4375 3.75 19.7188 4.53125 19.7188H15.4063C17 19.7188 18.1562 18.5625 18.1562 16.9688V14.5C18.1562 11.75 18.1562 8.40625 18.1562 5.65625C18.1875 5.125 18 4.65625 17.625 4.28125Z"
        fill="#FFFFFF"
      />
      <Path d="M5.03125 10.8438H14.9688V11.625H5.03125V10.8438Z" fill="#B8860B" />
      <Path d="M5.03125 13.2812H11.4062V14.0625H5.03125V13.2812Z" fill="#B8860B" />
      <Path d="M5.03125 15.75H8.5625V16.5H5.03125V15.75Z" fill="#B8860B" />
    </Svg>
  );
}

/** Gold bar stack for trade / gift transactions */
function GoldBarGlyph() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
      <Rect x="3" y="11" width="14" height="5" rx="1" fill="#FFFFFF" opacity={0.95} />
      <Rect x="4.5" y="7.5" width="11" height="4" rx="1" fill="#FFFFFF" opacity={0.85} />
      <Rect x="6" y="4.5" width="8" height="3.5" rx="1" fill="#FFFFFF" />
      <Path
        d="M6.5 6.2H13.5"
        stroke="#B8860B"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Wallet / fund for deposit & withdrawal */
function FundWalletGlyph() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.5 6.5C3.5 5.12 4.62 4 6 4H14C15.38 4 16.5 5.12 16.5 6.5V14C16.5 15.38 15.38 16.5 14 16.5H6C4.62 16.5 3.5 15.38 3.5 14V6.5Z"
        fill="#FFFFFF"
      />
      <Rect x="11" y="9" width="4.5" height="3" rx="1" fill="#B8860B" />
      <Path
        d="M6.5 8.5H10"
        stroke="#B8860B"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M6.5 11H9"
        stroke="#B8860B"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function resolveIconKind(transactionType) {
  const lower = String(transactionType || '').toLowerCase();
  if (isFundStatementType(transactionType)) {
    return 'fund';
  }
  if (isGoldStatementType(transactionType)) {
    if (lower.includes('trade') || lower.includes('gift') || lower.includes('redeem')) {
      return 'gold';
    }
  }
  return 'statement';
}

const BOX_STYLES = {
  statement: {
    backgroundColor: '#F4D287',
    borderColor: '#E3B155',
  },
  gold: {
    backgroundColor: '#F4D287',
    borderColor: '#CE9214',
  },
  fund: {
    backgroundColor: '#E8C96A',
    borderColor: '#C9A227',
  },
};

/**
 * Left list icon — statement doc (default), gold bars (trade/gift), wallet (fund).
 * Matches main app gold circular icon box (#F4D287).
 */
export default function SdkStatementListIcon({ transactionType, size = 40 }) {
  const kind = resolveIconKind(transactionType);
  const boxStyle = BOX_STYLES[kind] || BOX_STYLES.statement;

  let glyph = <StatementDocGlyph />;
  if (kind === 'gold') {
    glyph = <GoldBarGlyph />;
  } else if (kind === 'fund') {
    glyph = <FundWalletGlyph />;
  }

  return (
    <View
      style={[
        styles.box,
        boxStyle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      {glyph}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#BC8100',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
