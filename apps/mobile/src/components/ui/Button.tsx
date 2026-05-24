import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  onPress,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  async function handlePress(e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#4F46E5'} />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: '#4F46E5',
  },
  secondary: {
    backgroundColor: '#E0E7FF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  // Sizes
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    minHeight: 56,
  },
  // Labels
  label: {
    fontWeight: '600',
  },
  label_primary: {
    color: '#ffffff',
  },
  label_secondary: {
    color: '#4F46E5',
  },
  label_outline: {
    color: '#4F46E5',
  },
  label_ghost: {
    color: '#4F46E5',
  },
  label_sm: {
    fontSize: 14,
  },
  label_md: {
    fontSize: 16,
  },
  label_lg: {
    fontSize: 18,
  },
});
