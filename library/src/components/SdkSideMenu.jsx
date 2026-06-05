import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SDK_COLORS } from '../constants';
import { useSdkMenu } from '../context/SdkMenuContext';
import {
  SDK_MENU_ITEMS,
  SDK_MENU_SECTION_LABELS,
} from '../navigation/sdkRoutes';

function menuItemIsActive(item, currentRoute) {
  return item.key === currentRoute;
}

function renderMenuSections(currentRoute, navigateFromMenu) {
  const sections = ['main', 'actions', 'account', 'history', 'about'];
  const nodes = [];

  sections.forEach(section => {
    const items = SDK_MENU_ITEMS.filter(item => item.section === section);
    if (items.length === 0) {
      return;
    }

    if (section !== 'main' && SDK_MENU_SECTION_LABELS[section]) {
      nodes.push(
        <Text key={`section-${section}`} style={styles.sectionLabel}>
          {SDK_MENU_SECTION_LABELS[section]}
        </Text>,
      );
    }

    items.forEach((item, index) => {
      const active = menuItemIsActive(item, currentRoute);
      const isLastInSection = index === items.length - 1;
      nodes.push(
        <TouchableOpacity
          key={item.key}
          style={[
            styles.item,
            active && styles.itemActive,
            isLastInSection && styles.itemSectionLast,
          ]}
          onPress={() => navigateFromMenu(item.key, item.params)}
          activeOpacity={0.75}>
          {active ? <View style={styles.itemActiveBar} /> : null}
          <View style={styles.itemBody}>
            <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
              {item.label}
            </Text>
            <Text style={styles.itemSub}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>,
      );
    });
  });

  return nodes;
}

const PANEL_ANIM_MS = 260;

export default function SdkSideMenu() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const panelWidth = Math.min(Math.max(width * 0.82, 280), 320);
  const slideX = useRef(new Animated.Value(panelWidth)).current;
  const { visible, menuScope, currentRoute, closeMenu, navigateFromMenu } =
    useSdkMenu();

  useEffect(() => {
    slideX.setValue(panelWidth);
  }, [panelWidth, slideX]);

  useEffect(() => {
    if (!visible) {
      slideX.setValue(panelWidth);
      return;
    }

    Animated.timing(slideX, {
      toValue: 0,
      duration: PANEL_ANIM_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, panelWidth, slideX]);

  const handleClose = () => {
    Animated.timing(slideX, {
      toValue: panelWidth,
      duration: PANEL_ANIM_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        closeMenu();
      }
    });
  };

  if (!menuScope) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated>
      <View style={[styles.overlay, { width, height }]}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityLabel="Close menu"
        />

        <Animated.View
          style={[
            styles.panel,
            {
              width: panelWidth,
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateX: slideX }],
            },
          ]}>
          <View style={styles.accentBar} />

          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Menu</Text>
              <Text style={styles.panelSubtitle}>Navigate SDK screens</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close menu"
              accessibilityRole="button">
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {renderMenuSections(currentRoute, navigateFromMenu)}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    zIndex: 1,
  },
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: SDK_COLORS.headerBg,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingHorizontal: 18,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(201, 162, 39, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: -6, height: 0 },
      },
      android: {
        elevation: 24,
      },
    }),
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: SDK_COLORS.primary,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 162, 39, 0.22)',
  },
  panelTitle: {
    color: SDK_COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  panelSubtitle: {
    color: SDK_COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  close: {
    color: SDK_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    color: SDK_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemSectionLast: {
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: 'rgba(201, 162, 39, 0.14)',
  },
  itemActiveBar: {
    width: 4,
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 2,
  },
  itemBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  itemLabel: {
    color: SDK_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  itemLabelActive: {
    color: SDK_COLORS.primary,
  },
  itemSub: {
    color: SDK_COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
