<template>
  <section class="auth-shell container mx-auto">
    <aside ref="storyElement" class="auth-story spotlight-card" aria-label="Inspiración para tu próximo viaje">
      <img
        class="auth-story-image"
        :src="featuredSanAndresImage"
        alt=""
        aria-hidden="true"
      />
      <div class="auth-story-overlay" aria-hidden="true"></div>
      <div class="auth-story-content">
        <div class="auth-story-top">
          <RouterLink class="auth-story-brand" to="/" aria-label="Cactours, ir al inicio">
            <img :src="logoUrl" alt="" />
            <span>
              CACTOURS
              <small>VIAJES CON RAÍZ</small>
            </span>
          </RouterLink>
          <span class="auth-story-edition">
            <span class="auth-live-dot"></span>
            DIARIO DE RUTA · COLOMBIA
          </span>
        </div>

        <div class="auth-story-copy">
          <p class="auth-story-kicker"><MapPin :size="14" aria-hidden="true" /> ISLA DE SAN ANDRÉS</p>
          <h2>Vuelve a sentir<br /><em>lo extraordinario.</em></h2>
          <p>El mar cambia de color. La rutina, de perspectiva. Tu próxima historia está más cerca de lo que imaginas.</p>
        </div>

        <div class="auth-story-bottom">
          <div class="auth-destination-card spotlight-card spotlight-card--flat">
            <img :src="featuredSanAndresImage" alt="" />
            <span class="auth-destination-copy">
              <small>DESTINO DESTACADO</small>
              <strong>San Andrés</strong>
              <span>12°35′ N · Caribe colombiano</span>
            </span>
            <span class="auth-destination-mark"><ArrowUpRight :size="18" aria-hidden="true" /></span>
          </div>
          <div class="auth-story-footer">
            <span><strong>07</strong> destinos para descubrir</span>
            <span class="auth-route-line" aria-hidden="true"><i></i><i></i><i></i></span>
            <RouterLink to="/tours" class="magnetic-button">
              Explorar rutas <ArrowUpRight :size="14" aria-hidden="true" />
            </RouterLink>
          </div>
        </div>
      </div>
    </aside>

    <div class="auth-panel">
      <div class="auth-panel-top">
        <span class="auth-panel-label"><Compass :size="15" aria-hidden="true" /> TU ESPACIO CACTOURS</span>
        <RouterLink to="/tours" class="auth-explore-link magnetic-button">
          Ver destinos <ArrowUpRight :size="15" aria-hidden="true" />
        </RouterLink>
      </div>

      <div ref="formElement" class="auth-form-card spotlight-card spotlight-card--flat">
        <div class="auth-card-emblem" aria-hidden="true">
          <Compass :size="21" :stroke-width="1.7" />
        </div>
        <p class="auth-eyebrow"><span></span>{{ eyebrow }}</p>
        <h1>{{ title }}<span class="auth-title-period">.</span></h1>
        <p class="auth-description">{{ description }}</p>
        <slot />
        <div class="auth-card-note">
          <ShieldCheck :size="16" aria-hidden="true" />
          <span>Tu espacio para organizar la próxima aventura.</span>
        </div>
      </div>

      <p class="auth-panel-footnote">HECHO PARA VIAJAR SIN PRISA <span>·</span> LA GUAJIRA, COLOMBIA</p>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowUpRight, Compass, MapPin, ShieldCheck } from 'lucide-vue-next'
import { gsap } from 'gsap'
import { featuredSanAndresImage } from '@/data/tourMedia'

defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const storyElement = ref(null)
const formElement = ref(null)
const logoUrl = '/images/logo-cactours.png'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.fromTo(
    [storyElement.value, formElement.value],
    { y: 18 },
    { y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out' },
  )
})

onBeforeUnmount(() => {
  gsap.killTweensOf([storyElement.value, formElement.value])
})
</script>

<style scoped>
.auth-shell {
  display: grid;
  max-width: 1440px;
  min-height: min(800px, calc(100vh - 7rem));
  align-items: stretch;
  grid-template-columns: minmax(0, 1.04fr) minmax(420px, 0.96fr);
  gap: clamp(1.5rem, 4vw, 4.5rem);
  padding-top: clamp(1.25rem, 3.5vw, 3rem);
  padding-bottom: clamp(1.25rem, 3.5vw, 3rem);
}

.auth-story {
  position: relative;
  min-height: 670px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 30px;
  background: #0c3439;
  box-shadow: 0 30px 80px rgba(2, 44, 49, 0.18);
  isolation: isolate;
}

.auth-story-image {
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  height: min(68%, 450px);
  object-fit: cover;
  object-position: center 42%;
  z-index: -2;
}

