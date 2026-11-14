<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <AppNavbar />
    <main id="main-content" class="main-container">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

onMounted(() => {
  authStore.hydrateSession()
})
</script>
