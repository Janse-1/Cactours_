<template>
  <div class="checkout-page container">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <RouterLink to="/tours">Catálogo</RouterLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span>Solicitud de reserva</span>
    </nav>

    <FeedbackState
      v-if="toursStore.detailLoading && !tour"
      class="checkout-state"
      variant="loading"
      title="Cargando tu experiencia..."
    />

    <FeedbackState
      v-else-if="!tour"
      class="checkout-state"
      variant="error"
      heading-tag="h1"
      title="No encontramos este tour"
      :message="toursStore.detailError || 'Vuelve al catálogo y elige una experiencia disponible.'"
    >
      <template #actions>
        <RouterLink to="/tours" class="btn-primary">Volver al catálogo</RouterLink>
      </template>
    </FeedbackState>

    <template v-else>
      <header class="checkout-heading">
        <p class="section-eyebrow">Un paso más cerca de tu viaje</p>
        <h1>Solicita tu reserva.</h1>
        <p>Completa los detalles y revisa la cotización calculada por el servidor.</p>
      </header>

      <div class="checkout-steps" aria-label="Pasos para solicitar una reserva">
        <span class="checkout-step checkout-step--complete"><Check :size="14" aria-hidden="true" /> Tour elegido</span>
        <span class="checkout-step checkout-step--active"><span>02</span> Tus datos</span>
        <span class="checkout-step"><span>03</span> Solicitud</span>
      </div>

      <p v-if="errorMsg" class="feedback-banner feedback-banner--error checkout-error" role="alert">
        {{ errorMsg }}
      </p>

      <form id="booking-form" class="checkout-layout" novalidate @submit.prevent="submitBooking">
        <div class="checkout-main">
          <section class="checkout-section spotlight-card spotlight-card--flat">
            <div class="checkout-section-heading">
              <span>01</span>
              <div>
                <h2>Cuéntanos sobre tu viaje</h2>
                <p>Usaremos esta información para coordinar los detalles contigo.</p>
              </div>
            </div>

            <div class="checkout-fields">
              <div class="checkout-field">
                <label class="form-label" for="lugar-salida">Lugar de salida</label>
                <input
                  id="lugar-salida"
                  v-model="form.lugar_salida"
                  class="form-control"
                  type="text"
                  autocomplete="address-level2"
                  placeholder="Ej. Riohacha, centro"
                  required
                  :aria-invalid="Boolean(fieldErrors.lugar_salida)"
                  :aria-describedby="fieldErrors.lugar_salida ? 'lugar-salida-error' : undefined"
                  @blur="validateField('lugar_salida')"
                  @input="clearFieldError('lugar_salida')"
                />
                <small v-if="fieldErrors.lugar_salida" id="lugar-salida-error" class="field-error" role="alert">
                  {{ fieldErrors.lugar_salida }}
                </small>
              </div>

              <div class="checkout-field">
                <label class="form-label" for="fecha-tour">Fecha preferida</label>
                <input
                  id="fecha-tour"
                  v-model="form.fecha"
                  class="form-control"
                  type="date"
                  :min="todayIso"
                  required
                  :aria-invalid="Boolean(fieldErrors.fecha)"
                  :aria-describedby="fieldErrors.fecha ? 'fecha-tour-error' : undefined"
                  @blur="validateField('fecha')"
                  @input="clearFieldError('fecha')"
                />
                <small v-if="fieldErrors.fecha" id="fecha-tour-error" class="field-error" role="alert">
                  {{ fieldErrors.fecha }}
                </small>
              </div>

              <div class="checkout-field">
                <label class="form-label" for="cant-personas">Número de viajeros</label>
                <input
                  id="cant-personas"
                  v-model.number="form.cant_personas"
                  class="form-control"
                  type="number"
                  min="1"
                  :max="tour.cupo_maximo"
                  required
                  :aria-invalid="Boolean(fieldErrors.cant_personas)"
                  :aria-describedby="fieldErrors.cant_personas
                    ? 'cant-personas-error cant-personas-hint'
                    : 'cant-personas-hint'"
                  @blur="validateField('cant_personas')"
                  @input="clearFieldError('cant_personas')"
                  @change="refreshServerQuote"
                />
                <small v-if="fieldErrors.cant_personas" id="cant-personas-error" class="field-error" role="alert">
                  {{ fieldErrors.cant_personas }}
                </small>
                <small id="cant-personas-hint" class="field-hint">
                  Cupo máximo: {{ tour.cupo_maximo }} personas por salida.
                </small>
              </div>

              <div class="checkout-field">
                <label class="form-label" for="medio-pago">Medio de pago preferido</label>
                <select id="medio-pago" v-model="form.medio_pago" class="form-control" required>
                  <option value="TRANSFERENCIA">Transferencia bancaria / PSE</option>
                  <option value="TARJETA">Tarjeta de crédito / débito</option>
                  <option value="EFECTIVO">Efectivo en agencia</option>
                </select>
                <small class="field-hint">Solo es una preferencia; no se realizará ningún cobro aquí.</small>
              </div>
            </div>
          </section>

          <section
            v-if="tour.opciones_disponibles?.length"
            class="checkout-section spotlight-card spotlight-card--flat"
          >
            <div class="checkout-section-heading">
              <span>02</span>
              <div>
                <h2>Hazlo a tu manera</h2>
                <p>Las opciones adicionales se sumarán a la cotización.</p>
              </div>
            </div>

            <div class="options-grid">
              <label v-for="option in tour.opciones_disponibles" :key="option.id" class="option-item">
                <input
                  v-model="form.opciones_ids"
                  type="checkbox"
                  :value="option.id"
                  @change="refreshServerQuote"
                />
                <span class="option-copy">
                  <strong>{{ option.nombre_op }}</strong>
                  <small>+{{ formatCurrency(option.precio_adic) }}</small>
                </span>
                <Check class="option-check" :size="16" aria-hidden="true" />
              </label>
            </div>
          </section>

          <section class="checkout-section checkout-section--comments spotlight-card spotlight-card--flat">
            <div class="checkout-section-heading">
              <span>{{ tour.opciones_disponibles?.length ? '03' : '02' }}</span>
              <div>
                <h2>¿Algo más que debamos saber?</h2>
                <p>Cuéntanos si tienes alguna necesidad especial.</p>
              </div>
            </div>
            <label class="visually-hidden" for="comentarios">Comentarios o requerimientos especiales</label>
            <textarea
              id="comentarios"
              v-model="form.comentarios"
              class="form-control"
              rows="4"
              placeholder="Punto de recogida, alimentación u otros detalles..."
            ></textarea>
          </section>
        </div>

        <aside class="booking-summary spotlight-card spotlight-card--flat">
          <div class="summary-image">
            <img v-if="tourCoverImage && !summaryImageUnavailable" :src="tourCoverImage" :alt="tour.nombre_tour" loading="lazy" @error="summaryImageUnavailable = true" />
            <div v-else class="summary-image-placeholder"><Compass :size="24" aria-hidden="true" /></div>
          </div>
          <div class="summary-tour">
            <span class="summary-kicker"><MapPin :size="13" aria-hidden="true" /> {{ tour.ciudad_destino }}</span>
            <h2>{{ tour.nombre_tour }}</h2>
            <span class="summary-duration"><Clock3 :size="14" aria-hidden="true" /> {{ tour.duracion_dias }} {{ tour.duracion_dias === 1 ? 'día' : 'días' }}</span>
          </div>

          <div class="quote-summary" aria-live="polite">
            <div class="quote-summary-heading">
              <h3>Cotización estimada</h3>
              <span v-if="quoteLoading" class="quote-spinner" role="status">Actualizando...</span>
            </div>
            <template v-if="quote">
              <div class="quote-line">
                <span>Base del tour</span>
                <strong>{{ formatCurrency(quote.subtotal_base) }}</strong>
              </div>
              <div class="quote-line">
                <span>Opciones adicionales</span>
                <strong>{{ formatCurrency(quote.subtotal_opciones) }}</strong>
              </div>
              <div class="quote-total">
                <span>Total estimado</span>
                <strong>{{ formatCurrency(quote.costo_total) }}</strong>
              </div>
            </template>
            <p v-else class="quote-placeholder">
              {{ quoteLoading ? 'Calculando tu cotización...' : 'La cotización aparecerá aquí.' }}
            </p>
            <button
              v-if="!quote && !quoteLoading"
              type="button"
              class="quote-retry"
              @click="refreshServerQuote"
            >
              Recalcular cotización
            </button>
          </div>

          <button
            type="submit"
            class="btn-accent submit-booking"
            :disabled="bookingsStore.loading || quoteLoading || !quote"
          >
            {{ bookingsStore.loading ? 'Enviando solicitud...' : 'Enviar solicitud' }}
            <ArrowRight :size="17" aria-hidden="true" />
          </button>
          <p class="summary-disclaimer">
            <ShieldCheck :size="15" aria-hidden="true" />
            {{ bookingsStore.loading ? 'Registrando tu solicitud.' : 'No es un pago ni una reserva confirmada.' }}
          </p>
        </aside>
      </form>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
} from 'lucide-vue-next'
import { useToursStore } from '@/stores/tours.store'
import { useBookingsStore } from '@/stores/bookings.store'
import { resolveTourCover } from '@/data/tourMedia'
import FeedbackState from '@/components/feedback/FeedbackState.vue'

