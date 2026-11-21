<template>
  <header
    class="navbar"
    :class="{
      'navbar--home': route.name === 'home',
      'navbar--auth': isAuthRoute,
      'navbar--hidden': hidden && !mobileMenuOpen,
    }"
  >
    <div class="container navbar-inner">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <img :src="logoUrl" alt="Logo Cactours" class="brand-logo" />
        <div>
          <span class="brand-name">Cactours</span>
          <small class="brand-slogan">Tu presupuesto, nuestra inspiración</small>
        </div>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="primary-navigation"
        :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <X v-if="mobileMenuOpen" :size="21" aria-hidden="true" />
        <Menu v-else :size="21" aria-hidden="true" />
      </button>

      <RouterLink
        to="/admin-demo"
        class="admin-shortcut"
        aria-label="Abrir panel administrativo"
        @click="closeMenu"
      >
        <ShieldCheck :size="18" aria-hidden="true" />
        <span>Panel Admin</span>
      </RouterLink>

      <nav
        id="primary-navigation"
        class="nav-links"
        :class="{ 'nav-links--open': mobileMenuOpen }"
        aria-label="Navegación principal"
      >
        <RouterLink to="/" @click="closeMenu">Inicio</RouterLink>
        <RouterLink to="/tours" @click="closeMenu">Catálogo de Tours</RouterLink>
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/mi-perfil" @click="closeMenu">
            Mis Reservas ({{ authStore.user?.persona?.nombre || authStore.user?.username }})
          </RouterLink>
          <button type="button" class="btn-logout magnetic-button" @click="handleLogout">Cerrar sesión</button>
        </template>
        <template v-else>
          <RouterLink to="/login" @click="closeMenu">Iniciar Sesión</RouterLink>
          <RouterLink to="/registro" class="nav-cta magnetic-button" @click="closeMenu">
            Crear Cuenta
            <ArrowUpRight :size="15" aria-hidden="true" />
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowUpRight, Menu, ShieldCheck, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const logoUrl = '/images/logo-cactours.png'

const isAuthRoute = computed(() => route.name === 'login' || route.name === 'register')

function closeMenu() {
  mobileMenuOpen.value = false
}

async function handleLogout() {
  closeMenu()
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0.75rem;
  z-index: 50;
  width: min(calc(100% - 2rem), 1440px);
  margin: 0.75rem auto 0;
  overflow: visible;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background:
    linear-gradient(120deg, rgba(17, 83, 87, 0.82), rgba(7, 37, 41, 0.66)),
    rgba(7, 37, 41, 0.74);
  color: var(--color-blanco);
  padding: 0.5rem 0;
  box-shadow:
    0 12px 36px rgba(3, 26, 29, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  backdrop-filter: blur(24px) saturate(165%);
  transition:
    background 260ms ease,
    box-shadow 260ms ease,
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 240ms ease;
  will-change: transform, opacity;
}

.navbar::before {
  position: absolute;
  top: 1px;
  right: 7%;
  left: 7%;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  content: '';
  pointer-events: none;
}

.navbar--home {
  position: fixed;
  top: 0.85rem;
  left: 50%;
  margin: 0;
  background:
    linear-gradient(120deg, rgba(14, 67, 70, 0.55), rgba(5, 28, 31, 0.35)),
    rgba(5, 28, 31, 0.35);
  transform: translateX(-50%);
}

.navbar--auth {
  position: fixed;
  top: 0.65rem;
  left: 50%;
  width: min(calc(100% - 3.5rem), 1080px);
  margin: 0;
  padding: 0.28rem 0;
  background:
    linear-gradient(120deg, rgba(14, 67, 70, 0.58), rgba(5, 28, 31, 0.42)),
    rgba(5, 28, 31, 0.38);
  transform: translateX(-50%);
}

.navbar--auth .navbar-inner {
  min-height: 46px;
}

.navbar--auth .brand-logo {
  width: 44px;
  height: 44px;
  min-width: 44px;
}

.navbar--auth .brand-name {
  font-size: 1.14rem;
}

.navbar--auth .brand-slogan {
  font-size: 0.63rem;
}

.navbar--auth .nav-links {
  gap: clamp(0.75rem, 1.8vw, 1.4rem);
}

.navbar--auth .nav-links a {
  font-size: 0.76rem;
}

.navbar--auth .nav-links .nav-cta {
  min-height: 35px;
  padding: 0.35rem 0.85rem;
  font-size: 0.74rem;
}

.navbar--hidden {
  transform: translateY(calc(-100% - 2.5rem)) !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.navbar--home.navbar--hidden,
.navbar--auth.navbar--hidden {
  transform: translate(-50%, calc(-100% - 2.5rem)) !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.navbar-inner {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--color-blanco);
  text-decoration: none;
}

.brand-logo {
  width: 58px;
  height: 58px;
  min-width: 58px;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.75);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
  transition:
    box-shadow 280ms ease,
    transform 420ms var(--motion-glide);
}

.brand:hover .brand-logo {
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2);
  transform: rotate(-6deg) scale(1.05);
}

