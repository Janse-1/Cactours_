import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const ONBOARDING_KEY = 'cactours_mobile_onboarding_complete'

export async function hasCompletedOnboarding() {
  const value = Platform.OS === 'web'
    ? globalThis.localStorage.getItem(ONBOARDING_KEY)
    : await SecureStore.getItemAsync(ONBOARDING_KEY)

  return value === 'true'
}

export async function markOnboardingComplete() {
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(ONBOARDING_KEY, 'true')
    return
  }

  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true')
}