const route = useRoute()
const router = useRouter()
const toursStore = useToursStore()
const bookingsStore = useBookingsStore()

const tour = computed(() => toursStore.selectedTour)
const quote = computed(() => bookingsStore.currentQuote)
const tourCoverImage = computed(() => tour.value ? resolveTourCover(tour.value) : '')
const errorMsg = ref('')
const quoteLoading = ref(false)
const summaryImageUnavailable = ref(false)
const fieldErrors = reactive({
  lugar_salida: '',
  fecha: '',
  cant_personas: '',
})

const today = new Date()
const todayIso = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')

const form = reactive({
  lugar_salida: '',
  fecha: todayIso,
  cant_personas: 1,
  medio_pago: 'TRANSFERENCIA',
  opciones_ids: [],
  comentarios: '',
})

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function refreshServerQuote() {
  if (!tour.value) return
  errorMsg.value = ''
  bookingsStore.currentQuote = null
  if (!validateField('cant_personas')) return
  quoteLoading.value = true
  try {
    await bookingsStore.quoteBooking({
      tourId: tour.value.id,
      cantPersonas: form.cant_personas,
      opcionesIds: form.opciones_ids,
    })
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    quoteLoading.value = false
  }
}

function validateField(field) {
  let message = ''
  if (field === 'lugar_salida' && !form.lugar_salida.trim()) {
    message = 'Indica el lugar desde donde saldrás.'
  } else if (field === 'fecha' && (!form.fecha || form.fecha < todayIso)) {
    message = 'Elige una fecha de hoy en adelante.'
  } else if (field === 'cant_personas') {
    const travelers = Number(form.cant_personas)
    if (!Number.isInteger(travelers) || travelers < 1) {
      message = 'Indica al menos una persona.'
    } else if (travelers > Number(tour.value?.cupo_maximo)) {
      message = `El cupo máximo para este tour es de ${tour.value.cupo_maximo} personas.`
    }
  }

  fieldErrors[field] = message
  return !message
}

