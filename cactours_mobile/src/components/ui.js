import React, { useEffect, useState } from 'react'
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { colors, radii, shadows, spacing } from '../theme/tokens'

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(true)

  useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled)
    })
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return reduceMotion
}

export function BrandMark({ compact = false, light = false }) {
  return (
    <View style={styles.brand}>
      <View style={[styles.brandSeal, light && styles.brandSealLight]}>
        <Ionicons name="compass-outline" size={21} color={colors.blanco} />
      </View>
      <View>
        <Text style={[styles.brandName, light && styles.brandNameLight]}>Cactours</Text>
        {!compact && (
          <Text style={[styles.brandTagline, light && styles.brandTaglineLight]}>
            Tu presupuesto, nuestra inspiración
          </Text>
        )}
      </View>
    </View>
  )
}

export function ActionButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  accessibilityLabel,
}) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const isLight = variant === 'light'
  const isQuiet = variant === 'quiet'
  const gradientColors = isLight
    ? [colors.blanco, '#F1F5F0']
    : isQuiet
      ? ['rgba(255,255,255,0.96)', 'rgba(255,255,255,0.82)']
      : [colors.turquesaCactours, '#087E89']

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 17, stiffness: 280 }) }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 17, stiffness: 280 }) }}
      style={({ pressed }) => [
        styles.button,
        isQuiet && styles.buttonQuiet,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Animated.View style={[styles.buttonMotion, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator color={isLight || isQuiet ? colors.turquesaCactours : colors.blanco} />
          ) : (
            <>
              <Text style={[styles.buttonText, (isLight || isQuiet) && styles.buttonTextDark]}>
                {title}
              </Text>
              {icon ? (
                <Ionicons
                  name={icon}
                  size={17}
                  color={isLight || isQuiet ? colors.turquesaCactours : colors.blanco}
                />
              ) : null}
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  )
}

export function TextField({
  label,
  icon,
  rightAccessory,
  error,
  style,
  inputStyle,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false)
  const focusProgress = useSharedValue(0)

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 170 })
  }, [focusProgress, focused])

  const focusStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.errorText
      : interpolateColor(focusProgress.value, [0, 1], ['rgba(2,99,116,0.13)', colors.turquesaCactours]),
    backgroundColor: interpolateColor(focusProgress.value, [0, 1], [colors.blanco, '#FBFEFC']),
  }))

  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Animated.View style={[styles.inputShell, focusStyle, focused && styles.inputShellFocused, error && styles.inputShellError]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.turquesaCactours} /> : null}
        <TextInput
          {...inputProps}
          placeholderTextColor="#8A9691"
          onFocus={(event) => {
            setFocused(true)
            inputProps.onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            inputProps.onBlur?.(event)
          }}
          style={[styles.input, inputStyle]}
        />
        {rightAccessory}
      </Animated.View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  )
}

export function SectionHeading({ eyebrow, title, action, onAction }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.sectionAction, pressed && styles.buttonPressed]}
        >
          <Text style={styles.sectionActionText}>{action}</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.turquesaCactours} />
        </Pressable>
      ) : null}
    </View>
  )
}

export function Notice({ title, message, tone = 'error', icon }) {
  const positive = tone === 'success'
  return (
    <View style={[styles.notice, positive ? styles.noticeSuccess : styles.noticeError]}>
      <Ionicons
        name={icon || (positive ? 'checkmark-circle-outline' : 'alert-circle-outline')}
        size={21}
        color={positive ? colors.successText : colors.errorText}
      />
      <View style={styles.noticeCopy}>
        {title ? <Text style={styles.noticeTitle}>{title}</Text> : null}
        <Text style={styles.noticeMessage}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandSeal: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.18)',
    backgroundColor: colors.turquesaCactours,
  },
  brandSealLight: {
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  brandName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandNameLight: { color: colors.blanco },
  brandTagline: {
    marginTop: 1,
    color: colors.muted,
    fontSize: 9,
  },
  brandTaglineLight: { color: 'rgba(255,255,255,0.7)' },
  button: {
    overflow: 'hidden',
    minHeight: 50,
    borderRadius: radii.pill,
    ...shadows.button,
  },
  buttonMotion: { flex: 1 },
  buttonQuiet: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonGradient: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
  },
  buttonText: {
    color: colors.blanco,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  buttonTextDark: {
    color: colors.ink,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  inputShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.13)',
    borderRadius: radii.md,
    paddingHorizontal: 15,
    backgroundColor: colors.blanco,
  },
  inputShellFocused: {
    borderColor: colors.turquesaCactours,
    ...shadows.focus,
  },
  inputShellError: {
    borderColor: colors.errorText,
  },
  input: {
    minWidth: 0,
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    paddingVertical: 12,
  },
  fieldError: {
    color: colors.errorText,
    fontSize: 11,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeadingCopy: {
    flex: 1,
  },
  eyebrow: {
    marginBottom: 5,
    color: colors.turquesaCactours,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  sectionActionText: {
    color: colors.turquesaCactours,
    fontSize: 11,
    fontWeight: '800',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 13,
  },
  noticeError: {
    borderColor: 'rgba(197,34,31,0.15)',
    backgroundColor: colors.errorBg,
  },
  noticeSuccess: {
    borderColor: 'rgba(19,115,51,0.15)',
    backgroundColor: colors.successBg,
  },
  noticeCopy: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  noticeMessage: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
})
