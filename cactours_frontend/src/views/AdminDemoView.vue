<template>
  <section class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink to="/" class="admin-brand">
        <img src="/images/logo-cactours.png" alt="" />
        <div>
          <strong>Cactours</strong>
          <span>Modo administrador</span>
        </div>
      </RouterLink>

      <nav class="admin-nav" aria-label="Panel administrativo">
        <button :class="{ active: activeTab === 'overview' }" type="button" @click="activeTab = 'overview'">
          <LayoutDashboard :size="18" /> Resumen
        </button>
        <button :class="{ active: activeTab === 'bookings' }" type="button" @click="activeTab = 'bookings'">
          <CalendarCheck :size="18" /> Solicitudes
          <span v-if="stats.pendientes" class="nav-count">{{ stats.pendientes }}</span>
        </button>
        <button :class="{ active: activeTab === 'tours' }" type="button" @click="activeTab = 'tours'">
          <MapPinned :size="18" /> Planes
        </button>
      </nav>

      <RouterLink to="/tours" class="switch-role">
        <Users :size="17" /> Volver al modo cliente
      </RouterLink>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div>
          <span class="eyebrow">Centro de operaciones</span>
          <h1>{{ tabTitle }}</h1>
        </div>
        <button v-if="activeTab === 'tours'" class="primary-action" type="button" @click="openCreate">
          <Plus :size="18" /> Nuevo plan
        </button>
      </header>

      <div v-if="loading" class="loading-state">Cargando información...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>

      <template v-else>
        <section v-if="activeTab === 'overview'" class="overview">
          <div class="stats-grid">
            <article class="stat-card stat-card--blue">
              <div class="stat-icon"><CalendarCheck :size="21" /></div>
              <div><span>Solicitudes</span><strong>{{ stats.reservas }}</strong></div>
              <small>{{ stats.pendientes }} pendientes</small>
            </article>
            <article class="stat-card stat-card--green">
              <div class="stat-icon"><DollarSign :size="21" /></div>
              <div><span>Ingresos estimados</span><strong>{{ formatMoney(stats.ingresos) }}</strong></div>
              <small>Confirmadas y completadas</small>
            </article>
            <article class="stat-card stat-card--gold">
              <div class="stat-icon"><MapPinned :size="21" /></div>
              <div><span>Planes activos</span><strong>{{ stats.tours_publicados }}</strong></div>
              <small>De {{ stats.tours }} totales</small>
            </article>
            <article class="stat-card stat-card--purple">
              <div class="stat-icon"><Users :size="21" /></div>
              <div><span>Clientes</span><strong>{{ stats.clientes }}</strong></div>
              <small>Usuarios registrados</small>
            </article>
          </div>

          <div class="overview-grid">
            <article class="panel">
              <div class="panel-heading">
                <div><span>Actividad reciente</span><h2>Solicitudes de viaje</h2></div>
                <button type="button" @click="activeTab = 'bookings'">Ver todas</button>
              </div>
              <div v-if="recentBookings.length" class="recent-list">
                <button
                  v-for="booking in recentBookings"
                  :key="booking.id"
                  type="button"
                  class="recent-row"
                  @click="activeTab = 'bookings'"
                >
                  <span class="initial">{{ bookingInitial(booking) }}</span>
                  <span class="recent-main">
                    <strong>{{ booking.cliente?.nombre_completo || 'Cliente' }}</strong>
                    <small>{{ booking.tour?.nombre_tour }} · {{ formatDate(booking.fecha) }}</small>
                  </span>
                  <span class="status" :class="statusClass(booking.estado)">{{ booking.estado_display }}</span>
                  <strong>{{ formatMoney(booking.costo_total_num) }}</strong>
                </button>
              </div>
              <div v-else class="empty-mini">Aún no hay solicitudes.</div>
            </article>

            <article class="panel quick-status">
              <div class="panel-heading"><div><span>Estado operativo</span><h2>Reservas por estado</h2></div></div>
              <div class="status-bars">
                <div v-for="item in statusSummary" :key="item.label" class="status-bar">
                  <div class="status-bar-label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
                  <div class="status-track"><span :style="{ width: statusWidth(item.value) }" :class="item.className"></span></div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'bookings'" class="panel table-panel">
          <div class="panel-heading table-heading">
            <div><span>Gestión de viajes</span><h2>Todas las solicitudes</h2></div>
            <label class="search-box">
              <Search :size="16" />
              <input v-model="bookingSearch" type="search" placeholder="Buscar solicitud..." />
            </label>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Plan / destino</th><th>Fecha</th><th>Personas</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                <tr v-for="booking in filteredBookings" :key="booking.id">
                  <td>
                    <strong>{{ booking.cliente?.nombre_completo || 'Cliente sin nombre' }}</strong>
                    <small>{{ booking.codigo_reserva }}</small>
                  </td>
                  <td><strong>{{ booking.tour?.nombre_tour }}</strong><small>{{ booking.destino }}</small></td>
                  <td>{{ formatDate(booking.fecha) }}</td>
                  <td>{{ booking.cant_personas }}</td>
                  <td><strong>{{ formatMoney(booking.costo_total_num) }}</strong></td>
                  <td><span class="status" :class="statusClass(booking.estado)">{{ booking.estado_display }}</span></td>
                  <td>
                    <div class="row-actions">
                      <button
                        v-if="booking.estado !== 'CONFIRMADA'"
                        class="icon-action approve"
                        type="button"
                        title="Aceptar solicitud"
                        :disabled="savingBookingId === booking.id"
                        @click="setBookingStatus(booking, 'CONFIRMADA')"
                      ><Check :size="17" /></button>
                      <button
                        v-if="booking.estado !== 'CANCELADA'"
                        class="icon-action deny"
                        type="button"
                        title="Denegar solicitud"
                        :disabled="savingBookingId === booking.id"
                        @click="setBookingStatus(booking, 'CANCELADA')"
                      ><X :size="17" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!filteredBookings.length" class="empty-table">No hay solicitudes que coincidan.</div>
          </div>
        </section>

        <section v-if="activeTab === 'tours'" class="panel table-panel">
          <div class="panel-heading table-heading">
            <div><span>Catálogo</span><h2>Planes turísticos</h2></div>
            <label class="search-box">
              <Search :size="16" />
              <input v-model="tourSearch" type="search" placeholder="Buscar plan..." />
            </label>
          </div>
          <div class="tour-grid">
            <article v-for="tour in filteredTours" :key="tour.id" class="tour-admin-card">
              <div class="tour-card-cover" :style="coverStyle(tour)">
                <span class="tour-state" :class="tour.estado.toLowerCase()">{{ tour.estado }}</span>
                <div class="tour-card-actions">
                  <button type="button" title="Editar" @click="openEdit(tour)"><Pencil :size="16" /></button>
                  <button type="button" title="Quitar" @click="removeTour(tour)"><Trash2 :size="16" /></button>
                </div>
              </div>
              <div class="tour-card-body">
                <span>{{ tour.ciudad_destino }}</span>
                <h3>{{ tour.nombre_tour }}</h3>
                <div class="tour-meta">
                  <small><Clock3 :size="14" /> {{ tour.duracion_dias }} días</small>
                  <small><Users :size="14" /> Cupo {{ tour.cupo_maximo }}</small>
                  <strong>{{ formatMoney(tour.costo_num) }}</strong>
                </div>
              </div>
            </article>
          </div>
          <div v-if="!filteredTours.length" class="empty-table">No hay planes que coincidan.</div>
        </section>
      </template>
    </main>

    <div v-if="tourModalOpen" class="modal-backdrop" role="presentation" @click.self="tourModalOpen = false">
      <form class="tour-modal" @submit.prevent="saveTour">
        <div class="modal-heading">
          <div><span>Catálogo turístico</span><h2>{{ editingTour ? 'Editar plan' : 'Crear nuevo plan' }}</h2></div>
          <button type="button" aria-label="Cerrar" @click="tourModalOpen = false"><X :size="20" /></button>
        </div>
        <label>Nombre del plan<input v-model="tourForm.nombre_tour" required maxlength="100" /></label>
        <label>Descripción<textarea v-model="tourForm.descripcion" required rows="4" /></label>
        <div class="form-grid">
          <label>Destino<input v-model="tourForm.ciudad_destino" required maxlength="80" /></label>
          <label>Precio por persona (COP)<input v-model.number="tourForm.costo" type="number" min="1" required /></label>
          <label>Duración (días)<input v-model.number="tourForm.duracion_dias" type="number" min="1" required /></label>
          <label>Cupo máximo<input v-model.number="tourForm.cupo_maximo" type="number" min="1" required /></label>
        </div>
        <label>Estado
          <select v-model="tourForm.estado">
            <option value="PUBLICADO">Publicado</option>
            <option value="BORRADOR">Borrador</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </label>
        <div class="modal-actions">
          <button type="button" class="secondary-action" @click="tourModalOpen = false">Cancelar</button>
          <button type="submit" class="primary-action" :disabled="savingTour">{{ savingTour ? 'Guardando...' : 'Guardar plan' }}</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.admin-shell {
  min-height: calc(100vh - 82px);
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  width: min(1500px, calc(100% - 32px));
  margin: 1rem auto 2.5rem;
  overflow: hidden;
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: 24px;
  background: #f7f9f8;
  box-shadow: 0 18px 50px rgba(12, 57, 61, 0.09);
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(2, 99, 116, 0.09);
  padding: 1.25rem 1rem;
  background: #fff;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  color: var(--color-carbon);
  text-decoration: none;
}

