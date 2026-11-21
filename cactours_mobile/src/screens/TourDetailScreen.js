import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
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
import { ActionButton, Notice } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'
import { formatCop, getTourImage } from '../utils/tourMedia'

export default function TourDetailScreen({ route, navigation, user }) {
  const [tour, setTour] = useState(route.params?.tour || null)
  const [loading, setLoading] = useState(!route.params?.tour)
  const [error, setError] = useState(null)
  const tourId = route.params?.tour?.id || route.params?.tourId

  useEffect(() => {
    let active = true
    async function loadDetail() {
      if (!tourId) {
        setError('No encontramos el identificador de esta experiencia.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await mobileApiRequest(`/tours/${tourId}/`)
        if (active) setTour(data.tour)
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDetail()
    return () => { active = false }
  }, [tourId])

  function startBooking() {
    if (!tour) return
    if (!user) {
      navigation.navigate('Login', { returnTo: 'Booking', tourId: tour.id, tour })
      return
    }
    navigation.navigate('Booking', { tourId: tour.id, tour })
  }

  if (loading && !tour) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator size="large" color={colors.turquesaCactours} />
        <Text style={styles.stateTitle}>Preparando esta experiencia...</Text>
      </View>
    )
  }

  if (!tour) {
    return (
      <View style={styles.stateScreen}>
        <Ionicons name="compass-outline" size={34} color={colors.turquesaCactours} />
        <Text style={styles.stateTitle}>No pudimos abrir este tour.</Text>
        <Notice message={error || 'Intenta de nuevo en unos momentos.'} />
        <ActionButton title="Volver al catálogo" icon="arrow-back" variant="quiet" onPress={() => navigation.goBack()} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <ImageBackground
            source={{ uri: getTourImage(tour) }}
            resizeMode="cover"
            imageStyle={styles.heroImage}
            style={styles.hero}
          >
            <LinearGradient colors={['rgba(5,34,37,0.22)', 'transparent', 'rgba(5,34,37,0.82)']} style={StyleSheet.absoluteFill} />
            <View style={styles.heroTopbar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver"
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={18} color={colors.ink} />
              </Pressable>
              <View style={styles.heroPill}>
                <Ionicons name="compass-outline" size={13} color={colors.blanco} />
                <Text style={styles.heroPillText}>EXPERIENCIA CACTOURS</Text>
              </View>
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.destinationLine}>
                <Ionicons name="location" size={14} color="#B8D7D1" />
                <Text style={styles.destinationText}>{tour.ciudad_destino}</Text>
              </View>
              <Text style={styles.heroTitle}>{tour.nombre_tour}</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.body}>
          {error ? <Notice title="Mostramos la última información disponible" message={error} tone="success" /> : null}
          <Text style={styles.eyebrow}>DESCUBRE EL TERRITORIO</Text>
          <Text style={styles.description}>{tour.descripcion}</Text>

          <View style={styles.factsRow}>
            <Fact icon="time-outline" label="DURACIÓN" value={`${tour.duracion_dias || 1} ${(tour.duracion_dias || 1) === 1 ? 'día' : 'días'}`} />
            <View style={styles.factDivider} />
            <Fact icon="people-outline" label="CUPO MÁXIMO" value={`${tour.cupo_maximo || '—'} personas`} />
          </View>

          {tour.opciones_disponibles?.length ? (
            <View style={styles.optionsSection}>
              <Text style={styles.optionsTitle}>Personaliza tu experiencia</Text>
              {tour.opciones_disponibles.map((option) => (
                <View key={option.id} style={styles.optionRow}>
                  <View style={styles.optionIcon}><Ionicons name="add" size={16} color={colors.turquesaCactours} /></View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionName}>{option.nombre_op}</Text>
                    {option.descripcion ? <Text style={styles.optionDescription}>{option.descripcion}</Text> : null}
                  </View>
                  <Text style={styles.optionPrice}>+{formatCop(option.precio_adic)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.priceCard}>
            <View style={styles.priceCardTop}>
              <View>
                <Text style={styles.priceEyebrow}>PRECIO BASE POR PERSONA</Text>
                <Text style={styles.price}>{formatCop(tour.costo)}</Text>
              </View>
              <View style={styles.priceSeal}>
                <Ionicons name="shield-checkmark-outline" size={19} color={colors.turquesaCactours} />
              </View>
            </View>
            <ActionButton title="Solicitar reserva" icon="arrow-forward" onPress={startBooking} />
            <View style={styles.noChargeNote}>
              <Ionicons name="information-circle-outline" size={15} color={colors.turquesaCactours} />
              <Text style={styles.noChargeText}>Enviarás una solicitud; no es un pago ni una confirmación.</Text>
            </View>
          </View>
          <Text style={styles.footer}>CACTOURS · VIAJA SIN PRISA</Text>
        </View>
      </ScrollView>
    </View>
  )
}

function Fact({ icon, label, value }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}><Ionicons name={icon} size={17} color={colors.turquesaCactours} /></View>
      <View style={styles.factCopy}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  imageWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  hero: { minHeight: 400, justifyContent: 'space-between', overflow: 'hidden', borderRadius: radii.xl, backgroundColor: colors.azulPetroleo, padding: spacing.md },
  heroImage: { borderRadius: radii.xl },
  heroTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.94)' },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(4,33,36,0.3)' },
  heroPillText: { color: colors.blanco, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  heroCopy: { gap: 7 },
  destinationLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  destinationText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700' },
  heroTitle: { maxWidth: 320, color: colors.blanco, fontSize: 30, fontWeight: '800', letterSpacing: -1, lineHeight: 34 },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  eyebrow: { marginBottom: 8, color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 21 },
  factsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(17,17,17,0.08)', marginVertical: spacing.lg, paddingVertical: spacing.md },
  fact: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  factIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.seaGlass },
  factCopy: { minWidth: 0, flex: 1 },
  factLabel: { color: colors.muted, fontSize: 7, fontWeight: '800', letterSpacing: 0.6 },
  factValue: { marginTop: 3, color: colors.ink, fontSize: 11, fontWeight: '800' },
  factDivider: { width: 1, height: 34, backgroundColor: colors.line, marginHorizontal: spacing.sm },
  optionsSection: { marginBottom: spacing.lg },
  optionsTitle: { marginBottom: 7, color: colors.ink, fontSize: 16, fontWeight: '800' },
  optionRow: { minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.06)' },
  optionIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.seaGlass },
  optionCopy: { flex: 1 },
  optionName: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  optionDescription: { marginTop: 2, color: colors.muted, fontSize: 9 },
  optionPrice: { color: colors.turquesaCactours, fontSize: 10, fontWeight: '800' },
  priceCard: { gap: spacing.md, borderWidth: 1, borderColor: 'rgba(2,99,116,0.11)', borderRadius: radii.lg, padding: spacing.md, backgroundColor: colors.blanco, ...shadows.subtle },
  priceCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceEyebrow: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  price: { marginTop: 4, color: colors.turquesaCactours, fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  priceSeal: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.seaGlass },
  noChargeNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noChargeText: { flex: 1, color: colors.muted, fontSize: 9, lineHeight: 14 },
  footer: { marginTop: spacing.lg, color: '#87938E', fontSize: 8, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center' },
  stateScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.mineralIvory },
  stateTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  pressed: { opacity: 0.84 },
})
