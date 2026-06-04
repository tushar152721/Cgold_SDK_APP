import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SDK_COLORS } from '../constants';
import { useSdkMenu } from '../context/SdkMenuContext';

const MENU_ITEMS = [
  { key: 'SdkHome', label: 'Dashboard', subtitle: 'Balances & buy gold' },
  { key: 'Profile', label: 'Profile', subtitle: 'Account & holdings' },
  { key: 'TradeHistory', label: 'Trade history', subtitle: 'Past point purchases' },
  { key: 'Kyc', label: 'KYC details', subtitle: 'Verification status' },
];

/**
 * In-tree overlay (not Modal) so the drawer stays inside the SDK view only.
 */
export default function SdkSideMenu() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.82, 320);
  const { visible, menuScope, currentRoute, closeMenu, navigateFromMenu } =
    useSdkMenu();

  if (!menuScope || !visible) {
    return null;
  }

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={closeMenu} />
      <View
        style={[
          styles.panel,
          {
            width: panelWidth,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Menu</Text>
          <TouchableOpacity
            onPress={closeMenu}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close menu">
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {MENU_ITEMS.map(item => {
          const active = currentRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, active && styles.itemActive]}
              onPress={() => navigateFromMenu(item.key)}
              activeOpacity={0.75}>
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                {item.label}
              </Text>
              <Text style={styles.itemSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  panel: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(201, 162, 39, 0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 162, 39, 0.25)',
  },
  panelTitle: {
    color: SDK_COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: SDK_COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemActive: {
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
    borderBottomColor: 'rgba(201, 162, 39, 0.2)',
  },
  itemLabel: {
    color: SDK_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemLabelActive: {
    color: SDK_COLORS.primary,
  },
  itemSub: {
    color: SDK_COLORS.textMuted,
    fontSize: 13,
  },
});
