import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { mobileApiRequest } from '../api/client'
import { BrandMark, SectionHeading } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'
import { featuredDestinations, formatCop, getTourImage } from '../utils/tourMedia'

function EditorialHero({ onExplore }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const destination = featuredDestinations[activeIndex]

  function changeDestination(step) {
    setActiveIndex((index) => (index + step + featuredDestinations.length) % featuredDestinations.length)
  }

  return (
    <View style={styles.heroWrap}>
      <ImageBackground
        key={destination.name}
        source={{ uri: destination.image }}
        resizeMode="cover"
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <LinearGradient
          colors={['rgba(5,34,37,0.12)', 'rgba(5,34,37,0.32)', 'rgba(5,34,37,0.91)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroTopline}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>VIAJES CON RAÍZ · COLOMBIA</Text>
          </View>
          <View style={styles.heroIndex}>
            <Text style={styles.heroIndexText}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(featuredDestinations.length).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>HAY LUGARES QUE</Text>
          <Text style={styles.heroTitle}>
            te cambian{'\n'}la forma de <Text style={styles.heroItalic}>mirar.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Desierto, mar y cultura viva. Recorre Colombia con quienes conocen el territorio de verdad.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onExplore}
            style={({ pressed }) => [styles.heroCta, pressed && styles.pressed]}
          >
            <Text style={styles.heroCtaText}>Explorar experiencias</Text>
            <Ionicons name="arrow-up-outline" size={17} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.heroBottomline}>
          <View style={styles.heroLocation}>
            <Ionicons name="location-outline" size={15} color="rgba(255,255,255,0.88)" />
            <Text style={styles.heroLocationText}>{destination.name} · {destination.line}</Text>
          </View>
          <View style={styles.carouselControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Destino anterior"
              onPress={() => changeDestination(-1)}
              style={styles.carouselButton}
            >
              <Ionicons name="arrow-back" size={15} color={colors.blanco} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Siguiente destino"
              onPress={() => changeDestination(1)}
              style={styles.carouselButton}
            >
              <Ionicons name="arrow-forward" size={15} color={colors.blanco} />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

function FeaturedTour({ tour, navigation }) {
  return (
    <View style={styles.featuredCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${tour.nombre_tour}`}
        onPress={() => navigation.navigate('TourDetail', { tour })}
        style={({ pressed }) => [styles.featuredPressable, pressed && styles.pressed]}
      >
        <ImageBackground
          source={{ uri: getTourImage(tour) }}
          resizeMode="cover"
          imageStyle={styles.featuredImage}
          style={styles.featuredImageFrame}
        >
          <LinearGradient
            colors={['rgba(5,34,37,0.02)', 'rgba(5,34,37,0.82)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featuredTag}>
            <Text style={styles.featuredTagText}>{tour.ciudad_destino}</Text>
          </View>
          <View style={styles.featuredCardCopy}>
            <Text style={styles.featuredDuration}>
              {tour.duracion_dias} {tour.duracion_dias === 1 ? 'DÍA' : 'DÍAS'} · COLOMBIA
            </Text>
            <Text style={styles.featuredTitle} numberOfLines={2}>{tour.nombre_tour}</Text>
            <View style={styles.featuredPriceRow}>
              <Text style={styles.featuredPriceLabel}>Desde <Text style={styles.featuredPrice}>{formatCop(tour.costo)}</Text></Text>
              <View style={styles.roundArrow}>
                <Ionicons name="arrow-up-outline" size={17} color={colors.ink} />
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  )
}

export default function HomeScreen({ navigation, onExplore, onProfile }) {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadTours() {
    setLoading(true)
    setError(null)
    try {
      const data = await mobileApiRequest('/tours/')
      setTours(data.results || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTours()
  }, [])

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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

      <EditorialHero onExplore={onExplore} />

      <View style={styles.promiseRow}>
        <Ionicons name="compass-outline" size={17} color={colors.turquesaCactours} />
        <Text style={styles.promiseText}>El norte de Colombia, a tu propio ritmo</Text>
        <View style={styles.promiseLine} />
        <Text style={styles.promiseNumber}>12°35&apos; N</Text>
      </View>

      <View style={styles.section}>
        <SectionHeading
          eyebrow="Elige tu próxima salida"
          title="Historias por vivir"
          action="Ver todo"
          onAction={onExplore}
        />
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.turquesaCactours} />
            <Text style={styles.mutedText}>Encontrando experiencias...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorPanel}>
            <Ionicons name="cloud-offline-outline" size={21} color={colors.turquesaCactours} />
            <Text style={styles.errorPanelText}>{error}</Text>
            <Pressable onPress={loadTours} style={styles.retryLink}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : tours.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {tours.slice(0, 5).map((tour) => (
              <FeaturedTour
                key={tour.id}
                tour={tour}
                navigation={navigation}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>Una nueva ruta está por nacer.</Text>
            <Text style={styles.mutedText}>Pronto publicaremos experiencias para recorrer juntos.</Text>
          </View>
        )}
      </View>

      <View style={styles.destinationSection}>
        <View style={styles.destinationHeading}>
          <View>
            <Text style={styles.eyebrow}>POSTALES DE COLOMBIA</Text>
            <Text style={styles.destinationTitle}>Déjate llevar.</Text>
          </View>
          <View style={styles.destinationStamp}>
            <Ionicons name="navigate-outline" size={18} color={colors.turquesaCactours} />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationList}
        >
          {featuredDestinations.map((destination) => (
            <View key={destination.name}>
              <Pressable
                accessibilityRole="button"
                onPress={onExplore}
                style={({ pressed }) => [styles.destinationCard, pressed && styles.pressed]}
              >
                <Image source={{ uri: destination.image }} style={styles.destinationImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(4,35,38,0.78)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.destinationTextBlock}>
                  <Text style={styles.destinationLine}>{destination.line}</Text>
                  <Text style={styles.destinationName}>{destination.name}</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.manifesto}>
        <Text style={styles.manifestoIndex}>01 / VIAJAR CON SENTIDO</Text>
        <Text style={styles.manifestoTitle}>
          No colecciones{'\n'}destinos. <Text style={styles.manifestoItalic}>Déjalos quedarse contigo.</Text>
        </Text>
        <Text style={styles.manifestoBody}>
          Hay lugares que no solo visitas: te cambian la mirada y se quedan en tu historia.
        </Text>
      </View>
      <Text style={styles.footerLine}>CACTOURS · COLOMBIA · VIAJA SIN PRISA</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 30 },
  topbar: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
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
  heroWrap: { paddingHorizontal: spacing.md },
  hero: {
    minHeight: 475,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: colors.azulPetroleo,
    padding: spacing.lg,
    ...shadows.hero,
  },
  heroImage: { borderRadius: radii.xl },
  heroTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.33)',
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: 'rgba(5,31,34,0.28)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8DD1A6',
  },
  liveText: {
    color: colors.blanco,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.15,
  },
  heroIndex: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(5,31,34,0.2)',
  },
  heroIndexText: { color: colors.blanco, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  heroCopy: { marginTop: 70 },
  heroKicker: {
    marginBottom: 9,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.blanco,
    fontSize: 41,
    fontWeight: '800',
    letterSpacing: -1.7,
    lineHeight: 43,
  },
  heroItalic: {
    color: '#A8D9D0',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  heroDescription: {
    maxWidth: 300,
    marginTop: 12,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 19,
  },
  heroCta: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginTop: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    backgroundColor: colors.blanco,
  },
  heroCtaText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  heroBottomline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 24,
  },
  heroLocation: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroLocationText: { color: 'rgba(255,255,255,0.82)', fontSize: 9, fontWeight: '600' },
  carouselControls: { flexDirection: 'row', gap: 7 },
  carouselButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  promiseRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  promiseText: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  promiseLine: { height: 1, flex: 1, backgroundColor: 'rgba(2,99,116,0.16)' },
  promiseNumber: { color: colors.turquesaCactours, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  section: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  sectionHeading: { paddingHorizontal: spacing.md },
  loadingRow: {
    minHeight: 144,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mutedText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  errorPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginHorizontal: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.blanco,
  },
  errorPanelText: { flex: 1, color: colors.muted, fontSize: 11 },
  retryLink: { padding: 5 },
  retryText: { color: colors.turquesaCactours, fontSize: 11, fontWeight: '800' },
  emptyPanel: {
    gap: 6,
    marginHorizontal: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.blanco,
  },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  featuredList: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: 8 },
  featuredCard: {
    width: 258,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  featuredPressable: { overflow: 'hidden', borderRadius: radii.lg },
  featuredImageFrame: { height: 300, justifyContent: 'space-between', padding: 15 },
  featuredImage: { borderRadius: radii.lg },
  featuredTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(4,34,37,0.3)',
  },
  featuredTagText: { color: colors.blanco, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  featuredCardCopy: { gap: 5 },
  featuredDuration: { color: 'rgba(255,255,255,0.74)', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  featuredTitle: { minHeight: 46, color: colors.blanco, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  featuredPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  featuredPriceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 9 },
  featuredPrice: { color: colors.blanco, fontSize: 12, fontWeight: '800' },
  roundArrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.blanco,
  },
  destinationSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(2,99,116,0.09)',
    paddingVertical: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  destinationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  eyebrow: { marginBottom: 5, color: colors.turquesaCactours, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  destinationTitle: { color: colors.ink, fontSize: 23, fontWeight: '800', letterSpacing: -0.8 },
  destinationStamp: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.seaGlass,
  },
  destinationList: { gap: 10, paddingHorizontal: spacing.md },
  destinationCard: {
    width: 146,
    height: 182,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.azulPetroleo,
  },
  destinationImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  destinationTextBlock: { padding: 13 },
  destinationLine: { marginBottom: 3, color: 'rgba(255,255,255,0.73)', fontSize: 8, fontWeight: '700' },
  destinationName: { color: colors.blanco, fontSize: 14, fontWeight: '800' },
  manifesto: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.ink,
  },
  manifestoIndex: { color: '#A8D9D0', fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  manifestoTitle: {
    marginTop: 14,
    color: colors.blanco,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 31,
  },
  manifestoItalic: { color: '#A8D9D0', fontWeight: '500', fontStyle: 'italic' },
  manifestoBody: { marginTop: 12, color: 'rgba(255,255,255,0.68)', fontSize: 11, lineHeight: 18 },
  footerLine: {
    marginTop: spacing.lg,
    color: '#83928D',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  pressed: { opacity: 0.82 },
})
