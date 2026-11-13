<template>
  <div class="container page-padding">
    <div v-if="tour" class="surface-card checkout-card">
      <h1>Solicitud de Reserva — {{ tour.nombre_tour }}</h1>
      <p class="notice-banner">
        <strong>Importante:</strong> Al enviar este formulario registras una <em>solicitud de reserva</em>.
        El precio final es calculado y verificado directamente por nuestro servidor.
      </p>

      <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

      <form class="checkout-form" @submit.prevent="submitBooking">
        <div class="form-grid">
          <div class="field">
            <label for="lugar-salida">Lugar de salida</label>
            <input
              id="lugar-salida"
              v-model="form.lugar_salida"
              type="text"
              placeholder="Ej. Riohacha - Centro"
              required
            />
          </div>

          <div class="field">
            <label for="fecha-tour">Fecha programada</label>
            <input id="fecha-tour" v-model="form.fecha" type="date" required />
          </div>

          <div class="field">
            <label for="cant-personas">Número de personas</label>
            <input
              id="cant-personas"
              v-model.number="form.cant_personas"
              type="number"
              min="1"
              :max="tour.cupo_maximo"
              required
              @change="refreshServerQuote"
            />
          </div>

          <div class="field">
            <label for="medio-pago">Medio de pago preferido</label>
            <select id="medio-pago" v-model="form.medio_pago" required>
              <option value="TRANSFERENCIA">Transferencia Bancaria / PSE</option>
              <option value="TARJETA">Tarjeta de Crédito / Débito</option>
              <option value="EFECTIVO">Efectivo en Agencia</option>
            </select>
          </div>
        </div>

        <div v-if="tour.opciones_disponibles?.length" class="options-section">
          <h3>Opciones adicionales</h3>
          <div class="options-grid">
            <label v-for="op in tour.opciones_disponibles" :key="op.id" class="option-item">
              <input
                v-model="form.opciones_ids"
                type="checkbox"
                :value="op.id"
                @change="refreshServerQuote"
              />
              <span>{{ op.nombre_op }} (+${{ Number(op.precio_adic).toLocaleString('es-CO') }} COP)</span>
            </label>
          </div>
        </div>

        <div class="field">
          <label for="comentarios">Comentarios o requerimientos especiales</label>
          <textarea
            id="comentarios"
            v-model="form.comentarios"
            rows="3"
            placeholder="Restricciones alimentarias, punto de recogida, etc."
          ></textarea>
        </div>

        <div v-if="quote" class="quote-summary">
          <div>Subtotal base: ${{ Number(quote.subtotal_base).toLocaleString('es-CO') }} COP</div>
          <div>Adiciones: ${{ Number(quote.subtotal_opciones).toLocaleString('es-CO') }} COP</div>
          <div class="quote-total">
            Total calculado por el servidor: ${{ Number(quote.costo_total).toLocaleString('es-CO') }} COP
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="bookingsStore.loading">
          {{ bookingsStore.loading ? 'Enviando solicitud...' : 'Enviar Solicitud de Reserva' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToursStore } from '@/stores/tours.store'
import { useBookingsStore } from '@/stores/bookings.store'

const route = useRoute()
const router = useRouter()
const toursStore = useToursStore()
const bookingsStore = useBookingsStore()

const tour = computed(() => toursStore.selectedTour)
const quote = computed(() => bookingsStore.currentQuote)
const errorMsg = ref(null)

const todayIso = new Date().toISOString().slice(0, 10)
const form = reactive({
  lugar_salida: '',
  fecha: todayIso,
  cant_personas: 1,
  medio_pago: 'TRANSFERENCIA',
  opciones_ids: [],
  comentarios: '',
})

async function refreshServerQuote() {
  if (!tour.value) return
  try {
    await bookingsStore.quoteBooking({
      tourId: tour.value.id,
      cantPersonas: form.cant_personas,
      opcionesIds: form.opciones_ids,
    })
  } catch (err) {
    errorMsg.value = err.message
  }
}

async function submitBooking() {
  errorMsg.value = null
  try {
    await bookingsStore.createBooking({
      tour_id: tour.value.id,
      ...form,
    })
    router.push('/mi-perfil')
  } catch (err) {
    errorMsg.value = err.message
  }
}

onMounted(async () => {
  await toursStore.fetchTourDetail(route.params.tourId)
  await refreshServerQuote()
})
</script>

<style scoped>
.page-padding {
  padding: 2rem 1.25rem;
}

.notice-banner {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
}

.error-banner {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.field input,
.field select,
.field textarea {
  padding: 0.65rem;
  border: 1px solid #ccc;
  border-radius: var(--radius-sm);
  font-family: inherit;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quote-summary {
  background: var(--color-mineral-ivory);
  padding: 1.25rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}

.quote-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-turquesa-cactours);
  margin-top: 0.5rem;
}
</style>
