<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="main-container">
      <RouterView />
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
