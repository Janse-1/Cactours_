<template>
  <AuthShell
    eyebrow="Empieza por aquí"
    title="Crea tu cuenta"
    description="Guarda tus datos para que planear tu próxima salida sea más sencillo."
  >
    <p v-if="authStore.error" class="feedback-banner feedback-banner--error" role="alert">
      {{ authStore.error }}
    </p>

    <form class="auth-form" @submit.prevent="submitRegister">
      <div class="auth-register-grid">
        <div class="auth-field">
          <label class="form-label" for="reg-nombre">Nombre</label>
          <input
            id="reg-nombre"
            v-model="form.nombre"
            class="form-control"
            type="text"
            autocomplete="given-name"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div class="auth-field">
          <label class="form-label" for="reg-apellido">Apellido</label>
          <input
            id="reg-apellido"
            v-model="form.apellido"
            class="form-control"
            type="text"
            autocomplete="family-name"
            placeholder="Tu apellido"
            required
          />
        </div>

        <div class="auth-field">
          <label class="form-label" for="reg-id">Documento de identidad</label>
          <input
            id="reg-id"
            v-model="form.identificacion"
            class="form-control"
            type="text"
            autocomplete="off"
            placeholder="Número de documento"
            required
          />
        </div>

        <div class="auth-field">
          <label class="form-label" for="reg-telefono">Teléfono</label>
          <input
            id="reg-telefono"
            v-model="form.telefono"
            class="form-control"
            type="tel"
            autocomplete="tel"
            placeholder="Tu número de contacto"
            required
          />
        </div>

        <div class="auth-field auth-field--full">
          <label class="form-label" for="reg-correo">Correo electrónico</label>
          <input
            id="reg-correo"
            v-model="form.correo"
            class="form-control"
            type="email"
            autocomplete="email"
            placeholder="nombre@correo.com"
            required
          />
        </div>

        <div class="auth-field auth-field--full">
          <label class="form-label" for="reg-password">Contraseña · mínimo 8 caracteres</label>
          <input
            id="reg-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="new-password"
            minlength="8"
            placeholder="Crea una contraseña"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-accent auth-submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creando cuenta...' : 'Crear mi cuenta' }}
        <ArrowRight :size="17" aria-hidden="true" />
      </button>
    </form>

    <p class="auth-switch">
      ¿Ya tienes una cuenta?
      <RouterLink to="/login">Inicia sesión</RouterLink>
    </p>
  </AuthShell>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import AuthShell from '@/components/layout/AuthShell.vue'
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
    // El store expone el error junto al formulario.
  }
}
</script>
