import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { mobileApiRequest } from '../api/client'
import { ActionButton, Notice, TextField } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'
import { formatCop, getTourImage } from '../utils/tourMedia'

const paymentMethods = [
  { value: 'TRANSFERENCIA', label: 'Transferencia / PSE', icon: 'swap-horizontal-outline' },
  { value: 'TARJETA', label: 'Tarjeta', icon: 'card-outline' },
  { value: 'EFECTIVO', label: 'En agencia', icon: 'cash-outline' },
  { value: 'PAYPAL', label: 'PayPal', icon: 'logo-paypal' },
]

export default function BookingScreen({ route, navigation, user }) {
  const tourId = route.params?.tourId || route.params?.tour?.id
  const [tour, setTour] = useState(route.params?.tour || null)
  const [people, setPeople] = useState(1)
  const [departure, setDeparture] = useState('')
  const [date, setDate] = useState('')
  const [comments, setComments] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [quote, setQuote] = useState(null)
  const [loadingTour, setLoadingTour] = useState(!route.params?.tour?.opciones_disponibles)
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [quoteError, setQuoteError] = useState(null)
  const [reservation, setReservation] = useState(null)

  useEffect(() => {
    let active = true
    async function loadTour() {
      if (!tourId) {
        setError('No encontramos esta experiencia.')
        setLoadingTour(false)
        return
      }
      setLoadingTour(true)
      try {
        const data = await mobileApiRequest(`/tours/${tourId}/`)
        if (active) setTour(data.tour)
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoadingTour(false)
      }
    }
    loadTour()
    return () => { active = false }
  }, [tourId])

  useEffect(() => {
    if (!tourId || !tour) return undefined
    let active = true
    const timer = setTimeout(async () => {
      setLoadingQuote(true)
      setQuoteError(null)
      try {
        const data = await mobileApiRequest('/bookings/cotizar/', {
          method: 'POST',
          body: JSON.stringify({
            tour_id: Number(tourId),
            cant_personas: people,
            opciones_ids: selectedOptions,
          }),
        })
        if (active) setQuote(data)
      } catch (requestError) {
        if (active) setQuoteError(requestError.message)
      } finally {
        if (active) setLoadingQuote(false)
      }
    }, 180)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [people, selectedOptions, tour, tourId])

  function toggleOption(optionId) {
    setSelectedOptions((options) =>
      options.includes(optionId) ? options.filter((id) => id !== optionId) : [...options, optionId],
    )
  }

  function changePeople(delta) {
    const maxPeople = tour?.cupo_maximo || 20
    setPeople((count) => Math.min(maxPeople, Math.max(1, count + delta)))
  }

  async function submitBooking() {
    Keyboard.dismiss()
    setError(null)

    if (!user) {
      navigation.navigate('Login', { returnTo: 'Booking', tourId, tour })
      return
    }
    if (!departure.trim()) {
      setError('Indica desde dónde iniciarías el recorrido.')
      return
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Escribe la fecha en formato AAAA-MM-DD.')
      return
    }

    setSubmitting(true)
    try {
      const data = await mobileApiRequest('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          tour_id: Number(tourId),
          lugar_salida: departure.trim(),
          cant_personas: people,
          medio_pago: paymentMethod,
          ...(date ? { fecha: date } : {}),
          opciones_ids: selectedOptions,
          comentarios: comments.trim(),
        }),
      })
      setReservation(data.reserva)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (reservation) {
    return (
      <ScrollView contentContainerStyle={styles.successScreen}>
        <View style={styles.successSeal}>
          <Ionicons name="checkmark" size={38} color={colors.blanco} />
        </View>
        <Text style={styles.successEyebrow}>SOLICITUD ENVIADA</Text>
        <Text style={styles.successTitle}>Tu próxima historia ya está en marcha.</Text>
        <Text style={styles.successText}>
          El equipo Cactours confirmará la disponibilidad. Esta solicitud no es un pago ni una reserva confirmada.
        </Text>
        <View style={styles.reservationCode}>
          <Text style={styles.reservationCodeLabel}>CÓDIGO DE SOLICITUD</Text>
          <Text style={styles.reservationCodeValue}>{reservation.codigo_reserva}</Text>
        </View>
        <ActionButton
          title="Ver mis solicitudes"
          icon="arrow-forward"
          onPress={() => navigation.navigate('Main', { tab: 'profile', sessionUpdatedAt: Date.now() })}
          style={styles.successAction}
        />
        <Pressable onPress={() => navigation.navigate('Main', { tab: 'explore' })} style={styles.backToExplore}>
          <Text style={styles.backToExploreText}>Seguir explorando</Text>
        </Pressable>
      </ScrollView>
    )
  }

  if (loadingTour && !tour) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.turquesaCactours} />
        <Text style={styles.loadingText}>Preparando tu cotización...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a los detalles"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={18} color={colors.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TU PRÓXIMA HISTORIA</Text>
            <Text style={styles.headerTitle}>Solicitar reserva</Text>
          </View>
        </View>

        {tour ? (
          <View style={styles.tourSummary}>
            <View style={[styles.tourThumb, { backgroundColor: colors.azulPetroleo }]}>
              <Image source={{ uri: getTourImage(tour) }} style={styles.tourThumbImage} />
            </View>
            <View style={styles.tourSummaryCopy}>
              <Text style={styles.tourDestination}>{tour.ciudad_destino}</Text>
              <Text style={styles.tourName} numberOfLines={2}>{tour.nombre_tour}</Text>
            </View>
            <Text style={styles.tourBasePrice}>{formatCop(tour.costo)}</Text>
          </View>
        ) : null}

        {error ? <Notice title="Revisa tu solicitud" message={error} /> : null}

        <View style={styles.formCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}><Text style={styles.stepNumber}>01</Text></View>
            <View>
              <Text style={styles.formTitle}>Cuéntanos tus planes</Text>
              <Text style={styles.formSubtitle}>Ajusta los detalles de tu salida.</Text>
            </View>
          </View>

          <View style={styles.peopleControl}>
            <View style={styles.peopleCopy}>
              <Text style={styles.inputLabel}>¿Cuántas personas viajan?</Text>
              <Text style={styles.inputHint}>Cupo máximo: {tour?.cupo_maximo || 20} personas</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Quitar una persona"
                disabled={people <= 1}
                onPress={() => changePeople(-1)}
                style={[styles.stepperButton, people <= 1 && styles.stepperDisabled]}
              >
                <Ionicons name="remove" size={17} color={colors.turquesaCactours} />
              </Pressable>
              <Text style={styles.peopleCount}>{people}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agregar una persona"
                disabled={people >= (tour?.cupo_maximo || 20)}
                onPress={() => changePeople(1)}
                style={[styles.stepperButton, people >= (tour?.cupo_maximo || 20) && styles.stepperDisabled]}
              >
                <Ionicons name="add" size={17} color={colors.turquesaCactours} />
              </Pressable>
            </View>
          </View>

          <TextField
            label="Lugar de salida"
            icon="navigate-outline"
            placeholder="Ej. Riohacha, La Guajira"
            value={departure}
            onChangeText={setDeparture}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextField
            label="Fecha preferida (opcional)"
            icon="calendar-outline"
            placeholder="AAAA-MM-DD"
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            returnKeyType="next"
          />

          {tour?.opciones_disponibles?.length ? (
            <View style={styles.optionsBlock}>
              <Text style={styles.inputLabel}>Hazla aún más tuya</Text>
              <Text style={styles.inputHint}>Opciones adicionales · se cotizan al instante</Text>
              {tour.opciones_disponibles.map((option) => {
                const selected = selectedOptions.includes(option.id)
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleOption(option.id)}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <Ionicons name="checkmark" size={12} color={colors.blanco} /> : null}
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionName}>{option.nombre_op}</Text>
                      {option.descripcion ? <Text style={styles.optionDescription}>{option.descripcion}</Text> : null}
                    </View>
                    <Text style={styles.optionPrice}>+{formatCop(option.precio_adic)}</Text>
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          <View style={styles.paymentBlock}>
            <Text style={styles.inputLabel}>Medio de pago preferido</Text>
            <Text style={styles.inputHint}>El equipo te confirmará los pasos después.</Text>
            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => {
                const selected = paymentMethod === method.value
                return (
                  <Pressable
                    key={method.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setPaymentMethod(method.value)}
                    style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
                  >
                    <Ionicons name={method.icon} size={16} color={selected ? colors.turquesaCactours : colors.muted} />
                    <Text style={[styles.paymentLabel, selected && styles.paymentLabelSelected]}>{method.label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <TextField
            label="Comentarios o necesidades especiales (opcional)"
            icon="chatbubble-ellipses-outline"
            placeholder="Cuéntanos qué haría especial esta experiencia."
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
            maxLength={500}
            inputStyle={styles.commentsInput}
          />
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <View>
              <Text style={styles.quoteEyebrow}>COTIZACIÓN EN VIVO</Text>
              <Text style={styles.quoteTitle}>Tu inversión estimada</Text>
            </View>
            {loadingQuote ? <ActivityIndicator color={colors.turquesaCactours} /> : null}
          </View>
          {quoteError ? <Text style={styles.quoteError}>{quoteError}</Text> : null}
          <View style={styles.quoteLine}>
            <Text style={styles.quoteLineLabel}>Experiencia · {people} {people === 1 ? 'persona' : 'personas'}</Text>
            <Text style={styles.quoteLineValue}>{quote ? formatCop(quote.subtotal_base) : '—'}</Text>
          </View>
          {quote && Number(quote.subtotal_opciones) > 0 ? (
            <View style={styles.quoteLine}>
              <Text style={styles.quoteLineLabel}>Opciones adicionales</Text>
              <Text style={styles.quoteLineValue}>{formatCop(quote.subtotal_opciones)}</Text>
            </View>
          ) : null}
          <View style={styles.quoteTotalRow}>
            <Text style={styles.quoteTotalLabel}>Total estimado</Text>
            <Text style={styles.quoteTotal}>{quote ? formatCop(quote.costo_total) : 'Calculando...'}</Text>
          </View>
          <Text style={styles.quoteFootnote}>El precio final es calculado por Cactours. Aún no se realizará ningún cobro.</Text>
        </View>

        {!user ? (
          <Notice title="Inicia sesión para continuar" message="Necesitamos asociar la solicitud a tu cuenta Cactours." tone="success" />
        ) : null}
        <ActionButton
          title={submitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
          icon="arrow-forward"
          loading={submitting}
          disabled={loadingTour || loadingQuote || !quote}
          onPress={submitBooking}
          style={styles.submitButton}
        />
        <Text style={styles.legalNote}>Sin pagos en línea · disponibilidad sujeta a confirmación</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mineralIvory },
  content: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: 34 },
  header: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.blanco },
  headerCopy: { flex: 1 },
  eyebrow: { marginBottom: 3, color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  headerTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  tourSummary: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: 'rgba(2,99,116,0.08)', borderRadius: radii.lg, padding: 10, backgroundColor: colors.blanco },
  tourThumb: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 13 },
  tourThumbImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  tourSummaryCopy: { minWidth: 0, flex: 1 },
  tourDestination: { marginBottom: 3, color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  tourName: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  tourBasePrice: { maxWidth: 98, color: colors.turquesaCactours, fontSize: 10, fontWeight: '800', textAlign: 'right' },
  formCard: { gap: spacing.md, borderWidth: 1, borderColor: 'rgba(2,99,116,0.08)', borderRadius: radii.lg, padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.78)' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 3 },
  stepBadge: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.seaGlass },
  stepNumber: { color: colors.turquesaCactours, fontSize: 9, fontWeight: '800' },
  formTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  formSubtitle: { marginTop: 2, color: colors.muted, fontSize: 9 },
  peopleControl: { minHeight: 59, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.06)', paddingBottom: spacing.sm },
  peopleCopy: { flex: 1, gap: 3 },
  inputLabel: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  inputHint: { color: colors.muted, fontSize: 9 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(2,99,116,0.16)', borderRadius: radii.pill, backgroundColor: colors.blanco },
  stepperDisabled: { opacity: 0.38 },
  peopleCount: { minWidth: 12, color: colors.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  optionsBlock: { gap: 8 },
  optionRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: 'rgba(2,99,116,0.09)', borderRadius: radii.md, padding: 9, backgroundColor: colors.blanco },
  optionRowSelected: { borderColor: colors.turquesaCactours, backgroundColor: '#F1F8F5' },
  checkbox: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C6D3CF', borderRadius: 6 },
  checkboxSelected: { borderColor: colors.turquesaCactours, backgroundColor: colors.turquesaCactours },
  optionCopy: { flex: 1 },
  optionName: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  optionDescription: { marginTop: 2, color: colors.muted, fontSize: 8 },
  optionPrice: { color: colors.turquesaCactours, fontSize: 9, fontWeight: '800' },
  paymentBlock: { gap: 8 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentOption: { width: '48%', minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(2,99,116,0.1)', borderRadius: radii.md, paddingHorizontal: 9, backgroundColor: colors.blanco },
  paymentOptionSelected: { borderColor: colors.turquesaCactours, backgroundColor: colors.seaGlass },
  paymentLabel: { flex: 1, color: colors.muted, fontSize: 8, fontWeight: '700' },
  paymentLabelSelected: { color: colors.turquesaCactours },
  commentsInput: { minHeight: 86, textAlignVertical: 'top' },
  quoteCard: { gap: 12, borderRadius: radii.lg, padding: spacing.md, backgroundColor: colors.ink },
  quoteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.16)' },
  quoteEyebrow: { color: '#A8D9D0', fontSize: 7, fontWeight: '800', letterSpacing: 1.3 },
  quoteTitle: { marginTop: 4, color: colors.blanco, fontSize: 15, fontWeight: '800' },
  quoteLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  quoteLineLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9 },
  quoteLineValue: { color: colors.blanco, fontSize: 10, fontWeight: '700' },
  quoteTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)', paddingTop: spacing.sm },
  quoteTotalLabel: { color: colors.blanco, fontSize: 11, fontWeight: '800' },
  quoteTotal: { color: '#A8D9D0', fontSize: 17, fontWeight: '800' },
  quoteFootnote: { color: 'rgba(255,255,255,0.58)', fontSize: 8, lineHeight: 13 },
  quoteError: { color: '#FFB7B0', fontSize: 10 },
  submitButton: { marginTop: 1 },
  legalNote: { color: colors.muted, fontSize: 8, textAlign: 'center' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.mineralIvory },
  loadingText: { color: colors.muted, fontSize: 11 },
  successScreen: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.mineralIvory },
  successSeal: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.turquesaCactours, ...shadows.glow },
  successEyebrow: { marginTop: spacing.lg, color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 1.7 },
  successTitle: { maxWidth: 330, marginTop: 8, color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.9, textAlign: 'center', lineHeight: 33 },
  successText: { maxWidth: 300, marginTop: 9, color: colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  reservationCode: { width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(2,99,116,0.1)', borderRadius: radii.lg, marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.blanco },
  reservationCodeLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  reservationCodeValue: { marginTop: 5, color: colors.turquesaCactours, fontSize: 15, fontWeight: '800', letterSpacing: 0.6 },
  successAction: { width: '100%', marginTop: spacing.md },
  backToExplore: { padding: spacing.md },
  backToExploreText: { color: colors.turquesaCactours, fontSize: 10, fontWeight: '800' },
})
