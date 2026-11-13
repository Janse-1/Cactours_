<template>
  <div>
    <section class="hero">
      <video
        class="hero-video"
        src="/images/video/video4.mp4"
        muted
        loop
        autoplay
        playsinline
      ></video>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="editorial-tagline">Naturaleza, cultura y aventura en el Caribe</p>
        <h1>La mejor agencia de turismo en La Guajira</h1>
        <p class="hero-lead">
          Descubre el Cabo de la Vela, Punta Gallinas, Montes de Oca y los destinos más emblemáticos
          con transparencia en precios y acompañamiento experto.
        </p>
        <div class="hero-cta">
          <RouterLink to="/tours" class="btn-accent">Explorar Catálogo de Tours</RouterLink>
          <RouterLink v-if="!authStore.isAuthenticated" to="/registro" class="btn-primary">
            Crear Cuenta
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="container featured-section">
      <h2>Experiencias Destacadas</h2>
      <p v-if="toursStore.loading">Cargando experiencias disponibles...</p>
      <div v-else class="tours-grid">
        <TourCard v-for="tour in toursStore.tours.slice(0, 3)" :key="tour.id" :tour="tour" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import TourCard from '@/components/tours/TourCard.vue'
import { useToursStore } from '@/stores/tours.store'
import { useAuthStore } from '@/stores/auth.store'

const toursStore = useToursStore()
const authStore = useAuthStore()

onMounted(() => {
  toursStore.fetchTours()
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  background-color: var(--color-turquesa-cactours);
  color: var(--color-blanco);
  overflow: hidden;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(2, 99, 116, 0.85), rgba(17, 17, 17, 0.65));
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 760px;
  padding: 4rem 1.25rem;
}

.hero-content h1 {
  color: var(--color-blanco);
  font-size: clamp(2rem, 4vw, 3.25rem);
  margin-bottom: 1rem;
}

.hero-lead {
  font-size: 1.15rem;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.featured-section {
  padding: 3rem 1.25rem;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
