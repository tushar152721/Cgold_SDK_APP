import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SDK_COLORS } from '../constants';
import ComtechGoldCopyrightFooter from './ComtechGoldCopyrightFooter';

/**
 * Shared shell for Link / Register / Home / KYC / Buy screens.
 */
export default function SdkScreenLayout({
  title,
  subtitle,
  loading = false,
  children,
  footer,
  variant = 'dark',
  showCopyright = true,
  /** When true, fills parent flex height (embedded SDK). */
  fill = false,
}) {
  const isCream = variant === 'cream';
  const content = (
    <>
      {title ? (
        <Text style={[styles.title, isCream && styles.titleCream]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, isCream && styles.subtitleCream]}>
          {subtitle}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color={SDK_COLORS.primary} style={styles.loader} />
      ) : null}

      {children}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
      {showCopyright ? (
        <ComtechGoldCopyrightFooter variant={isCream ? 'cream' : 'dark'} />
      ) : null}
    </>
  );

  if (fill) {
    return (
      <ScrollView
        style={[styles.scroll, styles.scrollFill, isCream && styles.scrollCream]}
        contentContainerStyle={[styles.container, styles.containerFill]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        {content}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, isCream && styles.scrollCream]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: SDK_COLORS.background,
  },
  scrollFill: {
    flexGrow: 1,
  },
  scrollCream: {
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  containerFill: {
    minHeight: '100%',
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: SDK_COLORS.text,
    marginTop: 8,
  },
  titleCream: {
    color: SDK_COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: SDK_COLORS.textMuted,
    marginTop: 8,
    marginBottom: 20,
  },
  subtitleCream: {
    color: SDK_COLORS.textMutedDark,
  },
  loader: {
    marginVertical: 24,
  },
  footer: {
    marginTop: 8,
  },
});

export const layoutCardStyles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: SDK_COLORS.border,
  },
  cardCream: {
    backgroundColor: SDK_COLORS.cardCream,
    borderColor: SDK_COLORS.borderCream,
  },
  button: {
    backgroundColor: SDK_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SDK_COLORS.primary,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextOutline: {
    color: SDK_COLORS.primary,
  },
  linkButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: SDK_COLORS.primary,
    fontSize: 14,
  },
  hint: {
    color: SDK_COLORS.textMuted,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: SDK_COLORS.card,
    borderWidth: 1,
    borderColor: SDK_COLORS.border,
    borderRadius: 10,
    padding: 14,
    color: SDK_COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    color: SDK_COLORS.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
});