function clearFieldError(field) {
  fieldErrors[field] = ''
}

function validateForm() {
  const isValid = ['lugar_salida', 'fecha', 'cant_personas']
    .map(validateField)
    .every(Boolean)

  if (!isValid) {
    document.querySelector('[aria-invalid="true"]')?.focus()
  }
  return isValid
}

async function submitBooking() {
  if (bookingsStore.loading || quoteLoading.value) return
  errorMsg.value = ''
  if (!validateForm()) return
  if (!quote.value) {
    errorMsg.value = 'Calcula la cotización antes de enviar la solicitud.'
    return
  }

  try {
    await bookingsStore.createBooking({
      tour_id: tour.value.id,
      ...form,
    })
    router.push({ name: 'user-profile', query: { reserva: 'enviada' } })
  } catch (error) {
    errorMsg.value = error.message
  }
}

onMounted(async () => {
  bookingsStore.currentQuote = null
  try {
    await toursStore.fetchTourDetail(route.params.tourId)
    await refreshServerQuote()
  } catch {
    // The store exposes the tour error in the view.
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 65vh;
  padding-top: 1.4rem;
  padding-bottom: clamp(4rem, 8vw, 7rem);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.2rem;
  color: var(--color-muted);
  font-size: 0.72rem;
}

.breadcrumbs a {
  color: var(--color-turquesa-cactours);
  font-weight: 700;
  text-decoration: none;
}

.checkout-heading {
  margin-bottom: 1.3rem;
}

.checkout-heading h1 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  letter-spacing: -0.075em;
  line-height: 1;
}

.checkout-heading > p:last-child {
  margin: 0.65rem 0 0;
  color: var(--color-muted);
  font-size: 0.88rem;
}

.checkout-steps {
  display: flex;
  align-items: center;
  gap: clamp(0.65rem, 2vw, 1.5rem);
  overflow-x: auto;
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 1rem;
}

.checkout-step {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 0.45rem;
  color: #78827f;
  font-size: 0.69rem;
  font-weight: 700;
  white-space: nowrap;
}

.checkout-step > span,
.checkout-step--complete > svg {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.06);
  color: var(--color-muted);
  font-size: 0.61rem;
}

.checkout-step--complete {
  color: var(--color-turquesa-cactours);
}

.checkout-step--complete > svg {
  padding: 5px;
  background: rgba(2, 99, 116, 0.1);
  color: var(--color-turquesa-cactours);
}

.checkout-step--active {
  color: var(--color-carbon);
}

.checkout-step--active > span {
  background: var(--color-turquesa-cactours);
  color: var(--color-blanco);
}

.checkout-error {
  margin-top: 1rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  align-items: start;
  gap: clamp(1.25rem, 3vw, 2.4rem);
  margin-top: 1.5rem;
}

.checkout-main {
  display: grid;
  gap: 1.2rem;
}

.checkout-section {
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: var(--radius-md);
  padding: clamp(1.1rem, 2.5vw, 1.7rem);
  background: var(--color-blanco);
  box-shadow: 0 10px 28px rgba(2, 44, 49, 0.045);
}

