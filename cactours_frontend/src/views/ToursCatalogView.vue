<template>
  <div class="catalog-page">
    <section class="container catalog-hero">
      <div class="catalog-hero-copy">
        <p class="section-eyebrow"><Compass :size="15" aria-hidden="true" /> VIAJA CON RAÍZ</p>
        <h1>Tu próxima historia<br /><em>empieza aquí.</em></h1>
        <p class="catalog-intro">
          Explora Colombia y el Caribe para encontrar una experiencia que se ajuste a tu forma de viajar.
        </p>
        <a href="#experiencias" class="btn-accent catalog-hero-cta">
          Explorar experiencias
          <ArrowDown :size="17" aria-hidden="true" />
        </a>
        <div class="catalog-hero-note">
          <span class="catalog-note-dot"></span>
          <span>Elige con calma. Cada detalle importa.</span>
        </div>
      </div>

      <figure class="catalog-hero-visual">
        <img
          :src="featuredSanAndresImage"
          alt="Mar de siete colores en San Andrés, Colombia"
          fetchpriority="high"
        />
        <div class="catalog-photo-overlay" aria-hidden="true"></div>
        <figcaption class="catalog-photo-caption">
          <span>San Andrés · Colombia</span>
          <span>Cactours Colombia</span>
        </figcaption>
        <span class="catalog-photo-index" aria-hidden="true">01 / CO</span>
      </figure>
    </section>

    <section class="container catalog-planning">
      <div class="catalog-section-heading">
        <div>
          <p class="section-eyebrow">Una ruta a tu medida</p>
          <h2>Empieza por tu presupuesto.</h2>
        </div>
        <p>Cuéntanos cuánto quieres invertir y cuántas personas viajan.</p>
      </div>
      <BudgetRecommender />
    </section>

    <section id="experiencias" class="container catalog-results">
      <div class="catalog-results-heading">
        <div>
          <p class="section-eyebrow">Elige tu próxima salida</p>
          <h2>Experiencias disponibles</h2>
        </div>
        <span v-if="!toursStore.catalogLoading && !toursStore.catalogError && toursStore.tours.length" class="result-count">
          {{ toursStore.tours.length }} {{ toursStore.tours.length === 1 ? 'experiencia' : 'experiencias' }}
        </span>
      </div>

      <div class="catalog-filters">
        <label class="catalog-search">
          <Search :size="19" aria-hidden="true" />
          <span class="visually-hidden">Buscar por nombre o descripción</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Busca una experiencia..."
            @input="applyFilters"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="catalog-search-clear"
            aria-label="Limpiar búsqueda"
            @click="clearSearch"
          >
            <X :size="17" aria-hidden="true" />
          </button>
        </label>

        <label class="catalog-filter">
          <span>Destino</span>
          <input
            v-model="destinationQuery"
            type="search"
            placeholder="Ej. La Guajira"
            @input="applyFilters"
          />
        </label>

        <label class="catalog-filter">
          <span>Precio máximo por persona · COP</span>
          <input
            v-model="maxBudget"
            type="number"
            min="0"
            step="50000"
            inputmode="numeric"
            placeholder="Sin límite"
            @input="applyFilters"
          />
        </label>
      </div>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="text-action catalog-clear-filters magnetic-button"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>

      <FeedbackState
        v-if="toursStore.catalogLoading"
        class="catalog-state"
        variant="loading"
        heading-tag="h3"
        title="Buscando experiencias para ti..."
      />

      <FeedbackState
        v-else-if="toursStore.catalogError"
        class="catalog-state"
        variant="error"
        heading-tag="h3"
        title="No pudimos cargar el catálogo"
        :message="toursStore.catalogError"
      >
        <template #actions>
          <button type="button" class="btn-primary" @click="retrySearch">
            Intentar de nuevo
            <RotateCw :size="16" aria-hidden="true" />
          </button>
        </template>
      </FeedbackState>

      <div v-else-if="toursStore.tours.length" class="tours-grid">
        <TourCard v-for="tour in toursStore.tours" :key="tour.id" :tour="tour" />
      </div>

      <FeedbackState
        v-else
        class="catalog-state"
        variant="empty"
        heading-tag="h3"
        :title="hasActiveFilters ? 'No encontramos coincidencias' : 'Estamos preparando las primeras experiencias'"
        :message="hasActiveFilters
          ? 'Prueba con otro destino, ajusta el presupuesto o limpia los filtros.'
          : 'El catálogo aún no publica fichas para reservar. Mientras tanto, explora nuestros destinos y consulta su disponibilidad con Cactours.'"
      >
        <template #actions>
          <button v-if="hasActiveFilters" type="button" class="text-action magnetic-button" @click="clearFilters">
            Ver todo el catálogo
          </button>
          <RouterLink v-else to="/#territorios" class="btn-primary">
            Explorar el atlas 3D
            <ArrowUpRight :size="17" aria-hidden="true" />
          </RouterLink>
        </template>
      </FeedbackState>

      <section
        v-if="!toursStore.catalogLoading && !toursStore.tours.length && !hasActiveFilters"
        class="local-tour-archive"
        aria-labelledby="local-tour-archive-title"
      >
        <header class="local-tour-archive-heading">
          <div>
            <p class="section-eyebrow">Destinos Cactours</p>
            <h2 id="local-tour-archive-title">Imágenes de destinos Cactours.</h2>
          </div>
          <p>Consulta itinerario, precio y cupos directamente con nuestro equipo.</p>
        </header>

        <div class="local-tour-grid">
          <article
            v-for="destination in tourMediaShowcases"
            :key="destination.id"
            class="local-tour-card spotlight-card"
          >
            <div class="local-tour-image">
              <img :src="destination.gallery[0].url" :alt="destination.gallery[0].alt" loading="lazy" />
            </div>
            <div class="local-tour-card-content">
              <p>{{ destination.destination }}</p>
              <h3>{{ destination.name }}</h3>
              <span class="local-tour-category">{{ destination.category }}</span>
              <a :href="destination.contactUrl" class="local-tour-contact magnetic-button">
                Consultar disponibilidad
                <ArrowUpRight :size="16" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  RotateCw,
  Search,
  X,
} from 'lucide-vue-next'
import TourCard from '@/components/tours/TourCard.vue'
import BudgetRecommender from '@/components/tours/BudgetRecommender.vue'
import FeedbackState from '@/components/feedback/FeedbackState.vue'
import { useToursStore } from '@/stores/tours.store'
import { featuredSanAndresImage, tourMediaShowcases } from '@/data/tourMedia'

