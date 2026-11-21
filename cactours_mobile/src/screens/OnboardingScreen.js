import React, { useEffect, useRef, useState } from 'react'
import { ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BrandMark, Notice, useReduceMotion } from '../components/ui'
import { featuredDestinations } from '../utils/tourMedia'
import { colors, radii, spacing } from '../theme/tokens'

const slides = [
  {
    eyebrow: 'LA GUAJIRA · COLOMBIA',
    title: 'Descubre lugares extraordinarios',
    body: 'Explora destinos únicos y encuentra tu próxima aventura.',
    image: featuredDestinations[1].image,
  },
  {
    eyebrow: 'CARIBE · COLOMBIA',
    title: 'Vive experiencias inolvidables',
    body: 'Encuentra actividades y recorridos para todos los gustos.',
    image: featuredDestinations[0].image,
  },
  {
    eyebrow: 'TU PRÓXIMA HISTORIA',
    title: 'Tu próxima aventura comienza aquí',
    body: 'Encuentra tu próximo recorrido y solicita tu reserva fácilmente.',
    image: featuredDestinations[2].image,
  },
]

function OnboardingSlide({ item, index, width, height, active, reduceMotion }) {
  const copyProgress = useSharedValue(active ? 1 : 0)
  const imageProgress = useSharedValue(active ? 1 : 0.82)

  useEffect(() => {
    if (reduceMotion) {
      copyProgress.value = 1
      imageProgress.value = active ? 1 : 0.82
      return
    }

    copyProgress.value = 0
    copyProgress.value = withTiming(1, { duration: 420 })
    imageProgress.value = withTiming(active ? 1 : 0.82, { duration: 520 })
  }, [active, copyProgress, imageProgress, reduceMotion])

  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyProgress.value,
    transform: [{ translateY: (1 - copyProgress.value) * 18 }],
  }))
  const imageStyle = useAnimatedStyle(() => ({ opacity: imageProgress.value }))

  return (
    <View style={{ width, height }}>
      <Animated.View style={[styles.imageFrame, imageStyle]}>
        <ImageBackground
          source={{ uri: item.image }}
          resizeMode="cover"
          style={styles.image}
        >
          <LinearGradient
            colors={['rgba(8,38,44,0.12)', 'rgba(8,38,44,0.12)', 'rgba(8,38,44,0.91)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.slideTop}>
            <BrandMark compact light />
            <Text style={styles.slideCount}>{String(index + 1).padStart(2, '0')} / 03</Text>
          </View>
          <Animated.View style={[styles.slideCopy, copyStyle]}>
            <View style={styles.slideEyebrow}>
              <View style={styles.slideEyebrowDot} />
              <Text style={styles.slideEyebrowText}>{item.eyebrow}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </View>
  )
}

export default function OnboardingScreen({ navigation, onComplete }) {
  const { width, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const reduceMotion = useReduceMotion()
  const scrollRef = useRef(null)
  const scrollEndTimer = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const safeHeight = Math.max(220, windowHeight - insets.top - insets.bottom - 110)

  useEffect(() => () => {
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
  }, [])

  function finish() {
    if (saving) return
    setSaving(true)
    setError(null)
    Promise.resolve(onComplete(navigation)).catch((completionError) => {
      setError(completionError.message || 'No pudimos guardar tu preferencia. Inténtalo de nuevo.')
      setSaving(false)
    })
  }

  function next() {
    if (activeIndex === slides.length - 1) {
      finish()
      return
    }
    const nextIndex = activeIndex + 1
    if (Platform.OS === 'web') {
      const scrollNode = scrollRef.current?.getScrollableNode?.()
      if (scrollNode) scrollNode.scrollLeft = nextIndex * width
    } else {
      scrollRef.current?.scrollTo({ x: nextIndex * width, y: 0, animated: !reduceMotion })
    }
    setActiveIndex(nextIndex)
  }

  function updateIndex(event) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width)
    const boundedIndex = Math.max(0, Math.min(slides.length - 1, nextIndex))
    if (Platform.OS === 'web') {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
      scrollEndTimer.current = setTimeout(() => setActiveIndex(boundedIndex), 90)
    } else {
      setActiveIndex(boundedIndex)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" backgroundColor={colors.ink} />
      <ScrollView
        ref={scrollRef}
        style={styles.slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Platform.OS === 'web' ? updateIndex : undefined}
        onMomentumScrollEnd={updateIndex}
        scrollEventThrottle={16}
      >
        {slides.map((item, index) => (
          <OnboardingSlide
            key={item.title}
            item={item}
            index={index}
            width={width}
            height={safeHeight}
            active={index === activeIndex}
            reduceMotion={reduceMotion}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.progress}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={[styles.progressTrack, index === activeIndex && styles.progressTrackActive]}
            />
          ))}
        </View>
        <View style={styles.actionRow}>
          {activeIndex < slides.length - 1 ? (
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={finish}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
            >
              <Text style={styles.skipText}>Omitir</Text>
            </Pressable>
          ) : <View style={styles.skipPlaceholder} />}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={next}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed, saving && styles.disabled]}
          >
            <Text style={styles.nextText}>{saving ? 'Guardando...' : activeIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}</Text>
            {!saving ? <Ionicons name={activeIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={17} color={colors.blanco} /> : null}
          </Pressable>
        </View>
        {error ? (
          <View style={styles.errorWrap}>
            <Notice title="No pudimos guardar el cambio" message={error} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.ink },
  slides: { flex: 1 },
  imageFrame: { flex: 1, overflow: 'hidden', backgroundColor: colors.ink },
  image: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  slideTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slideCount: {
    color: colors.blanco,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  slideCopy: { maxWidth: 440, paddingBottom: spacing.md },
  slideEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 },
  slideEyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A8D9D0' },
  slideEyebrowText: { color: '#BFE3DA', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  slideTitle: {
    color: colors.blanco,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 39,
  },
  slideBody: { maxWidth: 320, marginTop: 12, color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 21 },
  controls: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.ink },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: spacing.md },
  progressTrack: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressTrackActive: { width: 25, backgroundColor: '#A8D9D0' },
  actionRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipButton: { minWidth: 90, minHeight: 46, justifyContent: 'center' },
  skipText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700' },
  skipPlaceholder: { minWidth: 90 },
  nextButton: {
    minWidth: 155,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.turquesaCactours,
  },
  nextText: { color: colors.blanco, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.7 },
  errorWrap: { marginTop: spacing.sm },
  pressed: { opacity: 0.8 },
})
