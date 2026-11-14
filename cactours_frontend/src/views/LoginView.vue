<template>
  <AuthShell
    eyebrow="Bienvenido de vuelta"
    title="Inicia sesión"
    description="Entra a tu espacio y continúa planeando una experiencia a tu manera."
  >
    <p v-if="authStore.error" class="feedback-banner feedback-banner--error" role="alert">
      {{ authStore.error }}
    </p>

    <form class="auth-form" @submit.prevent="submitLogin">
      <div class="auth-field">
        <label class="form-label" for="login-email">Correo electrónico o usuario</label>
        <div class="auth-input-wrap">
          <AtSign class="auth-input-icon" :size="18" aria-hidden="true" />
          <input
            id="login-email"
            v-model="correo"
            class="form-control"
            type="text"
            autocomplete="username"
            placeholder="Tu correo o nombre de usuario"
            required
          />
        </div>
      </div>

      <div class="auth-field">
        <label class="form-label" for="login-password">Contraseña</label>
        <div class="auth-input-wrap">
          <LockKeyhole class="auth-input-icon" :size="18" aria-hidden="true" />
          <input
            id="login-password"
            v-model="password"
            class="form-control"
            type="password"
            autocomplete="current-password"
            placeholder="Escribe tu contraseña"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-accent auth-submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Ingresando...' : 'Iniciar sesión' }}
        <ArrowRight :size="17" aria-hidden="true" />
      </button>
    </form>

    <p class="auth-switch">
      ¿Aún no tienes cuenta?
      <RouterLink to="/registro">Crea tu cuenta</RouterLink>
    </p>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { AtSign, ArrowRight, LockKeyhole } from 'lucide-vue-next'
import AuthShell from '@/components/layout/AuthShell.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const correo = ref('')
const password = ref('')

async function submitLogin() {
  try {
    await authStore.login({ correo: correo.value, password: password.value })
    const redirectPath = route.query.redirect || '/mi-perfil'
    router.push(redirectPath)
  } catch {
    // El store expone el error junto al formulario.
  }
}
</script>
