<template>
  <div class="detail-page container">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <RouterLink to="/tours">Catálogo</RouterLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span>{{ tour?.nombre_tour || 'Detalle del tour' }}</span>
    </nav>

    <FeedbackState
      v-if="toursStore.detailLoading"
      class="detail-state"
      variant="loading"
      title="Preparando los detalles de esta experiencia..."
    />

    <FeedbackState
      v-else-if="toursStore.detailError"
      class="detail-state"
      variant="error"
      heading-tag="h1"
      title="No pudimos abrir este tour"
      :message="toursStore.detailError"
    >
      <template #actions>
        <button type="button" class="btn-primary" @click="loadTour">Intentar de nuevo</button>
        <RouterLink to="/tours" class="detail-back-link">Volver al catálogo</RouterLink>
      </template>
    </FeedbackState>

    <div v-else-if="tour" class="detail-content">
      <section class="detail-gallery">
        <div class="detail-main-image">
          <img
            v-if="activeImage && !imageUnavailable"
            :src="activeImage"
            :alt="activeImageAlt"
            fetchpriority="high"
            @error="imageUnavailable = true"
          />
          <div v-else class="detail-image-placeholder">
            <Compass :size="36" aria-hidden="true" />
            <span>{{ tour.ciudad_destino }}</span>
          </div>
          <div class="detail-image-overlay" aria-hidden="true"></div>
          <div class="detail-image-caption">
            <span><MapPin :size="15" aria-hidden="true" /> {{ tour.ciudad_destino }}</span>
            <small>EXPERIENCIA CACTOURS</small>
          </div>
        </div>

        <div v-if="galleryImages.length > 1" class="detail-thumbnails" aria-label="Fotos del tour">
          <button
            v-for="image in galleryImages"
            :key="image.id"
            type="button"
            :class="{ 'detail-thumbnail--active': activeImage === image.url }"
            :aria-label="`Ver foto: ${image.alt}`"
            :aria-pressed="activeImage === image.url"
            @click="selectImage(image)"
          >
            <img :src="image.url" :alt="image.alt" loading="lazy" />
          </button>
        </div>
      </section>

      <aside class="detail-panel">
        <div class="detail-heading">
          <p class="section-eyebrow">Descubre el territorio</p>
          <h1>{{ tour.nombre_tour }}</h1>
          <p class="detail-description">{{ tour.descripcion }}</p>
        </div>

        <div class="detail-facts">
          <div>
            <span class="fact-icon"><Clock3 :size="18" aria-hidden="true" /></span>
            <span><small>Duración</small><strong>{{ tour.duracion_dias }} {{ tour.duracion_dias === 1 ? 'día' : 'días' }}</strong></span>
          </div>
          <div>
            <span class="fact-icon"><Users :size="18" aria-hidden="true" /></span>
            <span><small>Cupo por salida</small><strong>Hasta {{ tour.cupo_maximo }} personas</strong></span>
          </div>
        </div>

        <div v-if="tour.opciones_disponibles?.length" class="detail-options">
          <h2>Personaliza tu experiencia</h2>
          <ul>
            <li v-for="option in tour.opciones_disponibles" :key="option.id">
              <span>{{ option.nombre_op }}</span>
              <strong>+{{ formatCurrency(option.precio_adic) }}</strong>
            </li>
          </ul>
        </div>

        <div class="detail-booking-card">
          <div>
            <span class="detail-price-label">Precio base por persona</span>
            <strong class="detail-price">{{ formattedPrice }}</strong>
          </div>
          <RouterLink :to="`/reservar/${tour.id}`" class="btn-accent detail-book-button">
            Solicitar reserva
            <ArrowUpRight :size="18" aria-hidden="true" />
          </RouterLink>
          <p>
            <ShieldCheck :size="15" aria-hidden="true" />
            Enviarás una solicitud; no es un pago ni una confirmación.
          </p>
        </div>
      </aside>
    </div>

    <div v-if="tour" class="detail-mobile-cta" aria-label="Reserva del tour">
      <span>
        <small>Precio por persona</small>
        <strong>{{ formattedPrice }}</strong>
      </span>
      <RouterLink :to="`/reservar/${tour.id}`" class="btn-accent">
        Solicitar reserva
        <ArrowUpRight :size="17" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'
import { useToursStore } from '@/stores/tours.store'
import { resolveTourGallery } from '@/data/tourMedia'
import FeedbackState from '@/components/feedback/FeedbackState.vue'

const route = useRoute()
const toursStore = useToursStore()
const tour = computed(() => toursStore.selectedTour)
const activeImage = ref('')
const activeImageAlt = ref('')
const imageUnavailable = ref(false)

const galleryImages = computed(() => {
  if (!tour.value) return []
  return resolveTourGallery(tour.value)
})

const formattedPrice = computed(() => formatCurrency(tour.value?.costo))

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Consulta disponibilidad'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function selectImage(image) {
  activeImage.value = image.url
  activeImageAlt.value = image.alt
  imageUnavailable.value = false
}

async function loadTour() {
  try {
    await toursStore.fetchTourDetail(route.params.id)
    const firstImage = galleryImages.value[0]
    if (firstImage) selectImage(firstImage)
  } catch {
    // The store exposes the loading error in the view.
  }
}

onMounted(loadTour)
</script>

<style scoped>
.detail-page {
  min-height: 65vh;
  padding-top: 1.4rem;
  padding-bottom: clamp(4rem, 8vw, 7rem);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
  color: var(--color-muted);
  font-size: 0.72rem;
}

.breadcrumbs a {
  color: var(--color-turquesa-cactours);
  font-weight: 700;
  text-decoration: none;
}

