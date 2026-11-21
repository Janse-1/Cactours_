<template>
  <div class="profile-page container">
    <header class="profile-welcome">
      <div>
        <p class="section-eyebrow">Tu espacio Cactours</p>
        <h1>Hola, <em>{{ firstName }}</em></h1>
        <p>Desde aquí puedes consultar tus datos y el estado de tus solicitudes.</p>
      </div>
      <RouterLink to="/tours" class="btn-accent profile-explore">
        Explorar experiencias
        <ArrowUpRight :size="17" aria-hidden="true" />
      </RouterLink>
      <Compass class="profile-watermark" :size="170" aria-hidden="true" />
    </header>

    <FeedbackState
      v-if="successMessage"
      class="profile-notice"
      variant="success"
      title="Actualización completada"
      :message="successMessage"
    />

    <FeedbackState
      v-if="cancellationError"
      class="profile-notice"
      variant="error"
      title="No pudimos cancelar la solicitud"
      :message="cancellationError"
    />

    <div v-if="authStore.user" class="profile-grid">
      <section class="profile-card profile-card--personal spotlight-card">
        <div class="profile-card-heading">
          <span class="profile-icon"><UserRound :size="20" aria-hidden="true" /></span>
          <div>
            <p class="section-eyebrow">Información de cuenta</p>
            <h2>Tus datos</h2>
          </div>
        </div>

        <dl class="personal-details">
          <div>
            <dt>Nombre</dt>
            <dd>{{ authStore.user.persona?.nombre_completo || authStore.user.username || '—' }}</dd>
          </div>
          <div>
            <dt>Correo electrónico</dt>
            <dd>{{ authStore.user.email || '—' }}</dd>
          </div>
          <div>
            <dt>Identificación</dt>
            <dd>{{ authStore.user.persona?.identificacion || '—' }}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{{ authStore.user.persona?.telefono || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="profile-card profile-card--bookings spotlight-card spotlight-card--flat">
        <header class="bookings-heading">
          <div>
            <p class="section-eyebrow">Tus próximos recuerdos</p>
            <h2>Solicitudes de reserva</h2>
          </div>
          <span v-if="!bookingsStore.loading && !bookingsStore.error" class="booking-count">
            {{ bookingsStore.bookings.length }} {{ bookingsStore.bookings.length === 1 ? 'solicitud' : 'solicitudes' }}
          </span>
        </header>

        <FeedbackState
          v-if="bookingsStore.loading"
          class="profile-state"
          variant="loading"
          heading-tag="h3"
          title="Consultando tu historial..."
        />

        <FeedbackState
          v-else-if="bookingsStore.error"
          class="profile-state"
          variant="error"
          heading-tag="h3"
          title="No se pudo consultar tu historial"
          :message="bookingsStore.error"
        >
          <template #actions>
            <button type="button" class="btn-primary" @click="loadBookings">Intentar de nuevo</button>
          </template>
        </FeedbackState>

        <div v-else-if="bookingsStore.bookings.length" class="booking-list">
          <article
            v-for="booking in bookingsStore.bookings"
            :key="booking.id"
            class="booking-card spotlight-card"
          >
            <div class="booking-card-top">
              <span class="booking-code">{{ booking.codigo_reserva }}</span>
              <span class="badge status-pill" :class="`status-pill--${statusClass(booking.estado_display)}`">
                {{ booking.estado_display }}
              </span>
            </div>
            <h3>{{ booking.tour.nombre_tour }}</h3>
            <p class="booking-destination"><MapPin :size="14" aria-hidden="true" /> {{ booking.destino }}</p>
            <div class="booking-meta">
              <span><CalendarDays :size="15" aria-hidden="true" /> {{ formatDate(booking.fecha) }}</span>
              <span><Users :size="15" aria-hidden="true" /> {{ booking.cant_personas }} {{ booking.cant_personas === 1 ? 'viajero' : 'viajeros' }}</span>
            </div>
            <details class="booking-details">
              <summary>Ver detalles de la solicitud</summary>
              <dl>
                <div>
                  <dt>Lugar de salida</dt>
                  <dd>{{ booking.lugar_salida }}</dd>
                </div>
                <div>
                  <dt>Hora</dt>
                  <dd>{{ formatTime(booking.hora) }}</dd>
                </div>
                <div>
                  <dt>Medio de pago preferido</dt>
                  <dd>{{ booking.medio_pago_display }}</dd>
                </div>
                <div v-if="booking.opciones?.length">
                  <dt>Opciones adicionales</dt>
                  <dd>{{ booking.opciones.map((option) => option.nombre_opcion).join(', ') }}</dd>
                </div>
              </dl>
              <p v-if="booking.comentarios">{{ booking.comentarios }}</p>
            </details>
            <footer class="booking-card-footer">
              <span>Total de la solicitud</span>
              <strong>{{ formatCurrency(booking.costo_total) }}</strong>
            </footer>
            <button
              v-if="booking.estado === 'PENDIENTE'"
              type="button"
              class="booking-cancel magnetic-button"
              :disabled="bookingsStore.cancellingBookingId === booking.id"
              @click="cancelBooking(booking)"
            >
              {{ bookingsStore.cancellingBookingId === booking.id ? 'Cancelando...' : 'Solicitar cancelación' }}
            </button>
          </article>
        </div>

        <FeedbackState
          v-else
          class="profile-state"
          variant="empty"
          heading-tag="h3"
          title="Aún no tienes solicitudes"
          message="Cuando envíes una solicitud de reserva, podrás consultar aquí su estado y detalles."
        >
          <template #actions>
            <RouterLink to="/tours" class="btn-primary">
              Explorar el catálogo
              <ArrowUpRight :size="16" aria-hidden="true" />
            </RouterLink>
          </template>
        </FeedbackState>
      </section>
    </div>

    <FeedbackState
      v-else-if="authStore.loading"
      class="profile-state"
      variant="loading"
      title="Cargando tu perfil..."
    />
    <FeedbackState
      v-else
      class="profile-state"
      variant="error"
      title="No pudimos cargar tu sesión"
      message="Inicia sesión para consultar tu perfil."
    >
      <template #actions>
        <RouterLink to="/login" class="btn-primary">Iniciar sesión</RouterLink>
      </template>
    </FeedbackState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  MapPin,
  UserRound,
  Users,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useBookingsStore } from '@/stores/bookings.store'
import FeedbackState from '@/components/feedback/FeedbackState.vue'

const authStore = useAuthStore()
const bookingsStore = useBookingsStore()
const route = useRoute()
const successMessage = ref(
  route.query.reserva === 'enviada'
    ? 'Tu solicitud fue enviada. El equipo de Cactours confirmará la disponibilidad; no es un pago ni una reserva confirmada.'
    : '',
)
const cancellationError = ref('')

const firstName = computed(() => {
  const name = authStore.user?.persona?.nombre_completo || authStore.user?.username || 'viajero'
  return name.trim().split(/\s+/)[0]
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

function formatDate(value) {
  if (!value) return 'Fecha por confirmar'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatTime(value) {
  return value ? value.slice(0, 5) : 'Hora por confirmar'
}

function statusClass(value) {
  const status = String(value || '').toLocaleLowerCase('es-CO')
  if (status.includes('confirm') || status.includes('aprobad')) return 'success'
  if (status.includes('cancel') || status.includes('rechaz')) return 'error'
  return 'pending'
}

function loadBookings() {
  bookingsStore.fetchMyBookings()
}

async function cancelBooking(booking) {
  if (booking.estado !== 'PENDIENTE' || bookingsStore.cancellingBookingId) return
  if (!window.confirm(`¿Solicitas cancelar la reserva ${booking.codigo_reserva}?`)) return

  cancellationError.value = ''
  successMessage.value = ''
  try {
    await bookingsStore.cancelBooking(booking.id)
    successMessage.value = 'La solicitud pendiente fue cancelada. No se realizó ningún cobro.'
  } catch (error) {
    cancellationError.value = error.message
  }
}

onMounted(loadBookings)
</script>

<style scoped>
.profile-page {
  min-height: 65vh;
  padding-top: clamp(2rem, 5vw, 4rem);
  padding-bottom: clamp(4rem, 8vw, 7rem);
}

.profile-notice {
  margin-bottom: 1rem;
}

.profile-welcome {
  position: relative;
  display: flex;
  min-height: 210px;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-bottom: 1.4rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  background:
    radial-gradient(ellipse at 82% 10%, rgba(6, 155, 224, 0.2), transparent 34%),
    linear-gradient(120deg, #0b353b, #026374);
  color: var(--color-blanco);
}

.profile-welcome .section-eyebrow {
  color: #b7e5df;
}

.profile-welcome h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--color-blanco);
  font-size: clamp(2.4rem, 5vw, 4.25rem);
  letter-spacing: -0.075em;
  line-height: 1;
}

.profile-welcome h1 em {
  color: #b7e5df;
  font-family: var(--font-editorial);
  font-weight: 500;
}

.profile-welcome > div > p:last-child {
  position: relative;
  z-index: 1;
  max-width: 460px;
  margin: 0.75rem 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.83rem;
}

.profile-explore {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  gap: 0.45rem;
}

.profile-watermark {
  position: absolute;
  top: 50%;
  right: 22%;
  color: rgba(255, 255, 255, 0.065);
  transform: translateY(-50%) rotate(-18deg);
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(250px, 0.7fr) minmax(0, 1.3fr);
  align-items: start;
  gap: 1.2rem;
}

.profile-card {
  min-width: 0;
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: var(--radius-md);
  padding: clamp(1.15rem, 2.5vw, 1.65rem);
  background: var(--color-blanco);
  box-shadow: var(--shadow-card);
}

.profile-card-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-icon {
  display: grid;
  width: 43px;
  height: 43px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 13px;
  background: rgba(2, 99, 116, 0.08);
  color: var(--color-turquesa-cactours);
}

.profile-card-heading .section-eyebrow,
.bookings-heading .section-eyebrow {
  margin-bottom: 0.2rem;
  font-size: 0.57rem;
}

.profile-card h2 {
  margin: 0;
  color: var(--color-carbon);
  font-size: 1.17rem;
  letter-spacing: -0.045em;
}

.personal-details {
  display: grid;
  gap: 0;
  margin: 1.2rem 0 0;
}

.personal-details > div {
  border-top: 1px solid rgba(17, 17, 17, 0.08);
  padding: 0.8rem 0;
}

.personal-details dt {
  color: var(--color-muted);
  font-size: 0.65rem;
}

.personal-details dd {
  overflow-wrap: anywhere;
  margin: 0.15rem 0 0;
  color: var(--color-carbon);
  font-size: 0.79rem;
  font-weight: 700;
}

.bookings-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.booking-count {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.38rem 0.65rem;
  background: rgba(2, 99, 116, 0.08);
  color: var(--color-turquesa-cactours);
  font-size: 0.64rem;
  font-weight: 800;
}

.booking-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 285px), 1fr));
  gap: 0.8rem;
}