.auth-story-overlay {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(5, 28, 31, 0.14), rgba(5, 28, 31, 0.2) 28%, rgba(5, 28, 31, 0.76) 54%, #0c3439 78%),
    linear-gradient(90deg, rgba(5, 28, 31, 0.26), transparent 88%),
    radial-gradient(ellipse at 22% 78%, rgba(2, 99, 116, 0.42), transparent 58%);
}

.auth-story-content {
  position: relative;
  display: flex;
  min-height: inherit;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.5rem, 3.6vw, 3rem);
  color: var(--color-blanco);
}

.auth-story-content::after {
  position: absolute;
  top: 43%;
  right: -0.5rem;
  z-index: -1;
  color: rgba(255, 255, 255, 0.075);
  content: "12°";
  font-family: var(--font-heading);
  font-size: clamp(6rem, 12vw, 10rem);
  font-weight: 800;
  letter-spacing: -0.1em;
  line-height: 1;
  pointer-events: none;
}

.auth-story-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.auth-story-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  align-self: flex-start;
  color: var(--color-blanco);
  text-decoration: none;
}

.auth-story-brand img {
  width: 46px;
  height: 46px;
  min-width: 46px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.13);
}

.auth-story-brand > span {
  display: grid;
  gap: 0.13rem;
  font-family: var(--font-heading);
  font-size: 0.83rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.auth-story-brand small {
  color: rgba(255, 255, 255, 0.74);
  font-family: var(--font-body);
  font-size: 0.53rem;
  font-weight: 700;
  letter-spacing: 0.17em;
}

.auth-story-edition {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.auth-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #b7e5df;
  box-shadow: 0 0 0 4px rgba(183, 229, 223, 0.15);
}

.auth-story-copy {
  max-width: 500px;
  margin: auto 0;
  padding: 2rem 0;
}

.auth-story-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  color: #c3ebe2;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.auth-story-copy h2 {
  margin: 0;
  color: var(--color-blanco);
  font-size: clamp(2.7rem, 5vw, 4.7rem);
  letter-spacing: -0.075em;
  line-height: 0.99;
}

.auth-story-copy h2 em {
  color: #c3ebe2;
  font-family: var(--font-editorial);
  font-size: 1.11em;
  font-weight: 500;
  letter-spacing: -0.055em;
}

.auth-story-copy > p:not(.auth-story-kicker) {
  max-width: 385px;
  margin: 1.25rem 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.88rem;
  line-height: 1.75;
}

.auth-story-bottom {
  display: grid;
  gap: 1rem;
}

.auth-destination-card {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  width: min(100%, 340px);
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 17px;
  padding: 0.55rem;
  background: rgba(5, 28, 31, 0.38);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16), inset 0 1px rgba(255, 255, 255, 0.12);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.auth-destination-card > img {
  width: 66px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 12px;
  object-fit: cover;
  object-position: center;
}

.auth-destination-copy {
  display: grid;
  gap: 0.12rem;
  min-width: 0;
}

.auth-destination-copy small {
  color: #b7e5df;
  font-size: 0.53rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.auth-destination-copy strong {
  color: var(--color-blanco);
  font-family: var(--font-heading);
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}

.auth-destination-copy > span {
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.64rem;
}

.auth-destination-mark {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  color: var(--color-blanco);
}

.auth-story-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.auth-story-footer strong {
  margin-right: 0.28rem;
  color: var(--color-blanco);
  font-size: 0.85rem;
}

.auth-route-line {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin: 0 auto;
}

.auth-route-line i {
  width: 4px;
  height: 4px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.auth-route-line i:nth-child(2) {
  width: 34px;
  height: 1px;
  border: 0;
  background: rgba(255, 255, 255, 0.62);
}

.auth-story-footer a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-blanco);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0;
  text-decoration: none;
}

.auth-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: clamp(0rem, 2vw, 1.5rem);
}

.auth-panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 520px;
  width: 100%;
  margin: 0 auto 1.35rem;
  padding: 0 0.3rem;
}

.auth-panel-label,
.auth-explore-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.auth-panel-label {
  color: var(--color-turquesa-cactours);
}

.auth-explore-link {
  color: var(--color-muted);
  letter-spacing: 0;
  text-decoration: none;
}

.auth-explore-link:hover,
.auth-story-footer a:hover {
  color: var(--color-azul-brillante);
}

.auth-form-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(2, 99, 116, 0.1);
  border-radius: 25px;
  padding: clamp(1.65rem, 4vw, 3rem);
  background:
    radial-gradient(circle at 100% 0, rgba(6, 155, 224, 0.065), transparent 15rem),
    var(--color-blanco);
  box-shadow: 0 30px 80px rgba(2, 44, 49, 0.11), 0 4px 14px rgba(2, 44, 49, 0.035);
}

