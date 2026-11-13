<template>
  <div class="container auth-page">
    <div class="surface-card auth-card">
      <h1>Crear Cuenta de Cliente</h1>
      <p v-if="authStore.error" class="error-banner">{{ authStore.error }}</p>

      <form @submit.prevent="submitRegister">
        <div class="field">
          <label for="reg-nombre">Nombre</label>
          <input id="reg-nombre" v-model="form.nombre" type="text" required />
        </div>

        <div class="field">
          <label for="reg-apellido">Apellido</label>
          <input id="reg-apellido" v-model="form.apellido" type="text" required />
        </div>

        <div class="field">
          <label for="reg-id">Documento de Identificación</label>
          <input id="reg-id" v-model="form.identificacion" type="text" required />
        </div>

        <div class="field">
          <label for="reg-correo">Correo Electrónico</label>
          <input id="reg-correo" v-model="form.correo" type="email" required />
        </div>

        <div class="field">
          <label for="reg-telefono">Teléfono</label>
          <input id="reg-telefono" v-model="form.telefono" type="tel" required />
        </div>

        <div class="field">
          <label for="reg-password">Contraseña (mínimo 8 caracteres)</label>
          <input id="reg-password" v-model="form.password" type="password" minlength="8" required />
        </div>

        <button type="submit" class="btn-primary full-width" :disabled="authStore.loading">
          {{ authStore.loading ? 'Creando cuenta...' : 'Registrarme' }}
        </button>
      </form>

      <p class="auth-switch">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login">Inicia sesión aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  nombre: '',
  apellido: '',
  identificacion: '',
  correo: '',
  telefono: '',
  password: '',
})

async function submitRegister() {
  try {
    await authStore.register(form)
    router.push('/mi-perfil')
  } catch {
    // Error reflejado en authStore.error
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
  max-width: 480px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
}

.field input {
  padding: 0.65rem;
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
