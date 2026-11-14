<template>
  <footer id="contacto" class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <RouterLink to="/" class="footer-logo">
          <img :src="logoUrl" alt="Logo Cactours" />
          <span>Cactours</span>
        </RouterLink>
        <p>Experiencias auténticas en La Guajira, Colombia y el Caribe.</p>
      </div>
      <div class="footer-contact">
        <span class="footer-label">Hablemos del viaje</span>
        <a href="mailto:info@cactours.com">info@cactours.com</a>
        <span>La Guajira, Colombia</span>
      </div>
      <div class="footer-explore">
        <span class="footer-label">Explora</span>
        <RouterLink to="/tours">
          Catálogo de tours <ArrowUpRight :size="15" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
    <div class="container footer-copy">
      <p>&copy; {{ new Date().getFullYear() }} Cactours. Todos los derechos reservados.</p>
      <a href="#inicio" class="back-to-top" @click.prevent="scrollToTop">
        Volver arriba <ArrowUpRight :size="14" aria-hidden="true" />
      </a>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from 'lucide-vue-next'

const logoUrl = '/images/logo-cactours.png'

function scrollToTop() {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.scrollTo({ top: 0, behavior })
}
</script>

<style scoped>
.footer {
  background-color: #0b2f34;
  color: var(--color-blanco);
  padding: 3.5rem 0 1.4rem;
}

.footer-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(170px, 0.8fr) minmax(160px, 0.6fr);
  justify-content: space-between;
  gap: 3rem;
}

.footer-brand {
  max-width: 350px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--color-blanco);
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 800;
  text-decoration: none;
}

.footer-logo img {
  width: 52px;
  height: 52px;
  min-width: 52px;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
}

.footer-brand p {
  max-width: 320px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.7;
}

.footer-contact,
.footer-explore {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.55rem;
  font-size: 0.82rem;
}

.footer-label {
  margin-bottom: 0.35rem;
  color: #a9d8d1;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.footer-contact a,
.footer-explore a,
.back-to-top {
  color: var(--color-blanco);
  text-decoration: none;
}

.footer-contact span:last-child {
  color: rgba(255, 255, 255, 0.7);
}

.footer-explore a,
.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.footer a:hover {
  color: #a9d8d1;
}

.footer-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: 2.5rem;
  padding-top: 1.2rem;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.72rem;
}

.footer-copy p {
  margin: 0;
}

.back-to-top {
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 700px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 2rem 1rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 420px) {
  .footer-copy {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