.auth-form-card::after {
  position: absolute;
  top: 0;
  right: 2.5rem;
  left: 2.5rem;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-azul-brillante), #b7e5df, transparent);
  content: "";
}

.auth-card-emblem {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  margin-bottom: 1.45rem;
  border: 1px solid rgba(2, 99, 116, 0.11);
  border-radius: 15px;
  background: linear-gradient(145deg, #f3fbfa, #e5f4f3);
  color: var(--color-turquesa-cactours);
  box-shadow: 0 8px 18px rgba(2, 99, 116, 0.08);
}

.auth-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.55rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.auth-eyebrow span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-azul-brillante);
  box-shadow: 0 0 0 4px rgba(6, 155, 224, 0.12);
}

.auth-form-card h1 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(2.15rem, 3vw, 2.85rem);
  letter-spacing: -0.065em;
  line-height: 1.08;
}

.auth-title-period {
  color: var(--color-azul-brillante);
}

.auth-description {
  max-width: 370px;
  margin: 0.85rem 0 1.75rem;
  color: var(--color-muted);
  font-size: 0.87rem;
  line-height: 1.75;
}

.auth-card-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 1.3rem;
  color: #64736f;
  font-size: 0.66rem;
}

.auth-card-note svg {
  color: var(--color-turquesa-cactours);
}

.auth-panel-footnote {
  margin: 1.3rem auto 0;
  color: #7a8581;
  font-size: 0.54rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-align: center;
}

.auth-panel-footnote span {
  padding: 0 0.35rem;
  color: var(--color-azul-brillante);
}

@media (max-width: 900px) {
  .auth-shell {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .auth-story {
    min-height: 400px;
  }

  .auth-story-image {
    height: min(68%, 450px);
  }

  .auth-story-content {
    padding: clamp(1.4rem, 4vw, 2.3rem);
  }

  .auth-story-copy {
    padding: 1.35rem 0;
  }

  .auth-story-copy h2 {
    font-size: clamp(2.7rem, 7vw, 4rem);
  }

  .auth-panel {
    position: relative;
    z-index: 1;
    margin-top: -1.5rem;
    padding: 0 clamp(0.75rem, 5vw, 2.75rem);
  }

  .auth-panel-top {
    display: none;
  }

  .auth-form-card {
    max-width: 580px;
  }

  .auth-panel-footnote {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 700px) {
  .auth-shell {
    padding-top: 0.85rem;
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .auth-story {
    min-height: 330px;
    height: clamp(330px, 90vw, 390px);
    border-radius: 24px;
  }

  .auth-story-content {
    padding: 1.2rem;
  }

  .auth-story-brand img {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .auth-story-brand > span {
    font-size: 0.7rem;
  }

  .auth-story-brand small {
    font-size: 0.45rem;
  }

  .auth-story-edition {
    font-size: 0.46rem;
    letter-spacing: 0.07em;
  }

  .auth-story-copy {
    margin: 0;
    padding: 0.65rem 0;
  }

  .auth-story-copy h2 {
    font-size: clamp(2.25rem, 10vw, 3.3rem);
  }

  .auth-story-copy > p:not(.auth-story-kicker) {
    max-width: 340px;
    margin-top: 0.6rem;
    font-size: 0.74rem;
  }

  .auth-story-kicker {
    margin-bottom: 0.55rem;
    font-size: 0.56rem;
  }

  .auth-story-footer {
    gap: 0.45rem;
    font-size: 0.48rem;
  }

  .auth-story-footer a {
    font-size: 0.58rem;
  }

  .auth-route-line {
    gap: 0.12rem;
  }

  .auth-route-line i:nth-child(2) {
    width: 16px;
  }

  .auth-destination-card {
    width: min(100%, 310px);
    gap: 0.6rem;
  }

  .auth-destination-card > img {
    width: 52px;
    height: 50px;
  }

  .auth-destination-copy small {
    font-size: 0.47rem;
  }

  .auth-destination-copy strong {
    font-size: 0.8rem;
  }

  .auth-destination-copy > span {
    font-size: 0.56rem;
  }

  .auth-destination-mark {
    width: 29px;
    height: 29px;
  }

  .auth-panel {
    margin-top: -1.15rem;
    padding: 0 0.2rem 1rem;
  }

  .auth-form-card {
    border-radius: 21px;
    padding: 1.5rem 1.25rem;
  }

  .auth-card-emblem {
    width: 40px;
    height: 40px;
    margin-bottom: 1.1rem;
    border-radius: 13px;
  }

  .auth-form-card h1 {
    font-size: 2.1rem;
  }

  .auth-description {
    margin-bottom: 1.35rem;
    font-size: 0.82rem;
  }

  .auth-panel-footnote {
    font-size: 0.46rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-story-image {
    transform: none;
  }
}
</style>
