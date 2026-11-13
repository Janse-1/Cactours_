<template>
  <div class="container page-padding">
    <p v-if="toursStore.loading">Cargando detalle del tour...</p>
    <div v-else-if="tour" class="surface-card detail-layout">
      <div class="detail-gallery">
        <img
          v-if="tour.imagen_portada"
          :src="tour.imagen_portada"
          :alt="tour.nombre_tour"
          class="main-image"
        />
        <div v-if="tour.imagenes?.length" class="thumb-row">
          <img
            v-for="img in tour.imagenes"
            :key="img.id"
            :src="img.url"
            :alt="img.descripcion"
            class="thumb-image"
          />
        </div>
      </div>

      <div class="detail-info">
        <small class="destination-tag">{{ tour.ciudad_destino }}</small>
        <h1>{{ tour.nombre_tour }}</h1>
        <p>{{ tour.descripcion }}</p>

        <ul class="meta-list">
          <li><strong>Duración:</strong> {{ tour.duracion_dias }} día(s)</li>
          <li><strong>Cupo máximo por salida:</strong> {{ tour.cupo_maximo }} personas</li>
          <li><strong>Precio base por persona:</strong> ${{ Number(tour.costo).toLocaleString('es-CO') }} COP</li>
        </ul>

        <div v-if="tour.opciones_disponibles?.length" class="options-preview">
          <h3>Opciones adicionales disponibles</h3>
          <ul>
            <li v-for="op in tour.opciones_disponibles" :key="op.id">
              {{ op.nombre_op }} (+${{ Number(op.precio_adic).toLocaleString('es-CO') }} COP)
            </li>
          </ul>
        </div>

        <RouterLink :to="`/reservar/${tour.id}`" class="btn-primary">
          Solicitar Reserva de este Tour
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useToursStore } from '@/stores/tours.store'

const route = useRoute()
const toursStore = useToursStore()
const tour = computed(() => toursStore.selectedTour)

onMounted(() => {
  toursStore.fetchTourDetail(route.params.id)
})
</script>

<style scoped>
.page-padding {
  padding: 2rem 1.25rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.main-image {
  width: 100%;
  border-radius: var(--radius-sm);
  max-height: 360px;
  object-fit: cover;
}

.thumb-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}

.thumb-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.destination-tag {
  color: var(--color-azul-petroleo);
  font-weight: 700;
  text-transform: uppercase;
}

.meta-list {
  padding-left: 1.2rem;
  margin: 1.25rem 0;
}
</style>
