import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SDK_COLORS } from '../constants';

export default function SdkToast({ toast, onDismiss }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [toast, translateY, opacity]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type !== 'error';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + (Platform.OS === 'ios' ? 8 : 12),
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={[styles.card, isSuccess ? styles.cardSuccess : styles.cardError]}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{isSuccess ? '✓' : '!'}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {isSuccess ? 'Gold balance updated' : 'Update notice'}
          </Text>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={10}
          accessibilityLabel="Dismiss notification">
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 10000,
    elevation: 10000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardSuccess: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  cardError: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FECACA',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  icon: {
    color: SDK_COLORS.success,
    fontSize: 16,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    color: SDK_COLORS.textMutedDark,
  },
  close: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
  },
});
