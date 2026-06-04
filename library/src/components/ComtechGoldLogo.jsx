import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

const LOGO_JPG = require('../../assets/images/logo.jpg');
const LOGO_MARK = require('../../assets/images/logo-mark.png');

let LogoSvg = null;
try {
  LogoSvg = require('../../assets/icons/logo.svg').default;
} catch {
  LogoSvg = null;
}

const jpgMeta = Image.resolveAssetSource(LOGO_JPG);
const JPG_ASPECT =
  jpgMeta?.width && jpgMeta?.height
    ? jpgMeta.width / jpgMeta.height
    : 1814 / 542;

/**
 * Brand mark for the black header: SVG wordmark, else logo.jpg, else mark + text.
 */
export default function ComtechGoldLogo({ compact = false }) {
  const height = compact ? 32 : 38;
  const maxWidth = compact ? 160 : 190;

  if (LogoSvg) {
    const width = Math.min(maxWidth, height * 3.35);
    return (
      <View style={[styles.svgWrap, { width, height }]}>
        <LogoSvg width={width} height={height} />
      </View>
    );
  }

  const jpgWidth = Math.min(maxWidth, height * JPG_ASPECT);
  const jpgSource = Image.resolveAssetSource(LOGO_JPG);
  if (jpgSource?.uri) {
    return (
      <Image
        source={jpgSource}
        style={{ width: jpgWidth, height }}
        resizeMode="contain"
        accessibilityLabel="ComTech Gold"
      />
    );
  }

  const markSize = compact ? 28 : 32;
  return (
    <View style={styles.row}>
      <Image
        source={LOGO_MARK}
        style={{ width: markSize, height: markSize }}
        resizeMode="contain"
        accessibilityLabel="ComTech Gold"
      />
      <View style={styles.textBlock}>
        <Text style={[styles.brand, compact && styles.brandCompact]}>COMTECH</Text>
        <Text style={[styles.brandGold, compact && styles.brandGoldCompact]}>GOLD</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svgWrap: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    marginLeft: 8,
  },
  brand: {
    color: SDK_COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 15,
  },
  brandCompact: {
    fontSize: 11,
    lineHeight: 13,
  },
  brandGold: {
    color: SDK_COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 15,
  },
  brandGoldCompact: {
    fontSize: 11,
    lineHeight: 13,
  },
});
