import React, { useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { mobileApiRequest, saveSessionTokens } from '../api/client'
import { ActionButton, BrandMark, Notice, TextField, useReduceMotion } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AnimatedField({ index, active, reduceMotion, children }) {
  const progress = useSharedValue(reduceMotion || !active ? 1 : 0)

  useEffect(() => {
    if (reduceMotion || !active) {
      progress.value = 1
      return
    }

    progress.value = 0
    progress.value = withDelay(index * 58, withTiming(1, { duration: 300 }))
  }, [active, index, progress, reduceMotion])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }))

  return <Animated.View style={style}>{children}</Animated.View>
}

function AnimatedNotice({ error }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    if (error) {
      progress.value = 0
      progress.value = withSpring(1, { damping: 20, stiffness: 190 })
    } else {
      progress.value = 0
    }
  }, [error, progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 7 }],
  }))

  if (!error) return null

  return (
    <Animated.View style={style}>
      <Notice title="No pudimos completar la solicitud" message={error} />
    </Animated.View>
  )
}

function ModeSwitch({ isRegister, onChange, reduceMotion }) {
  const [width, setWidth] = useState(0)
  const position = useSharedValue(isRegister ? 1 : 0)

  useEffect(() => {
    position.value = reduceMotion
      ? (isRegister ? 1 : 0)
      : withSpring(isRegister ? 1 : 0, { damping: 20, stiffness: 180 })
  }, [isRegister, position, reduceMotion])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * width / 2 }],
  }))
  const segmentWidth = width ? (width - 8) / 2 : 0

  return (
    <View style={styles.modeSwitch} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {segmentWidth ? (
        <Animated.View style={[styles.modeIndicator, { width: segmentWidth }, indicatorStyle]} />
      ) : null}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: !isRegister }}
        onPress={() => !isRegister || onChange(false)}
        style={styles.modeButton}
      >
        <Text style={[styles.modeText, !isRegister && styles.modeTextActive]}>Iniciar sesión</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isRegister }}
        onPress={() => isRegister || onChange(true)}
        style={styles.modeButton}
      >
        <Text style={[styles.modeText, isRegister && styles.modeTextActive]}>Crear cuenta</Text>
      </Pressable>
    </View>
  )
}

function PasswordToggle({ visible, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onPress={onPress}
      hitSlop={8}
      style={styles.passwordToggle}
    >
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
    </Pressable>
  )
}

