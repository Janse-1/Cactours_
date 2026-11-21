import React, { useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { mobileApiRequest } from '../api/client'
import { ActionButton, BrandMark, Notice, TextField } from '../components/ui'
import { colors, radii, shadows, spacing } from '../theme/tokens'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PasswordResetScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const validEmail = emailPattern.test(email.trim())

  async function submit() {
    if (!validEmail || loading) return
    Keyboard.dismiss()
    setError(null)
    setLoading(true)
    try {
      await mobileApiRequest('/auth/password-reset/', {
        method: 'POST',
        body: JSON.stringify({ correo: email.trim().toLowerCase() }),
      })
      setSent(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topbar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver al inicio de sesión"
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={18} color={colors.blanco} />
              </Pressable>
              <Text style={styles.topbarLabel}>RECUPERA TU ACCESO</Text>
              <View style={styles.topbarSpacer} />
            </View>

            <View style={styles.card}>
              <BrandMark compact />
              <View style={styles.emblem}>
                <Ionicons name={sent ? 'mail-open-outline' : 'key-outline'} size={25} color={colors.turquesaCactours} />
              </View>
              <Text style={styles.eyebrow}>{sent ? 'REVISA TU CORREO' : 'VOLVAMOS AL CAMINO'}</Text>
              <Text style={styles.title}>
                {sent ? 'Tu solicitud está en camino.' : 'Recupera tu contraseña.'}
              </Text>
              <Text style={styles.subtitle}>
                {sent
                  ? 'Si el correo está registrado, recibirás instrucciones para recuperar el acceso a tu cuenta.'
                  : 'Escribe el correo asociado a tu cuenta y te enviaremos instrucciones para restablecerla.'}
              </Text>

              {error ? <Notice title="No pudimos enviar la solicitud" message={error} /> : null}
              {sent ? (
                <Notice
                  tone="success"
                  title="Solicitud recibida"
                  message="Por seguridad, no confirmamos si una dirección está registrada. Revisa tu bandeja de entrada."
                />
              ) : (
                <View style={styles.form}>
                  <TextField
                    label="Correo electrónico"
                    icon="mail-outline"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value)
                      setError(null)
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    onSubmitEditing={submit}
                  />
                  <ActionButton
                    title={loading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
                    icon="arrow-forward"
                    loading={loading}
                    disabled={!validEmail || loading}
                    onPress={submit}
                  />
                </View>
              )}

              {sent ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Login')}
                  style={({ pressed }) => [styles.loginLink, pressed && styles.pressed]}
                >
                  <Text style={styles.loginLinkText}>Volver a iniciar sesión</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.turquesaCactours} />
                </Pressable>
              ) : null}
            </View>

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
  screen: { flex: 1, backgroundColor: colors.ink },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
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
  card: {
    width: '100%',
    maxWidth: 480,
    gap: spacing.md,
    marginTop: 'auto',
    marginBottom: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: colors.mineralIvory,
    ...shadows.auth,
  },
  emblem: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.seaGlass,
  },
  eyebrow: { color: colors.turquesaCactours, fontSize: 8, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -1.15, lineHeight: 34 },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  form: { gap: spacing.md, marginTop: spacing.xs },
  loginLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: spacing.xs },
  loginLinkText: { color: colors.turquesaCactours, fontSize: 11, fontWeight: '800' },
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