.admin-brand img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-brand strong,
.admin-brand span { display: block; }
.admin-brand strong { color: var(--color-turquesa-cactours); font-size: 1rem; }
.admin-brand span { color: #75817f; font-size: 0.72rem; }

.admin-nav {
  display: grid;
  gap: 0.4rem;
}

.admin-nav button {
  display: flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  background: transparent;
  color: #667573;
  cursor: pointer;
  font-weight: 750;
  text-align: left;
}

.admin-nav button.active {
  background: #e9f5f5;
  color: var(--color-turquesa-cactours);
}

.nav-count {
  min-width: 22px;
  margin-left: auto;
  border-radius: 999px;
  padding: 0.08rem 0.35rem;
  background: #d84a45;
  color: #fff;
  font-size: 0.68rem;
  text-align: center;
}

.switch-role {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  border: 1px solid #dbe5e3;
  border-radius: 12px;
  color: #53615e;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
}

.admin-content {
  min-width: 0;
  padding: 1.5rem;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.eyebrow,
.panel-heading span,
.modal-heading span {
  color: #7e8c89;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.admin-header h1 {
  margin: 0.2rem 0 0;
  font-size: clamp(1.45rem, 3vw, 2.15rem);
}

.primary-action,
.secondary-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 11px;
  padding: 0.65rem 1rem;
  cursor: pointer;
  font-weight: 800;
}

.primary-action {
  border: 1px solid var(--color-turquesa-cactours);
  background: var(--color-turquesa-cactours);
  color: #fff;
}

.secondary-action {
  border: 1px solid #d6e0de;
  background: #fff;
  color: #53615e;
}

.loading-state,
.error-state,
.empty-table,
.empty-mini {
  border: 1px dashed #cad8d5;
  border-radius: 14px;
  padding: 2rem;
  background: #fff;
  color: #697774;
  text-align: center;
}

.error-state { border-color: #edbbb8; background: #fff4f3; color: #a62f2b; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.stat-card {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 0.75rem;
  min-height: 128px;
  overflow: hidden;
  border: 1px solid rgba(2, 99, 116, 0.07);
  border-radius: 16px;
  padding: 1rem;
  background: #fff;
}

.stat-card small {
  grid-column: 1 / -1;
  color: #7d8987;
  font-size: 0.72rem;
}

.stat-card span,
.stat-card strong { display: block; }
.stat-card span { color: #6d7b78; font-size: 0.76rem; }
.stat-card strong { margin-top: 0.15rem; font-size: clamp(1.25rem, 2vw, 1.75rem); }

.stat-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
}

.stat-card--blue .stat-icon { background: #e8f3fb; color: #2781b2; }
.stat-card--green .stat-icon { background: #e7f4ed; color: #31825a; }
.stat-card--gold .stat-icon { background: #fff1d8; color: #b47616; }
.stat-card--purple .stat-icon { background: #eeeafa; color: #6d5aa7; }

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
  gap: 0.85rem;
  margin-top: 0.85rem;
}

.panel {
  border: 1px solid rgba(2, 99, 116, 0.08);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(12, 57, 61, 0.035);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf1f0;
  padding: 1rem 1.15rem;
}

.panel-heading h2,
.modal-heading h2 {
  margin: 0.15rem 0 0;
  color: var(--color-carbon);
  font-size: 1.05rem;
}

.panel-heading button {
  border: 0;
  background: transparent;
  color: var(--color-turquesa-cactours);
  cursor: pointer;
  font-weight: 800;
}

.recent-list { padding: 0.35rem 0.8rem; }

.recent-row {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto auto;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  border-bottom: 1px solid #f0f3f2;
  padding: 0.65rem 0.25rem;
  background: transparent;
  color: var(--color-carbon);
  text-align: left;
  cursor: pointer;
}

.recent-row:last-child { border-bottom: 0; }

.initial {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: #e8f3f4;
  color: var(--color-turquesa-cactours);
  font-weight: 900;
}

.recent-main strong,
.recent-main small,
.recent-row td small { display: block; }
.recent-main strong { font-size: 0.82rem; }
.recent-main small { color: #7a8784; font-size: 0.68rem; }

.status {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.66rem;
  font-weight: 850;
  white-space: nowrap;
}

.status.pending { background: #fff3d7; color: #94620e; }
.status.confirmed { background: #dff3e7; color: #27704a; }
.status.cancelled { background: #fde7e5; color: #aa4039; }
.status.completed { background: #e8eafb; color: #4d58a1; }

.quick-status { min-height: 240px; }
.status-bars { display: grid; gap: 1.15rem; padding: 1.25rem 1.15rem; }
.status-bar-label { display: flex; justify-content: space-between; margin-bottom: 0.35rem; color: #667370; font-size: 0.76rem; }
.status-track { height: 7px; overflow: hidden; border-radius: 999px; background: #edf1f0; }
.status-track span { display: block; height: 100%; border-radius: 999px; }
.status-track .pending { background: #e5b64f; }
.status-track .confirmed { background: #48a676; }
.status-track .cancelled { background: #d96a63; }
.status-track .completed { background: #7078b6; }

.table-panel { overflow: hidden; }
.table-heading { gap: 1rem; }

.search-box {
  display: flex;
  width: min(260px, 40%);
  min-height: 40px;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid #dde6e4;
  border-radius: 10px;
  padding: 0 0.65rem;
  color: #7b8986;
  background: #fafbfb;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-carbon);
}

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td {
  border-bottom: 1px solid #edf1f0;
  padding: 0.82rem 0.85rem;
  font-size: 0.78rem;
  text-align: left;
  white-space: nowrap;
}
th { background: #fafbfb; color: #7b8986; font-size: 0.68rem; text-transform: uppercase; }
td strong, td small { display: block; }
td small { margin-top: 0.15rem; color: #84908e; }

.row-actions { display: flex; gap: 0.35rem; }
.icon-action {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  cursor: pointer;
}
.icon-action.approve { border: 1px solid #b9dfc7; background: #edf8f1; color: #27704a; }
.icon-action.deny { border: 1px solid #efc7c4; background: #fff1ef; color: #aa4039; }

.tour-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 0.85rem;
}

.tour-admin-card {
  overflow: hidden;
  border: 1px solid #e5ecea;
  border-radius: 14px;
  background: #fff;
}

.tour-card-cover {
  position: relative;
  height: 150px;
  background-position: center;
  background-size: cover;
}

.tour-state {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  border-radius: 999px;
  padding: 0.22rem 0.48rem;
  background: rgba(255,255,255,.92);
  color: #53615e;
  font-size: 0.62rem;
  font-weight: 900;
}
.tour-state.publicado { color: #27704a; }
.tour-state.inactivo { color: #a4413a; }
.tour-card-actions { position: absolute; right: 0.65rem; bottom: 0.65rem; display: flex; gap: 0.35rem; }
.tour-card-actions button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(255,255,255,.7);
  border-radius: 9px;
  background: rgba(255,255,255,.94);
  color: #4d6562;
  cursor: pointer;
}

.tour-card-body { padding: 0.85rem; }
.tour-card-body > span { color: var(--color-turquesa-cactours); font-size: 0.68rem; font-weight: 800; }
.tour-card-body h3 { margin: 0.15rem 0 0.7rem; color: var(--color-carbon); font-size: 1rem; }
.tour-meta { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 0.4rem; }
.tour-meta small { display: flex; align-items: center; gap: 0.28rem; color: #7b8885; }
.tour-meta strong { grid-column: 2; grid-row: 1; justify-self: end; color: var(--color-turquesa-cactours); }

.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(7, 37, 41, 0.48);
  backdrop-filter: blur(8px);
}

.tour-modal {
  width: min(620px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border-radius: 18px;
  padding: 1.25rem;
  background: #fff;
  box-shadow: 0 24px 70px rgba(3, 31, 34, 0.25);
}

.tour-modal label { display: grid; gap: 0.35rem; margin-top: 0.85rem; color: #53615e; font-size: 0.78rem; font-weight: 800; }
.tour-modal input,
.tour-modal textarea,
.tour-modal select {
  width: 100%;
  border: 1px solid #d8e3e1;
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  background: #fff;
  color: var(--color-carbon);
  resize: vertical;
}

.modal-heading { display: flex; align-items: flex-start; justify-content: space-between; }
.modal-heading button { display: grid; width: 38px; height: 38px; place-items: center; border: 0; border-radius: 50%; background: #f1f4f3; color: #667573; cursor: pointer; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 0.75rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.65rem; margin-top: 1.15rem; }

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tour-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 780px) {
  .admin-shell {
    width: 100%;
    margin: 0;
    grid-template-columns: 1fr;
    border: 0;
    border-radius: 0;
  }
  .admin-sidebar {
    position: sticky;
    z-index: 20;
    top: 84px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    border-bottom: 1px solid #e5ecea;
  }
  .admin-brand { display: none; }
  .admin-nav { grid-template-columns: repeat(3, 1fr); }
  .admin-nav button { justify-content: center; padding-inline: 0.35rem; font-size: 0.72rem; }
  .nav-count { display: none; }
  .switch-role { min-height: 46px; grid-column: 1 / -1; }
  .admin-content { padding: 1rem; }
  .overview-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .tour-grid { grid-template-columns: 1fr; }
  .table-heading { align-items: flex-start; }
  .search-box { width: 48%; }
  .recent-row { grid-template-columns: 38px 1fr auto; }
  .recent-row > strong:last-child { display: none; }
}

@media (max-width: 480px) {
  .admin-header { align-items: flex-end; }
  .stats-grid { grid-template-columns: 1fr; }
  .stat-card { min-height: 105px; }
  .form-grid { grid-template-columns: 1fr; }
  .search-box { width: 50%; }
  .admin-nav button { gap: 0.25rem; }
  .admin-nav button svg { width: 15px; }
}
</style>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CalendarCheck,
  Check,
  Clock3,
  DollarSign,
  LayoutDashboard,
  MapPinned,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-vue-next'
import { adminService } from '@/api/admin.service'

const activeTab = ref('overview')
const loading = ref(true)
const error = ref('')
const stats = reactive({
  reservas: 0,
  pendientes: 0,
  confirmadas: 0,
  ingresos: 0,
  tours: 0,
  tours_publicados: 0,
  clientes: 0,
})
const recentBookings = ref([])
const bookings = ref([])
const tours = ref([])
const bookingSearch = ref('')
const tourSearch = ref('')
const savingBookingId = ref(null)
const savingTour = ref(false)
const tourModalOpen = ref(false)
const editingTour = ref(null)
const tourForm = reactive({
  nombre_tour: '',
  descripcion: '',
  ciudad_destino: '',
  costo: 100000,
  duracion_dias: 1,
  cupo_maximo: 20,
  estado: 'PUBLICADO',
})

const tabTitle = computed(() => ({
  overview: 'Resumen general',
  bookings: 'Solicitudes de viaje',
  tours: 'Planes turísticos',
}[activeTab.value]))

const statusSummary = computed(() => [
  { label: 'Pendientes', value: stats.pendientes, className: 'pending' },
  { label: 'Confirmadas', value: stats.confirmadas, className: 'confirmed' },
  { label: 'Canceladas', value: bookings.value.filter((item) => item.estado === 'CANCELADA').length, className: 'cancelled' },
  { label: 'Completadas', value: bookings.value.filter((item) => item.estado === 'COMPLETADA').length, className: 'completed' },
])

const filteredBookings = computed(() => {
  const term = bookingSearch.value.trim().toLowerCase()
  if (!term) return bookings.value
  return bookings.value.filter((booking) =>
    [
      booking.codigo_reserva,
      booking.cliente?.nombre_completo,
      booking.tour?.nombre_tour,
      booking.destino,
      booking.estado_display,
    ].some((value) => String(value || '').toLowerCase().includes(term)),
  )
})

const filteredTours = computed(() => {
  const term = tourSearch.value.trim().toLowerCase()
  if (!term) return tours.value
  return tours.value.filter((tour) =>
    [tour.nombre_tour, tour.ciudad_destino, tour.estado].some((value) =>
      String(value || '').toLowerCase().includes(term),
    ),
  )
})

onMounted(loadAll)

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [dashboard, toursData, bookingsData] = await Promise.all([
      adminService.getDashboard(),
      adminService.listTours(),
      adminService.listBookings(),
    ])
    Object.assign(stats, dashboard.stats)
    recentBookings.value = dashboard.recientes || []
    tours.value = toursData.results || []
    bookings.value = bookingsData.results || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function setBookingStatus(booking, estado) {
  savingBookingId.value = booking.id
  try {
    const data = await adminService.updateBookingStatus(booking.id, estado)
    const index = bookings.value.findIndex((item) => item.id === booking.id)
    if (index >= 0) bookings.value[index] = data.reserva
    const recentIndex = recentBookings.value.findIndex((item) => item.id === booking.id)
    if (recentIndex >= 0) recentBookings.value[recentIndex] = data.reserva
    await refreshDashboardData()
  } catch (err) {
    error.value = err.message
  } finally {
    savingBookingId.value = null
  }
}

async function refreshDashboardData() {
  const [dashboard, bookingsData] = await Promise.all([
    adminService.getDashboard(),
    adminService.listBookings(),
  ])
  Object.assign(stats, dashboard.stats)
  recentBookings.value = dashboard.recientes || []
  bookings.value = bookingsData.results || []
}

function openCreate() {
  editingTour.value = null
  Object.assign(tourForm, {
    nombre_tour: '',
    descripcion: '',
    ciudad_destino: '',
    costo: 100000,
    duracion_dias: 1,
    cupo_maximo: 20,
    estado: 'PUBLICADO',
  })
  tourModalOpen.value = true
}

function openEdit(tour) {
  editingTour.value = tour
  Object.assign(tourForm, {
    nombre_tour: tour.nombre_tour,
    descripcion: tour.descripcion,
    ciudad_destino: tour.ciudad_destino,
    costo: tour.costo_num,
    duracion_dias: tour.duracion_dias,
    cupo_maximo: tour.cupo_maximo,
    estado: tour.estado,
  })
  tourModalOpen.value = true
}

async function saveTour() {
  savingTour.value = true
  error.value = ''
  try {
    if (editingTour.value) {
      const data = await adminService.updateTour(editingTour.value.id, { ...tourForm })
      const index = tours.value.findIndex((item) => item.id === editingTour.value.id)
      if (index >= 0) tours.value[index] = data.tour
    } else {
      const data = await adminService.createTour({ ...tourForm })
      tours.value.unshift(data.tour)
    }
    tourModalOpen.value = false
    await refreshDashboardData()
  } catch (err) {
    error.value = err.message
  } finally {
    savingTour.value = false
  }
}

async function removeTour(tour) {
  if (!window.confirm(`¿Quitar el plan "${tour.nombre_tour}"?`)) return
  try {
    await adminService.deleteTour(tour.id)
    await loadAll()
  } catch (err) {
    error.value = err.message
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function bookingInitial(booking) {
  const name = booking.cliente?.nombre_completo || 'C'
  return name.trim().charAt(0).toUpperCase()
}

function statusClass(status) {
  return {
    PENDIENTE: 'pending',
    CONFIRMADA: 'confirmed',
    CANCELADA: 'cancelled',
    COMPLETADA: 'completed',
  }[status] || 'pending'
}

function statusWidth(value) {
  const maximum = Math.max(stats.reservas, 1)
  return `${Math.max((value / maximum) * 100, value ? 8 : 0)}%`
}

function coverStyle(tour) {
  const cover = tour.imagen_portada
  return cover
    ? { backgroundImage: `linear-gradient(145deg, rgba(4,38,42,.18), rgba(4,38,42,.82)), url(${cover})` }
    : { backgroundImage: 'linear-gradient(145deg, #79b8bf, #07535d)' }
}
</script>
