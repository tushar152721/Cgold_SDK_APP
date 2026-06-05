import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function AboutMissionVision({
  image1,
  image2,
  title1,
  title2,
  description,
}) {
  return (
    <View style={styles.container}>
      <Image source={image1} style={styles.heroImage} resizeMode="contain" />
      <View style={styles.spacerSm} />

      <View style={styles.titleWrap}>
        <Image source={image2} resizeMode="contain" />
        <Text style={styles.title}>
          {title1} <Text style={styles.titleGold}>{title2}</Text>
        </Text>
      </View>

      <View style={styles.spacerXs} />
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#F9D58C',
  },
  heroImage: {
    alignSelf: 'center',
    height: 200,
    width: 196,
  },
  spacerSm: {
    height: 10,
  },
  spacerXs: {
    height: 6,
  },
  titleWrap: {
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginTop: -13,
  },
  titleGold: {
    color: SDK_COLORS.primary,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: SDK_COLORS.textMutedDark,
  },
});
