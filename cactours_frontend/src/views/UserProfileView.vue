<template>
  <div class="container page-padding">
    <h1>Mi Perfil e Historial de Solicitudes</h1>

    <section v-if="authStore.user" class="surface-card profile-header">
      <h2>{{ authStore.user.persona?.nombre_completo || authStore.user.username }}</h2>
      <p>
        <strong>Correo:</strong> {{ authStore.user.email }} |
        <strong>Identificación:</strong> {{ authStore.user.persona?.identificacion }} |
        <strong>Teléfono:</strong> {{ authStore.user.persona?.telefono }}
      </p>
    </section>

    <section class="surface-card bookings-section">
      <h2>Mis Solicitudes de Reserva</h2>
      <p v-if="bookingsStore.loading">Consultando historial...</p>
      <table v-else-if="bookingsStore.bookings.length" class="bookings-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tour / Destino</th>
            <th>Fecha</th>
            <th>Personas</th>
            <th>Total (COP)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reserva in bookingsStore.bookings" :key="reserva.id">
            <td><strong>{{ reserva.codigo_reserva }}</strong></td>
            <td>{{ reserva.tour.nombre_tour }} ({{ reserva.destino }})</td>
            <td>{{ reserva.fecha }}</td>
            <td>{{ reserva.cant_personas }}</td>
            <td>${{ Number(reserva.costo_total).toLocaleString('es-CO') }}</td>
            <td>
              <span class="status-pill">{{ reserva.estado_display }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Aún no tienes solicitudes de reserva registradas.</p>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useBookingsStore } from '@/stores/bookings.store'

const authStore = useAuthStore()
const bookingsStore = useBookingsStore()

onMounted(() => {
  bookingsStore.fetchMyBookings()
})
</script>

<style scoped>
.page-padding {
  padding: 2rem 1.25rem;
}

.profile-header {
  margin-bottom: 1.5rem;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  text-align: left;
  padding: 0.85rem;
  border-bottom: 1px solid #eee;
}

.status-pill {
  background: var(--color-mineral-ivory);
  color: var(--color-turquesa-cactours);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
}
</style>