const toursStore = useToursStore()
const searchQuery = ref('')
const destinationQuery = ref('')
const maxBudget = ref('')
const hasActiveFilters = computed(() => Boolean(
  searchQuery.value.trim() || destinationQuery.value.trim() || maxBudget.value !== '',
))
let searchTimer

function fetchFilteredTours() {
  const filters = {}
  if (searchQuery.value.trim()) filters.q = searchQuery.value.trim()
  if (destinationQuery.value.trim()) filters.destino = destinationQuery.value.trim()
  if (maxBudget.value !== '') filters.presupuesto_max = maxBudget.value
  toursStore.fetchTours(filters)
}

function applyFilters() {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(fetchFilteredTours, 250)
}

function clearSearch() {
  searchQuery.value = ''
  window.clearTimeout(searchTimer)
  fetchFilteredTours()
}

function clearFilters() {
  searchQuery.value = ''
  destinationQuery.value = ''
  maxBudget.value = ''
  window.clearTimeout(searchTimer)
  fetchFilteredTours()
}

function retrySearch() {
  window.clearTimeout(searchTimer)
  fetchFilteredTours()
}

onMounted(() => {
  toursStore.fetchTours()
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
})
</script>

<style scoped>
.catalog-page {
  overflow: hidden;
  padding-bottom: clamp(4rem, 8vw, 7rem);
}

