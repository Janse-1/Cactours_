<template>
  <div class="container page-padding">
    <h1>Catálogo de Tours y Experiencias</h1>

    <BudgetRecommender />

    <div class="filters-bar surface-card">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Buscar por destino o nombre del tour..."
        @input="applyFilters"
      />
    </div>

    <p v-if="toursStore.loading">Cargando tours disponibles...</p>
    <p v-else-if="toursStore.error" class="error-banner">{{ toursStore.error }}</p>
    <div v-else-if="toursStore.tours.length" class="tours-grid">
      <TourCard v-for="tour in toursStore.tours" :key="tour.id" :tour="tour" />
    </div>
    <p v-else>No se encontraron tours disponibles para los criterios seleccionados.</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import TourCard from '@/components/tours/TourCard.vue'
import BudgetRecommender from '@/components/tours/BudgetRecommender.vue'
import { useToursStore } from '@/stores/tours.store'

const toursStore = useToursStore()
const searchQuery = ref('')

function applyFilters() {
  toursStore.fetchTours({ q: searchQuery.value })
}

onMounted(() => {
  toursStore.fetchTours()
})
</script>

<style scoped>
.page-padding {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.filters-bar {
  margin-bottom: 1.5rem;
}

.filters-bar input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.error-banner {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  padding: 1rem;
  border-radius: var(--radius-sm);
}
</style>