export default function AuthScreen({ route, navigation, onAuthenticated }) {
  const isRegister = route.name === 'Register'
  const reduceMotion = useReduceMotion()
  const [form, setForm] = useState({
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    identificacion: '',
    telefono: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cardProgress = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) {
      cardProgress.value = 1
      return
    }

    cardProgress.value = 0
    cardProgress.value = withTiming(1, { duration: 420 })
  }, [cardProgress, isRegister, reduceMotion])

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [{ translateY: (1 - cardProgress.value) * 18 }],
  }))

  const emailValid = isRegister
    ? emailPattern.test(form.correo.trim())
    : form.correo.trim().length >= 3
  const passwordValid = isRegister ? form.password.length >= 8 : form.password.length > 0
  const registrationFieldsValid = form.nombre.trim()
    && form.apellido.trim()
    && form.identificacion.trim()
    && form.telefono.trim()
    && confirmPassword === form.password
  const canSubmit = emailValid && passwordValid && (!isRegister || registrationFieldsValid)

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    if (error) setError(null)
  }

  async function submit() {
    if (!canSubmit || loading) return
    Keyboard.dismiss()
    setError(null)
    setLoading(true)
    try {
      const registrationData = {
        ...form,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        identificacion: form.identificacion.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim().toLowerCase(),
      }
      const data = await mobileApiRequest(
        isRegister ? '/auth/register/' : '/auth/login/',
        {
          method: 'POST',
          body: JSON.stringify(isRegister
            ? registrationData
            : { correo: form.correo.trim(), password: form.password }),
        },
      )
      await saveSessionTokens(data.tokens)
      onAuthenticated(data.user)

      if (route.params?.returnTo === 'Booking' && route.params?.tourId) {
        navigation.replace('Booking', {
          tourId: route.params.tourId,
          tour: route.params.tour,
        })
      } else {
        navigation.navigate('Main', { tab: 'profile', sessionUpdatedAt: Date.now() })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextIsRegister) {
    if (nextIsRegister !== isRegister) {
      navigation.replace(nextIsRegister ? 'Register' : 'Login', route.params)
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={colors.ink} />
      <LinearGradient
        colors={['#0D3E48', colors.ink, '#0B2830']}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbit} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topbar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver"
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={18} color={colors.blanco} />
              </Pressable>
              <Text style={styles.topbarLabel}>TU PRÓXIMA HISTORIA</Text>
              <View style={styles.topbarSpacer} />
            </View>

            <Animated.View style={[styles.authCard, cardStyle]}>
              <View style={styles.cardHeader}>
                <BrandMark compact />
                <View style={styles.secureBadge}>
                  <Ionicons name="shield-checkmark-outline" size={13} color={colors.turquesaCactours} />
                  <Text style={styles.secureText}>ACCESO SEGURO</Text>
                </View>
              </View>

              <ModeSwitch
                isRegister={isRegister}
                onChange={switchMode}
                reduceMotion={reduceMotion}
              />

              <View style={styles.heading}>
                <Text style={styles.eyebrow}>{isRegister ? 'EMPIEZA A DESCUBRIR' : 'BIENVENIDO DE VUELTA'}</Text>
                <Text style={styles.title}>
                  {isRegister ? 'Crea tu próxima historia.' : '¡Qué bueno tenerte de vuelta!'}
                </Text>
                <Text style={styles.subtitle}>
                  {isRegister
                    ? 'Únete a Cactours y planea cada detalle de tu próximo viaje.'
                    : 'Ingresa y continúa descubriendo nuevos destinos.'}
                </Text>
              </View>

              <AnimatedNotice error={error} />

              <View style={styles.form}>
                {isRegister ? (
                  <>
                    <AnimatedField index={0} active={isRegister} reduceMotion={reduceMotion}>
                      <View style={styles.splitRow}>
                        <TextField
                          label="Nombre"
                          icon="person-outline"
                          value={form.nombre}
                          onChangeText={(value) => updateField('nombre', value)}
                          autoCapitalize="words"
                          autoComplete="given-name"
                          returnKeyType="next"
                          style={styles.splitField}
                        />
                        <TextField
                          label="Apellido"
                          icon="person-outline"
                          value={form.apellido}
                          onChangeText={(value) => updateField('apellido', value)}
                          autoCapitalize="words"
                          autoComplete="family-name"
                          returnKeyType="next"
                          style={styles.splitField}
                        />
                      </View>
                    </AnimatedField>
                    <AnimatedField index={1} active={isRegister} reduceMotion={reduceMotion}>
                      <TextField
                        label="Documento de identidad"
                        icon="card-outline"
                        value={form.identificacion}
                        onChangeText={(value) => updateField('identificacion', value)}
                        autoCapitalize="characters"
                        autoComplete="off"
                        returnKeyType="next"
                      />
                    </AnimatedField>
                    <AnimatedField index={2} active={isRegister} reduceMotion={reduceMotion}>
                      <TextField
                        label="Teléfono"
                        icon="call-outline"
                        value={form.telefono}
                        onChangeText={(value) => updateField('telefono', value)}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        returnKeyType="next"
                      />
                    </AnimatedField>
                  </>
                ) : null}

                <AnimatedField index={isRegister ? 3 : 0} active reduceMotion={reduceMotion}>
                  <TextField
                    label={isRegister ? 'Correo electrónico' : 'Correo electrónico o usuario'}
                    icon="mail-outline"
                    value={form.correo}
                    onChangeText={(value) => updateField('correo', value)}
                    keyboardType={isRegister ? 'email-address' : 'default'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={isRegister ? 'email' : 'username'}
                    textContentType={isRegister ? 'emailAddress' : 'username'}
                    returnKeyType="next"
                  />
                </AnimatedField>

                <AnimatedField index={isRegister ? 4 : 1} active reduceMotion={reduceMotion}>
                  <TextField
                    label={isRegister ? 'Contraseña · mínimo 8 caracteres' : 'Contraseña'}
                    icon="lock-closed-outline"
                    value={form.password}
                    onChangeText={(value) => updateField('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    textContentType={isRegister ? 'newPassword' : 'password'}
                    returnKeyType={isRegister ? 'next' : 'done'}
                    onSubmitEditing={isRegister ? undefined : submit}
                    rightAccessory={
                      <PasswordToggle
                        visible={showPassword}
                        onPress={() => setShowPassword((visible) => !visible)}
                      />
                    }
                  />
                </AnimatedField>

                {isRegister ? (
                  <AnimatedField index={5} active={isRegister} reduceMotion={reduceMotion}>
                    <TextField
                      label="Confirma tu contraseña"
                      icon="lock-closed-outline"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="done"
                      onSubmitEditing={submit}
                      error={confirmPassword && confirmPassword !== form.password ? 'Las contraseñas no coinciden.' : null}
                      rightAccessory={
                        <PasswordToggle
                          visible={showConfirmPassword}
                          onPress={() => setShowConfirmPassword((visible) => !visible)}
                        />
                      }
                    />
                  </AnimatedField>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('PasswordReset')}
                    style={({ pressed }) => [styles.forgotLink, pressed && styles.pressed]}
                  >
                    <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                  </Pressable>
                )}

                <ActionButton
                  title={loading ? (isRegister ? 'CREANDO CUENTA...' : 'INGRESANDO...') : (isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN')}
                  icon={isRegister ? 'arrow-forward' : 'log-in-outline'}
                  loading={loading}
                  disabled={!canSubmit || loading}
                  onPress={submit}
                  style={styles.submitButton}
                />
              </View>

              <View style={styles.privacyNote}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.muted} />
                <Text style={styles.privacyText}>Tus datos están protegidos. Viaja con confianza.</Text>
              </View>
            </Animated.View>

            <View style={styles.footer}>
              <BrandMark compact light />
              <Text style={styles.footerCaption}>COLOMBIA · VIAJA SIN PRISA</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: colors.ink },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  orbit: {
    position: 'absolute',
    top: -190,
    right: -130,
    width: 410,
    height: 410,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 205,
  },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  topbar: {
    width: '100%',
    maxWidth: 480,
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topbarLabel: { color: 'rgba(255,255,255,0.58)', fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  topbarSpacer: { width: 38 },
  authCard: {
    width: '100%',
    maxWidth: 480,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: colors.mineralIvory,
    ...shadows.auth,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(2,99,116,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  secureText: { color: colors.turquesaCactours, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  modeSwitch: {
    position: 'relative',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    padding: 4,
    backgroundColor: '#E6EDE8',
  },
  modeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.blanco,
    ...shadows.subtle,
  },
  modeButton: { zIndex: 1, flex: 1, alignItems: 'center', justifyContent: 'center', height: 38 },
  modeText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  modeTextActive: { color: colors.turquesaCactours, fontWeight: '800' },
  heading: { gap: 7, paddingTop: 1 },
  eyebrow: { color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -1.15, lineHeight: 34 },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  form: { gap: spacing.sm },
  splitRow: { flexDirection: 'row', gap: spacing.sm },
  splitField: { minWidth: 0, flex: 1 },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: 3 },
  forgotText: { color: colors.turquesaCactours, fontSize: 10, fontWeight: '700' },
  passwordToggle: { padding: 3 },
  submitButton: { marginTop: 3 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 2 },
  privacyText: { color: colors.muted, fontSize: 9 },
  footer: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  footerCaption: { color: 'rgba(255,255,255,0.42)', fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  pressed: { opacity: 0.78 },
})
