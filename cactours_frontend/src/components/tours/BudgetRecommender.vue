<template>
  <section class="budget-card spotlight-card spotlight-card--flat" aria-labelledby="budget-title">
    <header class="budget-card-heading">
      <div class="budget-heading-copy">
        <div class="budget-icon"><Wallet :size="21" aria-hidden="true" /></div>
        <div>
          <p class="budget-kicker">PLANEA CON INTENCIÓN</p>
          <h3 id="budget-title">¿Qué viaje cabe en tu presupuesto?</h3>
          <p>
            Recibe una orientación según tu inversión y el tamaño de tu grupo. El valor final se
            confirma al solicitar la reserva.
          </p>
        </div>
      </div>
      <span class="budget-currency">COP <span>·</span> Colombia</span>
    </header>

    <form class="budget-form" @submit.prevent="handleRecommend">
      <div class="budget-field">
        <label class="form-label" for="presupuesto-input">Presupuesto total</label>
        <div class="budget-input-wrap">
          <span aria-hidden="true">$</span>
          <input
            id="presupuesto-input"
            v-model.number="presupuesto"
            class="form-control"
            type="number"
            min="50000"
            step="10000"
            placeholder="Ej. 350000"
            required
          />
        </div>
      </div>

      <div class="budget-field budget-field--travelers">
        <label class="form-label" for="personas-input">Viajeros</label>
        <div class="budget-input-wrap">
          <Users :size="17" aria-hidden="true" />
          <input
            id="personas-input"
            v-model.number="cantidadPersonas"
            class="form-control"
            type="number"
            min="1"
            max="20"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-accent budget-submit" :disabled="toursStore.recommendationLoading">
        {{ toursStore.recommendationLoading ? 'Calculando...' : 'Ver mi recomendación' }}
        <ArrowRight :size="17" aria-hidden="true" />
      </button>
    </form>

    <p v-if="recommendationError" class="feedback-banner feedback-banner--error" role="alert">
      {{ recommendationError }}
    </p>

    <div
      v-if="toursStore.recommendation?.plan_sugerido"
      class="recommendation-result spotlight-card spotlight-card--flat"
      aria-live="polite"
    >
      <div class="recommendation-title">
        <span class="recommendation-icon"><Sparkles :size="17" aria-hidden="true" /></span>
        <div>
          <span>UNA IDEA PARA EMPEZAR</span>
          <h4>{{ toursStore.recommendation.plan_sugerido.categoria }}</h4>
        </div>
      </div>
      <dl class="recommendation-details">
        <div>
          <dt>Destino sugerido</dt>
          <dd>{{ toursStore.recommendation.plan_sugerido.destino_sugerido }}</dd>
        </div>
        <div>
          <dt>Transporte</dt>
          <dd>{{ toursStore.recommendation.plan_sugerido.transporte }}</dd>
        </div>
        <div>
          <dt>Alimentación</dt>
          <dd>{{ toursStore.recommendation.plan_sugerido.alimentacion }}</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>{{ toursStore.recommendation.plan_sugerido.duracion }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight, Sparkles, Users, Wallet } from 'lucide-vue-next'
import { useToursStore } from '@/stores/tours.store'

const toursStore = useToursStore()
const presupuesto = ref(250000)
const cantidadPersonas = ref(1)
const recommendationError = ref('')

async function handleRecommend() {
  recommendationError.value = ''
  toursStore.recommendation = null
  try {
    await toursStore.runBudgetRecommender(presupuesto.value, cantidadPersonas.value)
  } catch (error) {
    recommendationError.value = error.message
  }
}
</script>

<style scoped>
.budget-card {
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: var(--radius-lg);
  padding: clamp(1.25rem, 3.5vw, 2.2rem);
  background: var(--color-blanco);
  box-shadow: var(--shadow-card);
}

.budget-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.budget-heading-copy {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.budget-icon,
.recommendation-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 14px;
  background: rgba(2, 99, 116, 0.08);
  color: var(--color-turquesa-cactours);
}

.budget-icon {
  width: 48px;
  height: 48px;
}

.budget-kicker {
  margin: 0 0 0.45rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.61rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.budget-card h3 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  letter-spacing: -0.055em;
  line-height: 1.15;
}

.budget-heading-copy > div > p:last-child {
  max-width: 610px;
  margin: 0.6rem 0 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.7;
}

.budget-currency {
  flex: 0 0 auto;
  border: 1px solid rgba(2, 99, 116, 0.13);
  border-radius: 999px;
  padding: 0.42rem 0.7rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.budget-currency span {
  padding: 0 0.16rem;
  color: var(--color-azul-brillante);
}

.budget-form {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(145px, 0.55fr) auto;
  align-items: end;
  gap: 1rem;
  margin-top: 1.6rem;
}

.budget-field {
  min-width: 0;
}

.budget-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--color-turquesa-cactours);
}

.budget-input-wrap > span,
.budget-input-wrap > svg {
  position: absolute;
  left: 0.9rem;
  z-index: 1;
  color: var(--color-turquesa-cactours);
  font-size: 0.9rem;
  font-weight: 800;
  pointer-events: none;
}

.budget-input-wrap .form-control {
  padding-left: 2.3rem;
}

.budget-submit {
  min-height: 48px;
  gap: 0.55rem;
  white-space: nowrap;
}

.feedback-banner {
  margin: 1rem 0 0;
}

.recommendation-result {
  margin-top: 1.4rem;
  border: 1px solid rgba(2, 99, 116, 0.12);
  border-radius: var(--radius-md);
  padding: 1.2rem;
  background:
    radial-gradient(ellipse at 100% 0, rgba(6, 155, 224, 0.1), transparent 50%),
    var(--color-mineral-ivory);
}

.recommendation-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.recommendation-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.recommendation-title span:not(.recommendation-icon) {
  color: var(--color-muted);
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.recommendation-title h4 {
  margin: 0.12rem 0 0;
  color: var(--color-carbon);
  font-size: 1rem;
}

.recommendation-details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.2rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.recommendation-details dt {
  color: var(--color-muted);
  font-size: 0.68rem;
}

.recommendation-details dd {
  margin: 0.25rem 0 0;
  color: var(--color-carbon);
  font-size: 0.82rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .budget-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .budget-submit {
    grid-column: 1 / -1;
  }

  .recommendation-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .budget-card-heading,
  .budget-heading-copy {
    align-items: flex-start;
  }

  .budget-card-heading {
    flex-direction: column;
  }

  .budget-form {
    grid-template-columns: minmax(0, 1fr);
  }

  .budget-submit {
    grid-column: auto;
  }
}
</style>