.catalog-hero {
  display: grid;
  min-height: 570px;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 6rem);
  padding-top: clamp(3rem, 7vw, 6.5rem);
  padding-bottom: clamp(3rem, 7vw, 6rem);
}

.catalog-hero-copy {
  position: relative;
  z-index: 1;
  padding: 1rem 0;
}

.catalog-hero-copy .section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.catalog-hero h1 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(3rem, 6.8vw, 6rem);
  letter-spacing: -0.085em;
  line-height: 0.96;
}

.catalog-hero h1 em {
  color: var(--color-turquesa-cactours);
  font-family: var(--font-editorial);
  font-size: 1.06em;
  font-weight: 500;
  letter-spacing: -0.055em;
}

.catalog-intro {
  max-width: 470px;
  margin: 1.35rem 0 1.6rem;
  color: var(--color-muted);
  font-size: 0.98rem;
  line-height: 1.85;
}

.catalog-hero-cta {
  min-height: 49px;
}

.catalog-hero-note {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1.6rem;
  color: var(--color-muted);
  font-size: 0.74rem;
}

.catalog-note-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-turquesa-cactours);
  box-shadow: 0 0 0 4px rgba(2, 99, 116, 0.1);
}

.catalog-hero-visual {
  position: relative;
  min-width: 0;
  height: clamp(350px, 42vw, 540px);
  overflow: hidden;
  margin: 0;
  border-radius: 6px 6px 84px 6px;
  background: var(--color-azul-petroleo);
  box-shadow: 0 28px 72px rgba(2, 44, 49, 0.19);
}

.catalog-hero-visual img,
.catalog-photo-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.catalog-hero-visual img {
  object-fit: cover;
  object-position: center;
}

.catalog-photo-overlay {
  background: linear-gradient(180deg, rgba(6, 25, 27, 0.05) 42%, rgba(6, 25, 27, 0.78));
}

.catalog-photo-caption {
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

.catalog-photo-caption span {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
}

.catalog-photo-caption a {
  max-width: 190px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.58rem;
  text-align: right;
  text-underline-offset: 3px;
}

.catalog-photo-index {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  padding: 0.4rem 0.7rem;
  background: rgba(8, 41, 46, 0.28);
  color: var(--color-blanco);
  font-size: 0.59rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  backdrop-filter: blur(12px);
}

.catalog-planning,
.catalog-results {
  scroll-margin-top: 6rem;
}

.catalog-section-heading,
.catalog-results-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.catalog-section-heading {
  margin-bottom: 1.2rem;
}

.catalog-section-heading h2,
.catalog-results-heading h2 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(1.7rem, 3.2vw, 2.7rem);
  letter-spacing: -0.065em;
  line-height: 1.08;
}

.catalog-section-heading > p {
  max-width: 330px;
  margin: 0 0 0.2rem;
  color: var(--color-muted);
  font-size: 0.86rem;
  line-height: 1.7;
}

.catalog-results {
  padding-top: clamp(4rem, 8vw, 7rem);
}

.catalog-results-heading {
  margin-bottom: 1.4rem;
}

.result-count {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.catalog-filters {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(190px, 0.8fr);
  gap: 0.8rem;
  margin-bottom: 0.75rem;
}

.catalog-search,
.catalog-filter {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid rgba(2, 99, 116, 0.12);
  border-radius: var(--radius-md);
  padding: 0 1rem;
  background: var(--color-blanco);
  box-shadow: 0 8px 26px rgba(2, 44, 49, 0.045);
  color: var(--color-turquesa-cactours);
}

.catalog-search {
  min-width: 0;
  min-height: 58px;
}

.catalog-filter {
  min-width: 0;
  min-height: 58px;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 0.1rem;
}

.catalog-filter span {
  color: var(--color-muted);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.catalog-search:focus-within,
.catalog-filter:focus-within {
  border-color: var(--color-turquesa-cactours);
  box-shadow: 0 0 0 3px rgba(6, 155, 224, 0.17);
}

.catalog-search input,
.catalog-filter input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-carbon);
  font-size: 0.88rem;
}

