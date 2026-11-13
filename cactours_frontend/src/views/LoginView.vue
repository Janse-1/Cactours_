<template>
  <div class="container auth-page">
    <div class="surface-card auth-card">
      <h1>Iniciar Sesión</h1>
      <p v-if="authStore.error" class="error-banner">{{ authStore.error }}</p>

      <form @submit.prevent="submitLogin">
        <div class="field">
          <label for="login-email">Correo electrónico o usuario</label>
          <input id="login-email" v-model="correo" type="text" required autocomplete="username" />
        </div>

        <div class="field">
          <label for="login-password">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-primary full-width" :disabled="authStore.loading">
          {{ authStore.loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="auth-switch">
        ¿Aún no tienes cuenta?
        <RouterLink to="/registro">Regístrate aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
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
    // Error manejado en authStore.error
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 3rem 1.25rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.field input {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: var(--radius-sm);
}

.full-width {
  width: 100%;
}

.error-banner {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
}

.auth-switch {
  margin-top: 1.25rem;
  text-align: center;
}
</style>
