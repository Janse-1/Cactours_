<template>
  <section class="surface-card recommender-box">
    <h3>Personaliza tu experiencia según tu presupuesto</h3>
    <p>
      Nuestro motor en el servidor calcula las mejores opciones de destino, transporte y alimentación
      para tu presupuesto en pesos colombianos (COP).
    </p>

    <form class="recommender-form" @submit.prevent="handleRecommend">
      <div class="field">
        <label for="presupuesto-input">Presupuesto total (COP)</label>
        <input
          id="presupuesto-input"
          v-model.number="presupuesto"
          type="number"
          min="50000"
          step="10000"
          placeholder="Ej. 350000"
          required
        />
      </div>
      <div class="field">
        <label for="personas-input">Viajeros</label>
        <input
          id="personas-input"
          v-model.number="cantidadPersonas"
          type="number"
          min="1"
          max="20"
          required
        />
      </div>
      <button type="submit" class="btn-primary" :disabled="toursStore.loading">
        Consultar Opciones
      </button>
    </form>

    <div v-if="toursStore.recommendation" class="recommendation-result">
      <h4>Plan sugerido: {{ toursStore.recommendation.plan_sugerido.categoria }}</h4>
      <ul>
        <li><strong>Destino:</strong> {{ toursStore.recommendation.plan_sugerido.destino_sugerido }}</li>
        <li><strong>Transporte:</strong> {{ toursStore.recommendation.plan_sugerido.transporte }}</li>
        <li><strong>Alimentación:</strong> {{ toursStore.recommendation.plan_sugerido.alimentacion }}</li>
        <li><strong>Duración:</strong> {{ toursStore.recommendation.plan_sugerido.duracion }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useToursStore } from '@/stores/tours.store'

const toursStore = useToursStore()
const presupuesto = ref(250000)
const cantidadPersonas = ref(1)

async function handleRecommend() {
  await toursStore.runBudgetRecommender(presupuesto.value, cantidadPersonas.value)
}
</script>

<style scoped>
.recommender-box {
  margin-bottom: 2rem;
  border-left: 5px solid var(--color-turquesa-cactours);
}

.recommender-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-top: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 180px;
}

.field input {
  padding: 0.65rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.recommendation-result {
  margin-top: 1.25rem;
  padding: 1rem;
  background-color: var(--color-mineral-ivory);
  border-radius: var(--radius-sm);
}
</style>
