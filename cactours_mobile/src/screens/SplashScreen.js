import React, { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BrandMark, Notice, useReduceMotion } from '../components/ui'
import { colors, radii, spacing } from '../theme/tokens'

export default function SplashScreen({ error, onRetry }) {
  const reduceMotion = useReduceMotion()
  const logoOpacity = useSharedValue(reduceMotion ? 1 : 0)
  const logoScale = useSharedValue(reduceMotion ? 1 : 0.88)
  const copyOpacity = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) {
      logoOpacity.value = 1
      logoScale.value = 1
      copyOpacity.value = 1
      return
    }

    logoOpacity.value = withTiming(1, { duration: 520 })
    logoScale.value = withSpring(1, { damping: 17, stiffness: 150 })
    copyOpacity.value = withDelay(210, withTiming(1, { duration: 480 }))
  }, [copyOpacity, logoOpacity, logoScale, reduceMotion])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))
  const copyStyle = useAnimatedStyle(() => ({ opacity: copyOpacity.value }))

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={colors.ink} />
      <LinearGradient
        colors={['#0D3E48', colors.ink, '#0B2830']}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbitLarge} />
      <View style={styles.orbitSmall} />

      <View style={styles.content}>
        <Animated.View style={[styles.brand, logoStyle]}>
          <View style={styles.brandSeal}>
            <Ionicons name="compass-outline" size={35} color={colors.blanco} />
          </View>
          <Text style={styles.brandName}>CACTOURS</Text>
          <View style={styles.brandRule} />
        </Animated.View>

        <Animated.View style={[styles.copy, copyStyle]}>
          <Text style={styles.tagline}>DESTINOS QUE SE QUEDAN CONTIGO</Text>
          <Text style={styles.subtagline}>Descubre Colombia a tu manera.</Text>
        </Animated.View>

        {error ? (
          <View style={styles.error}>
            <Notice
              title="No pudimos preparar la app"
              message={error}
            />
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>Reintentar</Text>
              <Ionicons name="refresh-outline" size={16} color={colors.blanco} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.loading}>
            <View style={styles.loadingDot} />
            <Text style={styles.loadingText}>PREPARANDO TU PRÓXIMO VIAJE</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <BrandMark compact light />
        <Text style={styles.footerCaption}>COLOMBIA · VIAJA SIN PRISA</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.ink },
  orbitLarge: {
    position: 'absolute',
    top: -150,
    right: -120,
    width: 360,
    height: 360,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 180,
  },
  orbitSmall: {
    position: 'absolute',
    bottom: -180,
    left: -145,
    width: 400,
    height: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 200,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  brand: { alignItems: 'center' },
  brandSeal: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  brandName: { marginTop: 18, color: colors.blanco, fontSize: 24, fontWeight: '800', letterSpacing: 4.5 },
  brandRule: { width: 34, height: 2, marginTop: 15, borderRadius: radii.pill, backgroundColor: '#76BDB6' },
  copy: { alignItems: 'center', marginTop: spacing.lg },
  tagline: { color: '#A8D9D0', fontSize: 9, fontWeight: '800', letterSpacing: 1.6, textAlign: 'center' },
  subtagline: { marginTop: 9, color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center' },
  loading: { position: 'absolute', bottom: 56, flexDirection: 'row', alignItems: 'center', gap: 9 },
  loadingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8DD1A6' },
  loadingText: { color: 'rgba(255,255,255,0.56)', fontSize: 8, fontWeight: '700', letterSpacing: 1.3 },
  error: { width: '100%', maxWidth: 430, marginTop: spacing.xl },
  retryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radii.pill,
  },
  retryText: { color: colors.blanco, fontSize: 12, fontWeight: '700' },
  footer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.md,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerCaption: { color: 'rgba(255,255,255,0.42)', fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  pressed: { opacity: 0.8 },
})
