import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from 'react-native';
import { SDK_COLORS } from '../../constants';
import {
  ABOUT_SOCIAL_LINKS,
  ABOUT_QUICK_LINKS,
  ABOUT_APP_BLURB,
} from '../../constants/aboutUs';
import { ABOUT_ASSETS } from '../../constants/aboutAssets';

async function openUrl(url, label) {
  try {
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    } else {
      Alert.alert(label, url);
    }
  } catch {
    Alert.alert(label, url);
  }
}

export default function AboutUsFooter() {
  return (
    <View style={styles.container}>
      <Image source={ABOUT_ASSETS.aboutLogo} style={styles.logo} resizeMode="contain" />

      <View style={styles.socialRow}>
        {ABOUT_SOCIAL_LINKS.map(link => (
          <TouchableOpacity
            key={link.id}
            style={styles.socialBtn}
            onPress={() => openUrl(link.url, link.label)}
            activeOpacity={0.85}
            accessibilityLabel={link.label}>
            <Image source={link.icon} style={styles.socialIcon} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.quickTitle}>Quick Links</Text>
      {ABOUT_QUICK_LINKS.map(link => (
        <TouchableOpacity
          key={link.id}
          onPress={() => openUrl(link.url, link.label)}
          activeOpacity={0.85}>
          <Text style={styles.quickLink}>{link.label}</Text>
        </TouchableOpacity>
      ))}

      <Image source={ABOUT_ASSETS.mobileArt} style={styles.mobileArt} resizeMode="contain" />

      <Text style={styles.inApp}>In App</Text>
      <Text style={styles.headline}>Middle East's Premier</Text>
      <Text style={styles.headline}>
        Destination for{' '}
        <Text style={styles.headlineGold}>Digital Gold</Text>
      </Text>

      <Text style={styles.blurb}>{ABOUT_APP_BLURB}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#090314',
    paddingHorizontal: 16,
    paddingVertical: 44,
    marginTop: 8,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 24,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
  },
  socialBtn: {
    marginRight: 9,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  quickTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: SDK_COLORS.primaryLight,
    marginBottom: 24,
  },
  quickLink: {
    fontSize: 20,
    color: SDK_COLORS.text,
    marginBottom: 12,
  },
  mobileArt: {
    alignSelf: 'center',
    height: 342,
    width: 347,
    maxWidth: '100%',
    marginTop: 48,
    marginBottom: 21,
  },
  inApp: {
    fontSize: 14,
    fontWeight: '600',
    color: SDK_COLORS.primaryLight,
    marginBottom: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: SDK_COLORS.text,
    lineHeight: 32,
  },
  headlineGold: {
    color: SDK_COLORS.primary,
  },
  blurb: {
    marginTop: 24,
    fontSize: 12,
    lineHeight: 18,
    color: SDK_COLORS.text,
  },
});
