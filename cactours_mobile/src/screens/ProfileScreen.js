import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ActionButton, BrandMark, Notice, SectionHeading, TextField } from '../components/ui'
import { mobileApiRequest } from '../api/client'
import { colors, radii, shadows, spacing } from '../theme/tokens'
import { formatCop } from '../utils/tourMedia'

function BookingCard({ booking, onCancel, canceling }) {
  const date = booking.fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${booking.fecha}T12:00:00Z`))
    : 'Fecha por confirmar'
  const isPending = booking.estado === 'PENDIENTE'

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingTopline}>
        <Text style={styles.bookingCode}>{booking.codigo_reserva}</Text>
        <View style={[styles.statusPill, isPending ? styles.statusPending : styles.statusSettled]}>
          <View style={[styles.statusDot, isPending ? styles.statusDotPending : styles.statusDotSettled]} />
          <Text style={[styles.statusText, isPending ? styles.statusTextPending : styles.statusTextSettled]}>
            {booking.estado_display}
          </Text>
        </View>
      </View>
      <Text style={styles.bookingTitle}>{booking.tour?.nombre_tour || booking.destino}</Text>
      <View style={styles.bookingMetaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.turquesaCactours} />
        <Text style={styles.bookingMeta}>{date}</Text>
        <View style={styles.metaDivider} />
        <Ionicons name="people-outline" size={14} color={colors.turquesaCactours} />
        <Text style={styles.bookingMeta}>
          {booking.cant_personas} {booking.cant_personas === 1 ? 'viajero' : 'viajeros'}
        </Text>
      </View>
      <View style={styles.bookingFooter}>
        <View>
          <Text style={styles.bookingTotalLabel}>TOTAL DE LA SOLICITUD</Text>
          <Text style={styles.bookingTotal}>{formatCop(booking.costo_total)}</Text>
        </View>
        {isPending ? (
          <Pressable
            accessibilityRole="button"
            disabled={canceling}
            onPress={() => onCancel(booking)}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            {canceling ? (
              <ActivityIndicator size="small" color={colors.errorText} />
            ) : (
              <Text style={styles.cancelText}>Cancelar</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

export default function ProfileScreen({
  navigation,
  user,
  onUserUpdated,
  onLogout,
  loading: sessionLoading,
  sessionNotice,
}) {
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cancelingId, setCancelingId] = useState(null)
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' })
  const fullName = user?.persona?.nombre_completo || user?.username || 'Viajero'

  useEffect(() => {
    setForm({
      nombre: user?.persona?.nombre || '',
      apellido: user?.persona?.apellido || '',
      telefono: user?.persona?.telefono || '',
    })
  }, [user])

  const loadBookings = useCallback(async () => {
    if (!user) return
    setLoadingBookings(true)
    setBookingError(null)
    try {
      const data = await mobileApiRequest('/bookings/')
      setBookings(data.results || [])
    } catch (requestError) {
      setBookingError(requestError.message)
    } finally {
      setLoadingBookings(false)
    }
  }, [user])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  async function saveProfile() {
    setSaving(true)
    setProfileError(null)
    setSuccess(null)
    try {
      const data = await mobileApiRequest('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      onUserUpdated(data.user)
      setEditing(false)
      setSuccess('Tus datos quedaron actualizados.')
    } catch (requestError) {
      setProfileError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function performCancellation(booking) {
    setCancelingId(booking.id)
    setBookingError(null)
    try {
      await mobileApiRequest(`/bookings/${booking.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'CANCELADA' }),
      })
      setSuccess(`La solicitud ${booking.codigo_reserva} fue cancelada.`)
      await loadBookings()
    } catch (requestError) {
      setBookingError(requestError.message)
    } finally {
      setCancelingId(null)
    }
  }

  function confirmCancellation(booking) {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`¿Cancelar la solicitud ${booking.codigo_reserva}?`)) {
        performCancellation(booking)
      }
      return
    }
    Alert.alert(
      'Cancelar solicitud',
      `¿Quieres cancelar ${booking.codigo_reserva}?`,
      [
        { text: 'Mantener solicitud', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => performCancellation(booking) },
      ],
    )
  }

  if (!user) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.guestContent}
        showsVerticalScrollIndicator={false}
      >
        <BrandMark />
        <View style={styles.guestCard}>
          <View style={styles.guestIcon}>
            <Ionicons name="person-circle-outline" size={42} color={colors.turquesaCactours} />
          </View>
          <Text style={styles.eyebrow}>TU ESPACIO CACTOURS</Text>
          <Text style={styles.guestTitle}>Cada viaje{'\n'}empieza contigo.</Text>
          <Text style={styles.guestText}>
            Inicia sesión para guardar tus datos, solicitar una reserva y seguir cada detalle de tu próxima experiencia.
          </Text>
          <ActionButton
            title="Iniciar sesión"
            icon="arrow-forward"
            onPress={() => navigation.navigate('Login')}
            style={styles.guestAction}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>¿Aún no tienes cuenta? <Text style={styles.registerTextBold}>Crear cuenta</Text></Text>
          </Pressable>
        </View>
        {sessionNotice ? <Notice title="Aviso de sesión" message={sessionNotice} /> : null}
        {sessionLoading ? <ActivityIndicator color={colors.turquesaCactours} /> : null}
      </ScrollView>
    )
  }

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
          accessibilityLabel="Cerrar sesión"
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.turquesaCactours} />
        </Pressable>
      </View>

      <View style={styles.welcomeCard}>
        <View style={styles.welcomeOrnament} />
        <Text style={styles.welcomeEyebrow}>TU ESPACIO CACTOURS</Text>
        <Text style={styles.welcomeTitle}>Hola, <Text style={styles.welcomeName}>{fullName.split(/\s+/)[0]}.</Text></Text>
        <Text style={styles.welcomeSubtitle}>Tus próximas historias empiezan aquí.</Text>
        <View style={styles.welcomeStats}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statCaption}>SOLICITUDES</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{user.cliente?.contador_reservas || 0}</Text>
            <Text style={styles.statCaption}>VIAJES CONTIGO</Text>
          </View>
          <Ionicons name="compass-outline" size={38} color="rgba(255,255,255,0.27)" />
        </View>
      </View>

      {success ? <Notice title="Listo" message={success} tone="success" /> : null}
      {profileError ? <Notice title="No se pudo actualizar tu perfil" message={profileError} /> : null}

      <View style={styles.profileSection}>
        <SectionHeading
          eyebrow="INFORMACIÓN DE CUENTA"
          title="Tus datos"
          action={editing ? 'Cancelar' : 'Editar'}
          onAction={() => {
            setProfileError(null)
            setSuccess(null)
            if (editing) {
              setForm({
                nombre: user.persona?.nombre || '',
                apellido: user.persona?.apellido || '',
                telefono: user.persona?.telefono || '',
              })
            }
            setEditing((value) => !value)
          }}
        />
        <View style={styles.detailsCard}>
          {editing ? (
            <View style={styles.editForm}>
              <TextField
                label="Nombre"
                icon="person-outline"
                value={form.nombre}
                onChangeText={(nombre) => setForm((value) => ({ ...value, nombre }))}
                autoCapitalize="words"
              />
              <TextField
                label="Apellido"
                icon="person-outline"
                value={form.apellido}
                onChangeText={(apellido) => setForm((value) => ({ ...value, apellido }))}
                autoCapitalize="words"
              />
              <TextField
                label="Teléfono"
                icon="call-outline"
                value={form.telefono}
                onChangeText={(telefono) => setForm((value) => ({ ...value, telefono }))}
                keyboardType="phone-pad"
              />
              <ActionButton title="Guardar cambios" icon="checkmark" loading={saving} onPress={saveProfile} />
            </View>
          ) : (
            <>
              <ProfileInfo icon="person-outline" label="Nombre completo" value={fullName} />
              <ProfileInfo icon="mail-outline" label="Correo electrónico" value={user.email || '—'} />
              <ProfileInfo icon="id-card-outline" label="Identificación" value={user.persona?.identificacion || '—'} />
              <ProfileInfo icon="call-outline" label="Teléfono" value={user.persona?.telefono || '—'} last />
            </>
          )}
        </View>
      </View>

      <View style={styles.bookingsSection}>
        <SectionHeading
          eyebrow="TUS PRÓXIMOS RECUERDOS"
          title="Mis solicitudes"
          action={loadingBookings ? undefined : 'Actualizar'}
          onAction={loadBookings}
        />
        {bookingError ? <Notice title="No pudimos consultar tu historial" message={bookingError} /> : null}
        {loadingBookings ? (
          <View style={styles.loadingBookings}>
            <ActivityIndicator color={colors.turquesaCactours} />
            <Text style={styles.bookingMeta}>Consultando tus solicitudes...</Text>
          </View>
        ) : bookings.length ? (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={confirmCancellation}
              canceling={cancelingId === booking.id}
            />
          ))
        ) : !bookingError ? (
          <View style={styles.emptyBookings}>
            <View style={styles.emptyIcon}>
              <Ionicons name="airplane-outline" size={22} color={colors.turquesaCactours} />
            </View>
            <Text style={styles.emptyTitle}>Aún no hay solicitudes.</Text>
            <Text style={styles.emptyBody}>Tu próxima historia puede empezar con una nueva ruta.</Text>
            <ActionButton
              title="Explorar experiencias"
              icon="arrow-forward"
              variant="quiet"
              onPress={() => navigation.navigate('Main', { tab: 'explore' })}
              style={styles.exploreAction}
            />
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onLogout}
        style={({ pressed }) => [styles.signOutLink, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={17} color={colors.errorText} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </Pressable>
      <Text style={styles.footerLine}>CACTOURS · VIAJA SIN PRISA</Text>
    </ScrollView>
  )
}

