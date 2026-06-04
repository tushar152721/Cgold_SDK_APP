import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useSyncSdkRoute from '../hooks/useSyncSdkRoute';
import ComtechGoldLogo from './ComtechGoldLogo';
import { SDK_COLORS } from '../constants';
import { useSdkMenuOptional } from '../context/SdkMenuContext';
import useSdkHeaderOptions from '../hooks/useSdkHeaderOptions';

const HEADER_BG = '#000000';

function MenuIcon() {
  return (
    <View style={styles.menuIcon}>
      <View style={styles.menuLine} />
      <View style={[styles.menuLine, styles.menuLineMid]} />
      <View style={styles.menuLine} />
    </View>
  );
}

/**
 * Black app bar: logo left, menu right. Back + gold title on inner screens.
 */
export default function ComtechGoldHeader({
  compact = true,
  showMenu: showMenuProp,
  showBack: showBackProp,
  pageTitle: pageTitleProp,
  onBack,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const menu = useSdkMenuOptional();
  const derived = useSdkHeaderOptions();
  useSyncSdkRoute();

  const showMenu = showMenuProp ?? derived.showMenu;
  const showBack = showBackProp ?? derived.showBack;
  const pageTitle = pageTitleProp ?? derived.pageTitle;
  const menuEnabled = showMenu && menu?.menuScope === true;
  const showCurrencyPill = menuEnabled && route.name === 'SdkHome';

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('SdkHome');
  };

  const showSubBar = showBack || Boolean(pageTitle);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bar,
          { paddingTop: insets.top + (compact ? 8 : 10) },
        ]}>
        <View style={styles.barInner}>
          <View style={styles.logoWrap}>
            <ComtechGoldLogo compact={compact} />
          </View>

         

          {menuEnabled ? (
            <TouchableOpacity
              onPress={menu.openMenu}
              style={styles.menuBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Open menu"
              accessibilityRole="button">
              <MenuIcon />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showSubBar ? (
        <View style={styles.subBar}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Go back">
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          {pageTitle ? (
            <Text style={styles.pageTitle} numberOfLines={1}>
              {pageTitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: HEADER_BG,
  },
  bar: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 162, 39, 0.25)',
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    flex: 1,
    minWidth: 120,
    marginRight: 8,
    justifyContent: 'center',
  },
  aedPill: {
    backgroundColor: SDK_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  aedPillText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuIcon: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: SDK_COLORS.primary,
  },
  menuLineMid: {
    width: '78%',
    alignSelf: 'flex-end',
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SDK_COLORS.backgroundCream,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SDK_COLORS.borderCream,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 8,
  },
  backChevron: {
    fontSize: 32,
    lineHeight: 34,
    color: SDK_COLORS.textDark,
    fontWeight: '300',
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: SDK_COLORS.primary,
    marginLeft: 4,
  },
});