.brand-name {
  display: block;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.brand-slogan {
  display: block;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.7rem;
  letter-spacing: 0.015em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2.4vw, 2rem);
}

.admin-shortcut {
  display: inline-flex;
  min-height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  order: 4;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: #f2b84b;
  box-shadow:
    0 8px 24px rgba(242, 184, 75, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  color: #17383a;
  font-size: 0.76rem;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}

.admin-shortcut::after {
  display: none;
}

.admin-shortcut:hover,
.admin-shortcut.router-link-exact-active {
  background: #ffd36f;
  box-shadow:
    0 10px 28px rgba(242, 184, 75, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: #17383a;
  transform: translateY(-2px);
}

.nav-links .role-switch {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
}

.nav-links a {
  position: relative;
  color: rgba(255, 255, 255, 0.83);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 180ms ease,
    transform 180ms var(--motion-spring);
}

.nav-links a:not(.nav-cta)::after {
  position: absolute;
  right: 0;
  bottom: -0.45rem;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-azul-brillante), transparent);
  content: '';
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 240ms var(--motion-glide);
}

.nav-links a:hover,
.nav-links a.router-link-exact-active:not(.nav-cta) {
  color: var(--color-blanco);
}

.nav-links a:hover::after,
.nav-links a.router-link-exact-active:not(.nav-cta)::after {
  transform: scaleX(1);
}

.nav-links .nav-cta {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.11);
  color: var(--color-blanco);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  transition:
    border-color 220ms ease,
    background 220ms ease,
    color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms var(--motion-spring);
}

.nav-links .nav-cta:hover {
  border-color: rgba(6, 155, 224, 0.8);
  background: rgba(6, 155, 224, 0.9);
  color: var(--color-carbon);
  box-shadow: 0 8px 26px rgba(6, 155, 224, 0.28);
  transform: translateY(-2px);
}

.nav-links .nav-cta.router-link-exact-active {
  border-color: rgba(6, 155, 224, 0.85);
  background: rgba(6, 155, 224, 0.28);
  color: var(--color-blanco);
  box-shadow: 0 0 20px rgba(6, 155, 224, 0.35);
}

.btn-logout {
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: transparent;
  color: var(--color-blanco);
  padding: 0.55rem 1rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-blanco);
  cursor: pointer;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    transform 260ms var(--motion-spring);
}

.menu-toggle:hover {
  border-color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(8deg);
}

@media (max-width: 760px) {
  .navbar {
    top: 0.45rem;
    width: calc(100% - 1rem);
    margin-top: 0.45rem;
    border-radius: 22px;
    padding: 0.55rem 0;
    background:
      linear-gradient(120deg, rgba(17, 83, 87, 0.88), rgba(7, 37, 41, 0.82)),
      rgba(7, 37, 41, 0.86);
  }

  .navbar--home,
  .navbar--auth {
    top: 0.55rem;
    left: 50%;
    width: calc(100% - 1rem);
    margin-top: 0;
    background:
      linear-gradient(120deg, rgba(14, 67, 70, 0.48), rgba(5, 28, 31, 0.3)),
      rgba(5, 28, 31, 0.28);
    transform: translateX(-50%);
  }

  .navbar-inner {
    gap: 0.6rem;
  }

  .brand-logo {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }

  .brand-name {
    font-size: 1.12rem;
  }

  .brand-slogan {
    font-size: 0.62rem;
  }

  .menu-toggle {
    display: inline-flex;
    flex: 0 0 auto;
  }

  .admin-shortcut {
    width: 44px;
    min-height: 44px;
    border-radius: 50%;
    padding: 0;
  }

  .admin-shortcut span {
    display: none;
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 1rem;
    left: 1rem;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 0.15rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 18px;
    padding: 0.65rem;
    background: rgba(12, 46, 49, 0.82);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.24);
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transform: translateY(-8px) scale(0.98);
    transform-origin: top right;
    transition:
      opacity 180ms ease,
      transform 240ms var(--motion-glide),
      visibility 180ms ease;
    -webkit-backdrop-filter: blur(24px) saturate(165%);
    backdrop-filter: blur(24px) saturate(165%);
  }

  .nav-links--open {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  .nav-links a,
  .btn-logout {
    min-height: 44px;
    align-items: center;
    border-radius: 11px;
    padding: 0.7rem 0.8rem;
  }

  .nav-links .nav-cta {
    justify-content: space-between;
    border-color: transparent;
  }
}

@media (max-width: 380px) {
  .brand {
    gap: 0.5rem;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
    min-width: 42px;
  }

  .brand-name {
    font-size: 1.05rem;
  }

  .brand-slogan {
    max-width: 175px;
    font-size: 0.55rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .navbar,
  .brand-logo,
  .nav-links,
  .nav-links a,
  .nav-links .nav-cta,
  .menu-toggle {
    transition: none;
  }

  .brand:hover .brand-logo,
  .nav-links .nav-cta:hover,
  .menu-toggle:hover {
    transform: none;
  }
}
</style>