.catalog-filter input {
  padding: 0;
  font-size: 0.78rem;
}

.catalog-search input::placeholder,
.catalog-filter input::placeholder {
  color: #687571;
}

.catalog-search-clear {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
}

.catalog-search-clear:hover {
  background: var(--color-mineral-ivory);
  color: var(--color-carbon);
}

.catalog-clear-filters {
  display: block;
  margin: 0 0 1rem auto;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
  gap: clamp(1rem, 2.4vw, 1.6rem);
}

.catalog-state {
  min-height: 260px;
  margin-top: 0.75rem;
}

.text-action {
  border: 0;
  padding: 0.45rem 0.2rem;
  background: transparent;
  color: var(--color-turquesa-cactours);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.local-tour-archive {
  margin-top: clamp(2.5rem, 5vw, 4.5rem);
}

.local-tour-archive-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.4rem;
}

.local-tour-archive-heading h2 {
  max-width: 700px;
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(1.7rem, 4vw, 2.8rem);
  letter-spacing: -0.06em;
  line-height: 1.05;
}

.local-tour-archive-heading > p {
  max-width: 310px;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.84rem;
  line-height: 1.65;
}

.local-tour-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 1rem;
}

.local-tour-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 32px rgba(2, 44, 49, 0.08);
  transition:
    box-shadow 280ms var(--motion-glide),
    transform 280ms var(--motion-glide);
}

.local-tour-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.42;
  background: var(--color-azul-petroleo);
}

.local-tour-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 650ms var(--motion-glide);
}

.local-tour-image-label {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 999px;
  padding: 0.38rem 0.62rem;
  background: rgba(5, 37, 41, 0.52);
  color: var(--color-blanco);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  -webkit-backdrop-filter: blur(14px) saturate(155%);
  backdrop-filter: blur(14px) saturate(155%);
}

.local-tour-card-content {
  display: grid;
  min-height: 190px;
  align-content: start;
  padding: 1rem;
}

.local-tour-card-content > p {
  margin: 0;
  color: #64736e;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.local-tour-card-content h3 {
  margin: 0.25rem 0 0;
  color: var(--color-carbon);
  font-size: 1.25rem;
  letter-spacing: -0.045em;
}

.local-tour-category {
  min-height: 1.5rem;
  margin-top: 0.2rem;
  color: var(--color-muted);
  font-size: 0.72rem;
}

.local-tour-contact {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 0.4rem;
  margin-top: 0.8rem;
  border-bottom: 1px solid rgba(2, 99, 116, 0.25);
  padding: 0.2rem 0;
  color: var(--color-turquesa-cactours);
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
}

.local-tour-contact svg {
  transition: transform 200ms var(--motion-spring);
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .local-tour-card:hover {
    box-shadow: 0 22px 44px rgba(2, 44, 49, 0.14);
    transform: translateY(-4px);
  }

  .local-tour-card:hover img {
    transform: scale(1.055);
  }

  .local-tour-contact:hover svg {
    transform: translate(2px, -2px);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@media (max-width: 760px) {
  .catalog-hero {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
    padding-top: 2.75rem;
    padding-bottom: 3.25rem;
  }

  .catalog-hero-copy {
    padding: 0;
  }

  .catalog-hero h1 {
    font-size: clamp(3rem, 12vw, 5rem);
  }

  .catalog-hero-visual {
    height: clamp(300px, 78vw, 440px);
    border-bottom-right-radius: 60px;
  }

  .catalog-section-heading,
  .catalog-results-heading,
  .local-tour-archive-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
  }

  .catalog-section-heading > p {
    max-width: 480px;
  }

  .catalog-photo-caption {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.45rem;
  }

  .catalog-photo-caption a {
    text-align: left;
  }

  .catalog-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .catalog-search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .catalog-filters {
    grid-template-columns: minmax(0, 1fr);
  }

  .catalog-search {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .local-tour-card,
  .local-tour-image img,
  .local-tour-contact svg {
    transition: none;
  }
}
</style>
