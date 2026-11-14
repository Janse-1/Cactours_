import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { mobileApiRequest } from '../api/client'
import { BrandMark, Notice, useReduceMotion } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'
import { formatCop, getTourImage } from '../utils/tourMedia'

const categories = ['Todos', 'La Guajira', 'Caribe', 'Naturaleza']

function TourCard({ item, navigation, reduceMotion }) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ opacity: scale.value }))

  function setPressed(pressed) {
    if (!reduceMotion) scale.value = withSpring(pressed ? 0.8 : 1, { damping: 16, stiffness: 280 })
  }

  return (
    <View style={styles.tourCard}>
      <Animated.View style={[styles.pressScale, animatedStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${item.nombre_tour}`}
          onPress={() => navigation.navigate('TourDetail', { tour: item })}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.tourPressable}
        >
          <ImageBackground
            source={{ uri: getTourImage(item) }}
            resizeMode="cover"
            imageStyle={styles.tourImage}
            style={styles.tourImageFrame}
          >
            <LinearGradient colors={['rgba(4,32,35,0.03)', 'rgba(4,32,35,0.78)']} style={StyleSheet.absoluteFill} />
            <View style={styles.cardTop}>
              <View style={styles.locationChip}>
                <Ionicons name="location" size={11} color={colors.blanco} />
                <Text style={styles.locationText}>{item.ciudad_destino}</Text>
              </View>
              <View style={styles.daysPill}>
                <Text style={styles.daysText}>{item.duracion_dias} {item.duracion_dias === 1 ? 'DÍA' : 'DÍAS'}</Text>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.cardEyebrow}>EXPEDICIÓN CACTOURS</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.nombre_tour}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{item.descripcion}</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>DESDE / PERSONA</Text>
                  <Text style={styles.price}>{formatCop(item.costo)}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-up-outline" size={17} color={colors.ink} />
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </Animated.View>
    </View>
  )
}

export default function CatalogScreen({ navigation, onProfile }) {
  const [tours, setTours] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const reduceMotion = useReduceMotion()

  const loadTours = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await mobileApiRequest('/tours/')
      setTours(data.results || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [retryKey])

  useEffect(() => {
    loadTours()
  }, [loadTours])

  const filteredTours = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-CO')
    return tours.filter((tour) => {
      const searchableText = `${tour.nombre_tour} ${tour.ciudad_destino} ${tour.descripcion}`.toLocaleLowerCase('es-CO')
      if (query && !searchableText.includes(query)) return false

      const destination = `${tour.ciudad_destino} ${tour.nombre_tour}`.toLocaleLowerCase('es-CO')
      if (activeCategory === 'La Guajira' && !destination.includes('guajira') && !destination.includes('punta gallinas')) return false
      if (activeCategory === 'Caribe' && !destination.includes('cabo') && !destination.includes('mayapo') && !destination.includes('caribe')) return false
      if (activeCategory === 'Naturaleza' && !destination.includes('amazonas') && !destination.includes('montes') && !destination.includes('eje')) return false
      return true
    })
  }, [activeCategory, search, tours])

  return (
    <View style={styles.screen}>
      <FlatList
        data={loading || error ? [] : filteredTours}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TourCard item={item} navigation={navigation} reduceMotion={reduceMotion} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTours(true)}
            tintColor={colors.turquesaCactours}
            colors={[colors.turquesaCactours]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topbar}>
              <BrandMark />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir mi cuenta"
                onPress={onProfile}
                style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
              >
                <Ionicons name="person-outline" size={19} color={colors.turquesaCactours} />
              </Pressable>
            </View>
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>VIAJA CON RAÍZ</Text>
              <Text style={styles.title}>Tu próxima historia{'\n'}<Text style={styles.titleAccent}>empieza aquí.</Text></Text>
              <Text style={styles.description}>
                Encuentra una experiencia que se ajuste a tu forma de viajar.
              </Text>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={colors.turquesaCactours} />
              <TextInput
                accessibilityLabel="Buscar tours"
                value={search}
                onChangeText={setSearch}
                placeholder="Busca un destino o experiencia"
                placeholderTextColor="#8A9691"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {search ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={19} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const active = activeCategory === item
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setActiveCategory(item)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                  </Pressable>
                )
              }}
            />
            <View style={styles.resultsHeading}>
              <View>
                <Text style={styles.eyebrow}>ELIGE TU PRÓXIMA SALIDA</Text>
                <Text style={styles.resultsTitle}>Experiencias</Text>
              </View>
              {!loading && !error ? (
                <Text style={styles.resultsCount}>
                  {filteredTours.length} {filteredTours.length === 1 ? 'ruta' : 'rutas'}
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.statePanel}>
              <ActivityIndicator size="large" color={colors.turquesaCactours} />
              <Text style={styles.stateTitle}>Buscando rutas para ti...</Text>
              <Text style={styles.stateCopy}>Un momento, estamos preparando el atlas.</Text>
            </View>
          ) : error ? (
            <View style={styles.statePanel}>
              <Notice title="No pudimos cargar el catálogo" message={error} />
              <Pressable accessibilityRole="button" onPress={() => setRetryKey((key) => key + 1)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
                <Ionicons name="refresh" size={16} color={colors.blanco} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.statePanel}>
              <Ionicons name="compass-outline" size={32} color={colors.turquesaCactours} />
              <Text style={styles.stateTitle}>
                {search || activeCategory !== 'Todos' ? 'No encontramos esa ruta.' : 'Una nueva ruta está por nacer.'}
              </Text>
              <Text style={styles.stateCopy}>
                {search || activeCategory !== 'Todos'
                  ? 'Prueba otro destino o cambia el filtro.'
                  : 'Aún no hay tours publicados. Vuelve pronto para descubrir nuevas experiencias.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          !loading && !error && filteredTours.length ? (
            <View style={styles.footerNote}>
              <Ionicons name="leaf-outline" size={15} color={colors.turquesaCactours} />
              <Text style={styles.footerText}>Elige con calma. Cada detalle importa.</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingBottom: spacing.lg },
  topbar: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: 2,
  },
  profileButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.16)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  intro: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  eyebrow: { marginBottom: 7, color: colors.turquesaCactours, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '800', letterSpacing: -1.3, lineHeight: 37 },
  titleAccent: { color: colors.turquesaCactours, fontStyle: 'italic', fontWeight: '600' },
  description: { maxWidth: 330, marginTop: 9, color: colors.muted, fontSize: 12, lineHeight: 19 },
  searchBox: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.12)',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    backgroundColor: colors.blanco,
    ...shadows.subtle,
  },
  searchInput: { minWidth: 0, flex: 1, color: colors.ink, fontSize: 12, paddingVertical: 12 },
  categoryList: { gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  categoryChip: {
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.14)',
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.64)',
  },
  categoryChipActive: { borderColor: colors.turquesaCactours, backgroundColor: colors.turquesaCactours },
  categoryText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  categoryTextActive: { color: colors.blanco },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  resultsTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.7 },
  resultsCount: { color: colors.muted, fontSize: 10, paddingBottom: 4 },
  tourCard: {
    minHeight: 344,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.azulPetroleo,
    ...shadows.card,
  },
  pressScale: { flex: 1 },
  tourPressable: { flex: 1, overflow: 'hidden', borderRadius: radii.lg },
  tourImageFrame: { minHeight: 344, justifyContent: 'space-between', padding: spacing.md },
  tourImage: { borderRadius: radii.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(4,35,38,0.36)',
  },
  locationText: { color: colors.blanco, fontSize: 9, fontWeight: '800' },
  daysPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  daysText: { color: colors.ink, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  cardBottom: { gap: 7 },
  cardEyebrow: { color: '#B8D7D1', fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  cardTitle: { color: colors.blanco, fontSize: 23, fontWeight: '800', letterSpacing: -0.8, lineHeight: 27 },
  cardDescription: { color: 'rgba(255,255,255,0.79)', fontSize: 11, lineHeight: 17 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.24)',
    marginTop: 7,
    paddingTop: 12,
  },
  priceLabel: { marginBottom: 3, color: 'rgba(255,255,255,0.69)', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  price: { color: colors.blanco, fontSize: 16, fontWeight: '800' },
  cardArrow: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.blanco,
  },
  statePanel: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 12, padding: spacing.lg },
  stateTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  stateCopy: { maxWidth: 280, color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    backgroundColor: colors.turquesaCactours,
  },
  retryButtonText: { color: colors.blanco, fontSize: 11, fontWeight: '800' },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, padding: spacing.md },
  footerText: { color: colors.muted, fontSize: 10 },
  pressed: { opacity: 0.82 },
})