.booking-card {
  min-width: 0;
  border: 1px solid rgba(2, 99, 116, 0.11);
  border-radius: 12px;
  padding: 1rem;
  background:
    radial-gradient(ellipse at 100% 0, rgba(6, 155, 224, 0.08), transparent 48%),
    #fff;
}

.booking-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.booking-code {
  color: var(--color-muted);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.status-pill {
  border-radius: 999px;
  padding: 0.28rem 0.58rem;
  font-size: 0.61rem;
  font-weight: 800;
}

.status-pill--pending {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.status-pill--success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.status-pill--error {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.booking-card h3 {
  margin: 0.8rem 0 0.25rem;
  color: var(--color-carbon);
  font-size: 0.98rem;
  letter-spacing: -0.035em;
}

.booking-destination {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.68rem;
}

.booking-meta {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.9rem;
  color: var(--color-muted);
  font-size: 0.68rem;
}

.booking-meta span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.booking-meta svg,
.booking-destination svg {
  flex: 0 0 auto;
  color: var(--color-turquesa-cactours);
}

.booking-details {
  margin-top: 0.8rem;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
  padding-top: 0.65rem;
}

.booking-details summary {
  color: var(--color-turquesa-cactours);
  font-size: 0.69rem;
  font-weight: 800;
  cursor: pointer;
  text-underline-offset: 3px;
}

.booking-details dl {
  display: grid;
  gap: 0.55rem;
  margin: 0.75rem 0 0;
}

.booking-details dt {
  color: var(--color-muted);
  font-size: 0.6rem;
}

.booking-details dd {
  margin: 0.1rem 0 0;
  color: var(--color-carbon);
  font-size: 0.7rem;
  overflow-wrap: anywhere;
}

.booking-details > p {
  margin: 0.7rem 0 0;
  color: var(--color-muted);
  font-size: 0.69rem;
  overflow-wrap: anywhere;
}

.booking-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
  margin-top: 0.9rem;
  padding-top: 0.7rem;
}

.booking-card-footer span {
  color: var(--color-muted);
  font-size: 0.63rem;
}

.booking-card-footer strong {
  color: var(--color-turquesa-cactours);
  font-family: var(--font-heading);
  font-size: 0.88rem;
}

.booking-cancel {
  min-height: 40px;
  margin-top: 0.85rem;
  border: 1px solid rgba(197, 34, 31, 0.28);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.7rem;
  background: transparent;
  color: var(--color-error-text);
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
}

.booking-cancel:hover:not(:disabled) {
  background: var(--color-error-bg);
}

.booking-cancel:disabled {
  cursor: wait;
  opacity: 0.65;
}

.profile-state {
  min-height: 230px;
}

@media (max-width: 800px) {
  .profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .personal-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 1rem;
  }
}

@media (max-width: 560px) {
  .profile-welcome {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.1rem;
  }

  .profile-explore {
    min-height: 46px;
  }

  .profile-watermark {
    right: -2rem;
  }

  .personal-details {
    grid-template-columns: minmax(0, 1fr);
  }

  .bookings-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

</style>
