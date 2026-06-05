import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SDK_COLORS } from '../../constants';
import { ABOUT_US_TAGLINE } from '../../constants/aboutUs';
import { ABOUT_ASSETS } from '../../constants/aboutAssets';

export default function AboutUsHero() {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <ImageBackground
      source={ABOUT_ASSETS.heroBg}
      style={[styles.hero, { width: screenWidth }]}
      imageStyle={styles.heroImage}
      resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />

      <View style={styles.content}>
        <Text style={styles.title}>
          About <Text style={styles.titleGold}>us</Text>
        </Text>
        <View style={styles.taglineGap} />
        <Text style={styles.tagline}>
          {ABOUT_US_TAGLINE.line1}
          <Text style={styles.taglineWhite}>{ABOUT_US_TAGLINE.line1Highlight}</Text>
          {ABOUT_US_TAGLINE.line2}
          <Text style={styles.taglineWhite}>{ABOUT_US_TAGLINE.line2Highlight}</Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 310,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 3, 20, 0.12)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: SDK_COLORS.text,
    textAlign: 'center',
  },
  titleGold: {
    color: SDK_COLORS.primary,
  },
  taglineGap: {
    height: 7,
  },
  tagline: {
    fontSize: 16,
    color: SDK_COLORS.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  taglineWhite: {
    color: SDK_COLORS.text,
  },
});
