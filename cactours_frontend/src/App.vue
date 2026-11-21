<template>
  <div
    class="app-shell"
    :class="{
      'app-shell--immersive-auth': isAuthRoute,
      'app-shell--immersive-login': isAuthRoute,
      'app-shell--auth-navigation-hidden': navbarHidden,
    }"
    v-pointer-effects
  >
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <AppNavbar :hidden="navbarHidden" />
    <main
      id="main-content"
      class="main-container"
      :class="{
        'main-container--immersive-auth': isAuthRoute,
        'main-container--immersive-login': isAuthRoute,
      }"
    >
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter v-if="!isAuthRoute" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()
const navbarHidden = ref(false)

const isAuthRoute = computed(() => route.name === 'login' || route.name === 'register')
let lastScrollY = 0
let ticking = false

function updateScroll() {
  const currentScrollY = Math.max(0, window.scrollY)
  const scrollDelta = currentScrollY - lastScrollY

  if (currentScrollY <= 25) {
    navbarHidden.value = false
  } else if (scrollDelta > 8) {
    navbarHidden.value = true
  } else if (scrollDelta < -8) {
    navbarHidden.value = false
  }

  lastScrollY = currentScrollY
  ticking = false
}

function handleScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateScroll)
    ticking = true
  }
}

function handleWheel(event) {
  if (Math.abs(event.deltaY) < 10) return
  if (event.deltaY > 10) {
    navbarHidden.value = true
  } else if (event.deltaY < -10) {
    navbarHidden.value = false
  }
}

onMounted(() => {
  authStore.hydrateSession()
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('wheel', handleWheel, { passive: true })
})

watch(
  () => route.path,
  () => {
    navbarHidden.value = false
    lastScrollY = window.scrollY
    const isAuth = route.name === 'login' || route.name === 'register'
    document.documentElement.style.backgroundColor = isAuth ? '#071819' : ''
    document.body.style.backgroundColor = isAuth ? '#071819' : ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('wheel', handleWheel)
})
</script>
