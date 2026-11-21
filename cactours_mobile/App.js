import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { clearSessionTokens, getAccessToken, getRefreshToken, mobileApiRequest } from './src/api/client'
import { colors } from './src/theme/tokens'
import AuthScreen from './src/screens/AuthScreen'
import BookingScreen from './src/screens/BookingScreen'
import MainTabsScreen from './src/screens/MainTabsScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import PasswordResetScreen from './src/screens/PasswordResetScreen'
import SplashScreen from './src/screens/SplashScreen'
import TourDetailScreen from './src/screens/TourDetailScreen'
import { hasCompletedOnboarding, markOnboardingComplete } from './src/utils/onboardingStorage'

const Stack = createNativeStackNavigator()

export default function App() {
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionNotice, setSessionNotice] = useState(null)
  const [bootLoading, setBootLoading] = useState(true)
  const [bootError, setBootError] = useState(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [bootAttempt, setBootAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const startedAt = Date.now()
    setBootError(null)

    async function hydrateSession() {
      try {
        const [accessToken, refreshToken, hasSeenOnboarding] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
          hasCompletedOnboarding(),
        ])
        if (active) setOnboardingComplete(hasSeenOnboarding)

        if (accessToken || refreshToken) {
          try {
            const data = await mobileApiRequest('/auth/me/')
            if (active) setUser(data.user)
          } catch (error) {
            if (error.status === 401) await clearSessionTokens()
            else if (active) {
              setSessionNotice('No pudimos verificar tu sesión. Comprueba tu conexión e inténtalo de nuevo.')
            }
          }
        }
      } catch (error) {
        if (active) setBootError(error.message || 'No pudimos leer la configuración de inicio.')
      } finally {
        const remainingSplashTime = Math.max(0, 520 - (Date.now() - startedAt))
        if (remainingSplashTime) {
          await new Promise((resolve) => setTimeout(resolve, remainingSplashTime))
        }
        if (active) {
          setSessionLoading(false)
          setBootLoading(false)
        }
      }
    }

    hydrateSession()
    return () => { active = false }
  }, [bootAttempt])

  function retryBootstrap() {
    setSessionLoading(true)
    setBootLoading(true)
    setBootError(null)
    setBootAttempt((attempt) => attempt + 1)
  }

  async function completeOnboarding(navigation) {
    await markOnboardingComplete()
    setOnboardingComplete(true)
    navigation.replace('Main')
  }

  async function logout() {
    let logoutFailed = false
    try {
      const refresh = await getRefreshToken()
      await mobileApiRequest('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify(refresh ? { refresh } : {}),
      })
    } catch {
      logoutFailed = true
    } finally {
      await clearSessionTokens()
      setUser(null)
      setSessionNotice(
        logoutFailed
          ? 'La sesión se cerró en este dispositivo, pero no fue posible confirmar la revocación en el servidor.'
          : null,
      )
    }
  }

  function authenticated(nextUser) {
    setSessionNotice(null)
    setUser(nextUser)
  }

  return (
    <SafeAreaProvider>
      {bootLoading || bootError ? (
        <SplashScreen error={bootError} onRetry={retryBootstrap} />
      ) : (
        <>
          <StatusBar style="dark" backgroundColor={colors.mineralIvory} />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={onboardingComplete ? 'Main' : 'Onboarding'}
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.mineralIvory },
                animation: Platform.OS === 'web' ? 'none' : 'fade',
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen
                    {...props}
                    onComplete={completeOnboarding}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Main">
                {(props) => (
                  <MainTabsScreen
                    {...props}
                    user={user}
                    onUserUpdated={setUser}
                    onLogout={logout}
                    sessionLoading={sessionLoading}
                    sessionNotice={sessionNotice}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Login"
                options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_right' }}
              >
                {(props) => <AuthScreen {...props} onAuthenticated={authenticated} />}
              </Stack.Screen>
              <Stack.Screen
                name="Register"
                options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_right' }}
              >
                {(props) => <AuthScreen {...props} onAuthenticated={authenticated} />}
              </Stack.Screen>
              <Stack.Screen
                name="PasswordReset"
                options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_right' }}
                component={PasswordResetScreen}
              />
              <Stack.Screen name="TourDetail">
                {(props) => <TourDetailScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Booking">
                {(props) => <BookingScreen {...props} user={user} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </>
      )}
    </SafeAreaProvider>
  )
}