function ProfileInfo({ icon, label, value, last }) {
  return (
    <View style={[styles.profileInfo, last && styles.profileInfoLast]}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={16} color={colors.turquesaCactours} /></View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: 26 },
  guestContent: { flexGrow: 1, justifyContent: 'center', gap: spacing.xl, padding: spacing.md },
  topbar: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  logoutButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.16)',
    backgroundColor: colors.blanco,
  },
  welcomeCard: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: colors.ink,
  },
  welcomeOrnament: {
    position: 'absolute',
    top: -50,
    right: -25,
    width: 170,
    height: 170,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100,
  },
  welcomeEyebrow: { color: '#A8D9D0', fontSize: 8, fontWeight: '800', letterSpacing: 1.6 },
  welcomeTitle: { marginTop: 10, color: colors.blanco, fontSize: 30, fontWeight: '800', letterSpacing: -1.2 },
  welcomeName: { color: '#A8D9D0', fontStyle: 'italic', fontWeight: '500' },
  welcomeSubtitle: { marginTop: 3, color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  welcomeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  statBlock: { gap: 2 },
  statNumber: { color: colors.blanco, fontSize: 19, fontWeight: '800' },
  statCaption: { color: 'rgba(255,255,255,0.61)', fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  statSeparator: { width: 1, height: 29, backgroundColor: 'rgba(255,255,255,0.18)' },
  profileSection: { marginTop: spacing.xl },
  detailsCard: {
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.09)',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  profileInfo: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,17,0.06)',
  },
  profileInfoLast: { borderBottomWidth: 0 },
  infoIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.seaGlass },
  infoText: { flex: 1, gap: 3 },
  infoLabel: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  infoValue: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  editForm: { gap: spacing.md, paddingVertical: spacing.md },
  bookingsSection: { marginTop: spacing.xl },
  bookingCard: {
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.09)',
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.blanco,
    ...shadows.subtle,
  },
  bookingTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingCode: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 6 },
  statusPending: { backgroundColor: '#FEF7E0' },
  statusSettled: { backgroundColor: colors.seaGlass },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusDotPending: { backgroundColor: '#C17E16' },
  statusDotSettled: { backgroundColor: colors.turquesaCactours },
  statusText: { fontSize: 8, fontWeight: '800' },
  statusTextPending: { color: '#8A4B00' },
  statusTextSettled: { color: colors.turquesaCactours },
  bookingTitle: { marginTop: 12, color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  bookingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  bookingMeta: { color: colors.muted, fontSize: 9 },
  metaDivider: { width: 1, height: 12, backgroundColor: colors.line, marginHorizontal: 2 },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,17,17,0.07)',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  bookingTotalLabel: { color: colors.muted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  bookingTotal: { marginTop: 3, color: colors.turquesaCactours, fontSize: 15, fontWeight: '800' },
  cancelButton: { minWidth: 69, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.errorBg },
  cancelText: { color: colors.errorText, fontSize: 9, fontWeight: '800' },
  loadingBookings: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyBookings: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.08)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  emptyIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.seaGlass },
  emptyTitle: { marginTop: 11, color: colors.ink, fontSize: 15, fontWeight: '800' },
  emptyBody: { marginTop: 5, color: colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 17 },
  exploreAction: { width: '100%', marginTop: spacing.md },
  signOutLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: spacing.md },
  signOutText: { color: colors.errorText, fontSize: 11, fontWeight: '800' },
  footerLine: { marginTop: 3, color: '#87938E', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  guestCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.76)',
    ...shadows.auth,
  },
  guestIcon: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.seaGlass, marginBottom: spacing.md },
  eyebrow: { color: colors.turquesaCactours, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  guestTitle: { marginTop: 8, color: colors.ink, fontSize: 31, fontWeight: '800', letterSpacing: -1.1, lineHeight: 35 },
  guestText: { marginTop: 10, color: colors.muted, fontSize: 12, lineHeight: 19 },
  guestAction: { marginTop: spacing.lg },
  registerLink: { alignItems: 'center', paddingTop: spacing.md },
  registerText: { color: colors.muted, fontSize: 10 },
  registerTextBold: { color: colors.turquesaCactours, fontWeight: '800' },
  pressed: { opacity: 0.82 },
})