.breadcrumbs span {
  overflow: hidden;
  max-width: 45vw;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-state {
  min-height: 390px;
}

.detail-back-link {
  color: var(--color-turquesa-cactours);
  font-weight: 700;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(330px, 0.88fr);
  align-items: start;
  gap: clamp(1.5rem, 4vw, 3.5rem);
}

.detail-gallery {
  min-width: 0;
}

.detail-main-image {
  position: relative;
  min-height: 570px;
  overflow: hidden;
  border-radius: 6px 6px 70px 6px;
  background:
    radial-gradient(ellipse at 70% 20%, rgba(6, 155, 224, 0.35), transparent 40%),
    var(--color-azul-petroleo);
  box-shadow: 0 26px 70px rgba(2, 44, 49, 0.16);
}

.detail-main-image > img,
.detail-image-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.detail-main-image > img {
  object-fit: cover;
}

.detail-image-overlay {
  background: linear-gradient(180deg, transparent 48%, rgba(5, 28, 31, 0.72));
}

.detail-image-caption {
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-blanco);
}

.detail-image-caption span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
}

.detail-image-caption small {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.detail-image-placeholder {
  display: flex;
  height: 570px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 0.7rem;
  color: rgba(255, 255, 255, 0.83);
  font-family: var(--font-heading);
  font-weight: 700;
}

.detail-thumbnails {
  display: flex;
  gap: 0.65rem;
  overflow-x: auto;
  margin-top: 0.85rem;
  padding: 0.15rem 0 0.35rem;
}

.detail-thumbnails button {
  width: 84px;
  height: 68px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0;
  background: var(--color-blanco);
  cursor: pointer;
}

.detail-thumbnails button[aria-pressed='true'] {
  border-color: var(--color-turquesa-cactours);
  box-shadow: 0 0 0 2px rgba(2, 99, 116, 0.12);
}

.detail-thumbnails img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-panel {
  padding: clamp(0rem, 1vw, 0.75rem) 0;
}

.detail-heading h1 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(2.2rem, 4.1vw, 3.8rem);
  letter-spacing: -0.075em;
  line-height: 1;
}

.detail-description {
  margin: 1rem 0 0;
  color: var(--color-muted);
  font-size: 0.94rem;
  line-height: 1.85;
}

.detail-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  margin: 1.6rem 0;
  padding: 1.2rem 0;
}

.detail-facts > div {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.fact-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  background: rgba(2, 99, 116, 0.08);
  color: var(--color-turquesa-cactours);
}

.detail-facts small,
.detail-facts strong {
  display: block;
}

.detail-facts small {
  color: var(--color-muted);
  font-size: 0.62rem;
}

.detail-facts strong {
  margin-top: 0.14rem;
  color: var(--color-carbon);
  font-size: 0.79rem;
}

.detail-options h2 {
  margin: 0 0 0.55rem;
  color: var(--color-carbon);
  font-size: 1rem;
}

.detail-options ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-options li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(17, 17, 17, 0.07);
  padding: 0.65rem 0;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.detail-options li strong {
  color: var(--color-turquesa-cactours);
  white-space: nowrap;
}

.detail-booking-card {
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: var(--radius-md);
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--color-blanco);
  box-shadow: var(--shadow-card);
}

.detail-price-label {
  display: block;
  color: var(--color-muted);
  font-size: 0.69rem;
}

.detail-price {
  display: block;
  margin-top: 0.1rem;
  color: var(--color-turquesa-cactours);
  font-family: var(--font-heading);
  font-size: 1.8rem;
  letter-spacing: -0.055em;
}

.detail-book-button {
  display: flex;
  min-height: 50px;
  justify-content: space-between;
  margin-top: 1rem;
}

.detail-booking-card > p {
  display: flex;
  align-items: flex-start;
  gap: 0.42rem;
  margin: 0.8rem 0 0;
  color: var(--color-muted);
  font-size: 0.67rem;
  line-height: 1.5;
}

.detail-booking-card > p svg {
  flex: 0 0 auto;
  color: var(--color-turquesa-cactours);
}

.detail-mobile-cta {
  display: none;
}

@media (max-width: 900px) {
  .detail-content {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-main-image,
  .detail-image-placeholder {
    min-height: 430px;
    height: 430px;
  }

  .detail-panel {
    max-width: 760px;
  }
}

@media (max-width: 560px) {
  .detail-page {
    padding-bottom: calc(6rem + env(safe-area-inset-bottom));
  }

  .detail-main-image,
  .detail-image-placeholder {
    min-height: 340px;
    height: 340px;
  }

  .detail-image-caption {
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }

  .detail-facts {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-mobile-cta {
    position: fixed;
    z-index: 40;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    min-height: 66px;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    border-top: 1px solid rgba(2, 99, 116, 0.14);
    padding: 0.65rem max(1rem, env(safe-area-inset-left)) calc(0.65rem + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 -12px 32px rgba(2, 44, 49, 0.1);
    -webkit-backdrop-filter: blur(18px) saturate(155%);
    backdrop-filter: blur(18px) saturate(155%);
  }

  .detail-mobile-cta > span {
    display: grid;
    min-width: 0;
  }

  .detail-mobile-cta small {
    color: var(--color-muted);
    font-size: 0.62rem;
  }

  .detail-mobile-cta strong {
    overflow: hidden;
    color: var(--color-turquesa-cactours);
    font-size: 0.85rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-mobile-cta .btn-accent {
    min-height: 44px;
    flex: 0 0 auto;
    gap: 0.35rem;
    padding: 0.65rem 0.8rem;
    white-space: nowrap;
  }
}
</style>
