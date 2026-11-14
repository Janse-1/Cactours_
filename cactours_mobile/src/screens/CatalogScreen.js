import React, { useCallback, useEffect, useState } from 'react'
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { mobileApiRequest } from '../api/client'
import { colors, radii, spacing } from '../theme/tokens'

function TourCard({ item, index, selected, reduceMotion, onSelect }) {
  const scale = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const entering = reduceMotion
    ? undefined
    : FadeInDown.delay(Math.min(index, 6) * 75).duration(520)

  function setPressed(isPressed) {
    if (!reduceMotion) {
      scale.value = withSpring(isPressed ? 0.985 : 1, { damping: 16, stiffness: 320 })
    }
  }

  return (
    <Animated.View
      entering={entering}
      style={[styles.card, pressStyle, selected && styles.cardSelected]}
    >
      <View style={styles.cardTopline}>
        <Text style={styles.destination}>{item.ciudad_destino}</Text>
        <View style={styles.glassDot} />
      </View>
      <Text style={styles.title}>{item.nombre_tour}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.descripcion}
      </Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>DESDE</Text>
          <Text style={styles.price}>
            ${Number(item.costo).toLocaleString('es-CO')} COP
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${selected ? 'Tour seleccionado' : 'Seleccionar tour'} ${item.nombre_tour}`}
          onPress={() => onSelect?.(item)}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        >
          <Text style={styles.ctaText}>{selected ? 'Seleccionado' : 'Explorar tour'}</Text>
          <Text style={styles.ctaArrow} accessibilityElementsHidden>
            ↗
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

export default function CatalogScreen({ onSelectTour, selectedTour }) {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reduceMotion, setReduceMotion] = useState(true)

  const loadTours = useCallback(() => {
    setLoading(true)
    setError(null)
    mobileApiRequest('/tours/')
      .then((data) => setTours(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTours()
  }, [loadTours])

  useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled)
    })
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    )
    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BlurView
          intensity={36}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerTint} pointerEvents="none" />
        <View style={styles.headerGlow} pointerEvents="none" />
        <View style={styles.headerEyebrow}>
          <View style={styles.liveDot} />
          <Text style={styles.headerEyebrowText}>EXPEDICIONES CON RAÍZ</Text>
        </View>
        <Text style={styles.brand}>Cactours</Text>
        <Text style={styles.subtitle}>Descubre La Guajira y Colombia</Text>
        <View style={styles.headerRule} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.turquesaCactours} style={styles.loader} />
      ) : error ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(360)}
          style={styles.stateCard}
        >
          <Text style={styles.stateEyebrow}>NO PUDIMOS CONECTAR</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={loadTours} style={styles.retryButton}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </Pressable>
        </Animated.View>
      ) : tours.length === 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(420)}
          style={styles.stateCard}
        >
          <Text style={styles.stateEyebrow}>PRÓXIMA SALIDA</Text>
          <Text style={styles.emptyTitle}>El territorio está preparando algo.</Text>
          <Text style={styles.emptyText}>
            Aún no hay tours publicados. Vuelve pronto para descubrir nuevas rutas.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TourCard
              item={item}
              index={index}
              selected={selectedTour?.id === item.id}
              reduceMotion={reduceMotion}
              onSelect={onSelectTour}
            />
          )}
        />
      )}

      {selectedTour && !loading && !error && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(320)}
          exiting={reduceMotion ? undefined : FadeOutDown.duration(180)}
          style={styles.selectionDock}
        >
          <BlurView
            intensity={64}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.selectionTint} pointerEvents="none" />
          <View style={styles.selectionGlassHighlight} pointerEvents="none" />
          <View style={styles.selectionCopy}>
            <Text style={styles.selectionEyebrow}>TU ELECCIÓN</Text>
            <Text style={styles.selectionTitle} numberOfLines={1}>
              {selectedTour.nombre_tour}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar tour seleccionado"
            onPress={() => onSelectTour?.(null)}
            style={styles.selectionRemove}
          >
            <Text style={styles.selectionRemoveText}>Quitar</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mineralIvory,
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(2,99,116,0.42)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#03343B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  headerTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,99,116,0.56)',
  },
  headerGlow: {
    position: 'absolute',
    top: -72,
    right: -46,
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  headerEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.azulBrillante,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  headerEyebrowText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  brand: {
    color: colors.blanco,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
    fontSize: 13,
  },
  headerRule: {
    height: 1,
    width: '42%',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  loader: {
    flex: 1,
  },
  stateCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.64)',
    shadowColor: '#123C3E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 3,
  },
  stateEyebrow: {
    color: colors.turquesaCactours,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
  },
  emptyTitle: {
    color: colors.carbon,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: '#53615E',
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.turquesaCactours,
  },
  retryText: {
    color: colors.blanco,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: colors.errorText,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 132,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.87)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.94)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#123C3E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  cardSelected: {
    borderColor: colors.azulBrillante,
    shadowColor: colors.azulBrillante,
    shadowOpacity: 0.18,
  },
  cardTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destination: {
    color: colors.azulPetroleo,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  glassDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.16)',
    backgroundColor: 'rgba(6,155,224,0.1)',
  },
  title: {
    color: colors.turquesaCactours,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  description: {
    color: '#53615E',
    fontSize: 14,
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,17,17,0.08)',
  },
  priceLabel: {
    color: '#687571',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  price: {
    fontWeight: '800',
    fontSize: 15,
    color: colors.turquesaCactours,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: colors.azulBrillante,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.azulBrillante,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  ctaButtonPressed: {
    backgroundColor: '#38B5EB',
  },
  ctaText: {
    color: colors.carbon,
    fontWeight: '700',
    fontSize: 11,
  },
  ctaArrow: {
    color: colors.carbon,
    fontSize: 14,
    fontWeight: '800',
  },
  selectionDock: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(2,99,116,0.42)',
    shadowColor: '#032E33',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  selectionTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,99,116,0.48)',
  },
  selectionGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 18,
    width: '45%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  selectionCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  selectionEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  selectionTitle: {
    color: colors.blanco,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  selectionRemove: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },
  selectionRemoveText: {
    color: colors.blanco,
    fontSize: 11,
    fontWeight: '700',
  },
})