.checkout-section-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.checkout-section-heading > span {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: rgba(2, 99, 116, 0.09);
  color: var(--color-turquesa-cactours);
  font-size: 0.65rem;
  font-weight: 800;
}

.checkout-section-heading h2 {
  margin: 0;
  color: var(--color-carbon);
  font-size: 1.03rem;
  letter-spacing: -0.035em;
}

.checkout-section-heading p {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.55;
}

.checkout-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.checkout-field {
  min-width: 0;
}

.checkout-field .form-control[aria-invalid='true'] {
  border-color: var(--color-error-text);
}

.field-error {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-error-text);
  font-size: 0.68rem;
  line-height: 1.45;
}

.field-hint {
  display: block;
  margin-top: 0.38rem;
  color: var(--color-muted);
  font-size: 0.65rem;
  line-height: 1.45;
}

.checkout-section textarea {
  min-height: 112px;
  resize: vertical;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.option-item {
  display: flex;
  min-height: 66px;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  padding: 0.75rem;
  cursor: pointer;
  transition: border-color 180ms ease, background-color 180ms ease;
}

.option-item:has(input:checked) {
  border-color: var(--color-turquesa-cactours);
  background: rgba(2, 99, 116, 0.045);
}

.option-item input {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  accent-color: var(--color-turquesa-cactours);
}

.option-copy {
  display: grid;
  flex: 1;
  gap: 0.15rem;
}

.option-copy strong {
  color: var(--color-carbon);
  font-size: 0.75rem;
}

.option-copy small {
  color: var(--color-muted);
  font-size: 0.67rem;
}

.option-check {
  color: var(--color-turquesa-cactours);
  opacity: 0;
}

.option-item:has(input:checked) .option-check {
  opacity: 1;
}

.booking-summary {
  position: sticky;
  top: 100px;
  overflow: hidden;
  border: 1px solid rgba(2, 99, 116, 0.12);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 18px 48px rgba(2, 44, 49, 0.09);
}

.summary-image {
  height: 190px;
  background: var(--color-azul-petroleo);
}

.summary-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-image-placeholder {
  display: grid;
  height: 100%;
  place-items: center;
  color: rgba(255, 255, 255, 0.8);
}

.summary-tour {
  padding: 1.15rem 1.2rem 0;
}

.summary-kicker,
.summary-duration {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.66rem;
  font-weight: 700;
}

.summary-tour h2 {
  margin: 0.35rem 0;
  color: var(--color-carbon);
  font-size: 1.2rem;
  letter-spacing: -0.045em;
  line-height: 1.18;
}

.summary-duration {
  color: var(--color-muted);
  font-weight: 500;
}

.quote-summary {
  margin: 1.15rem 1.2rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  padding: 1rem 0;
}

.quote-summary-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}

.quote-summary-heading h3 {
  margin: 0;
  color: var(--color-carbon);
  font-size: 0.82rem;
}

.quote-spinner {
  color: var(--color-muted);
  font-size: 0.6rem;
}

.quote-line,
.quote-total {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.35rem 0;
  color: var(--color-muted);
  font-size: 0.71rem;
}

.quote-line strong {
  color: var(--color-carbon);
  font-weight: 600;
  white-space: nowrap;
}

.quote-total {
  align-items: baseline;
  margin-top: 0.35rem;
  border-top: 1px dashed var(--color-line);
  padding-top: 0.75rem;
  color: var(--color-carbon);
  font-size: 0.77rem;
  font-weight: 700;
}

.quote-total strong {
  color: var(--color-turquesa-cactours);
  font-family: var(--font-heading);
  font-size: 1.05rem;
  white-space: nowrap;
}

.quote-placeholder {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
}

.quote-retry {
  margin-top: 0.65rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-turquesa-cactours);
  font-size: 0.68rem;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.submit-booking {
  display: flex;
  width: calc(100% - 2.4rem);
  min-height: 50px;
  justify-content: space-between;
  margin: 1rem 1.2rem 0;
}

.summary-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin: 0;
  padding: 0.8rem 1.2rem 1.1rem;
  color: var(--color-muted);
  font-size: 0.63rem;
  line-height: 1.45;
}

.summary-disclaimer svg {
  flex: 0 0 auto;
  color: var(--color-turquesa-cactours);
}

.checkout-state {
  min-height: 420px;
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

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.7fr);
  }
}

@media (max-width: 760px) {
  .checkout-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .booking-summary {
    position: static;
    grid-row: 1;
  }

  .summary-image {
    height: 170px;
  }
}

@media (max-width: 540px) {
  .checkout-fields,
  .options-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .checkout-step {
    font-size: 0.62rem;
  }

  .checkout-section-heading h2 {
    font-size: 0.95rem;
  }
}

</style>
