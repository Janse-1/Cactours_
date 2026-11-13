<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <RouterLink to="/" class="brand">
        <img src="/images/Icono.ico" alt="Logo de Cactours" class="brand-logo" />
        <div>
          <span class="brand-name">Cactours</span>
          <small class="brand-slogan">Tu presupuesto, nuestra inspiración</small>
        </div>
      </RouterLink>

      <nav class="nav-links" aria-label="Navegación principal">
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/tours">Catálogo de Tours</RouterLink>
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/mi-perfil">Mis Reservas ({{ authStore.user?.persona?.nombre || authStore.user?.username }})</RouterLink>
          <button type="button" class="btn-logout" @click="handleLogout">Cerrar sesión</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Iniciar Sesión</RouterLink>
          <RouterLink to="/registro" class="btn-accent">Crear Cuenta</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background-color: var(--color-turquesa-cactours);
  color: var(--color-blanco);
  padding: 0.9rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-blanco);
  text-decoration: none;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.brand-name {
  display: block;
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 800;
}

.brand-slogan {
  display: block;
  font-size: 0.78rem;
  opacity: 0.9;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: var(--color-blanco);
  text-decoration: none;
  font-weight: 500;
}

.nav-links a.btn-accent {
  color: var(--color-carbon);
  padding: 0.45rem 1rem;
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--color-blanco);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
</style>
