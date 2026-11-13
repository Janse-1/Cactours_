<template>
  <article class="surface-card tour-card">
    <div class="tour-media">
      <img
        v-if="tour.imagen_portada"
        :src="tour.imagen_portada"
        :alt="tour.nombre_tour"
        loading="lazy"
      />
      <div v-else class="tour-placeholder">{{ tour.ciudad_destino }}</div>
      <span class="tour-badge">{{ tour.duracion_dias }} día(s)</span>
    </div>

    <div class="tour-body">
      <small class="tour-destination">{{ tour.ciudad_destino }}</small>
      <h3>{{ tour.nombre_tour }}</h3>
      <p class="tour-description">{{ tour.descripcion }}</p>

      <div class="tour-footer">
        <div>
          <span class="price-label">Desde</span>
          <strong class="price-value">${{ Number(tour.costo).toLocaleString('es-CO') }} COP</strong>
        </div>
        <div class="tour-actions">
          <RouterLink :to="`/tours/${tour.id}`" class="btn-primary">Ver Detalle</RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  tour: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.tour-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tour-media {
  position: relative;
  height: 210px;
  background-color: var(--color-azul-petroleo);
}

.tour-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tour-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-blanco);
  font-weight: 700;
}

.tour-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--color-blanco);
  color: var(--color-carbon);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.tour-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tour-destination {
  color: var(--color-azul-petroleo);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tour-description {
  flex: 1;
  color: #444;
  font-size: 0.95rem;
}

.tour-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.price-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
}

.price-value {
  font-size: 1.15rem;
  color: var(--color-turquesa-cactours);
}
</style>
