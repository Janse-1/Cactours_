<template>
  <div class="home-page">
    <section id="inicio" class="hero" aria-labelledby="hero-title">
      <video
        class="hero-video"
        :autoplay="!prefersReducedMotion"
        muted
        loop
        playsinline
        :preload="prefersReducedMotion ? 'none' : 'metadata'"
        :poster="featuredImage"
        aria-hidden="true"
      >
        <source src="/images/video/video4.mp4" type="video/mp4" />
      </video>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>

      <div class="container hero-layout">
        <div class="hero-copy">
          <p class="hero-eyebrow">
            <span class="eyebrow-line"></span>
            Viajes con raíz <span aria-hidden="true">·</span> Colombia
          </p>
          <h1 id="hero-title">
            <span>Hay lugares que</span>
            <span><em>te cambian</em> la forma</span>
            <span>de mirar.</span>
          </h1>
          <p class="hero-lead">
            Desierto, mar y cultura viva. Recorre Colombia con quienes conocen el territorio de
            verdad.
          </p>
          <div class="hero-actions">
            <a href="#territorios" class="hero-button hero-button--light">
              Explorar el atlas 3D
              <ArrowUpRight :size="18" aria-hidden="true" />
            </a>
            <RouterLink to="/tours" class="hero-button hero-button--quiet">
              Ver catálogo
              <ArrowUpRight :size="16" aria-hidden="true" />
            </RouterLink>
          </div>
          <div class="hero-signature">
            <span class="signature-mark" aria-hidden="true"><Compass :size="17" /></span>
            <span>El norte de Colombia, a tu propio ritmo</span>
          </div>
        </div>

        <aside
          class="hero-scene"
          :aria-label="`Destino destacado: ${activeDestination.name}`"
          @pointerenter="isPointerWithinScene = true"
          @pointerleave="isPointerWithinScene = false"
          @focusin="hasSceneFocus = true"
          @focusout="handleSceneFocusOut"
        >
          <div class="scene-orbit scene-orbit--outer" aria-hidden="true"></div>
          <div class="scene-orbit scene-orbit--inner" aria-hidden="true"></div>
          <div class="scene-spark scene-spark--one" aria-hidden="true"></div>
          <div class="scene-spark scene-spark--two" aria-hidden="true"></div>

          <article
            class="destination-card"
            :style="{
              '--tilt-x': `${cardTilt.x}deg`,
              '--tilt-y': `${cardTilt.y}deg`,
            }"
            @pointermove="moveCard"
            @pointerleave="resetCard"
          >
            <img
              :key="activeDestination.id"
              class="destination-card__image"
              :src="featuredImage"
              alt=""
              fetchpriority="high"
            />
            <div class="destination-card__veil" aria-hidden="true"></div>
            <div class="destination-card__topline">
              <span>Territorio destacado</span>
              <span class="card-number">
                {{ String(activeDestinationIndex + 1).padStart(2, '0') }}
                <i>/ {{ String(featuredDestinations.length).padStart(2, '0') }}</i>
              </span>
            </div>
            <div class="destination-card__bottom">
              <span class="destination-card__region">
                <MapPin :size="14" aria-hidden="true" />
                {{ activeDestination.destination }}
              </span>
              <h2>{{ activeDestination.name }}</h2>
              <span class="destination-card__story">{{ activeDestination.description }}</span>
            </div>
            <span class="destination-card__seal" aria-hidden="true">
              <Compass :size="19" />
              <span>RUTA<br />CACTOURS</span>
            </span>
          </article>

          <div class="scene-caption" role="group" aria-label="Cambiar destino destacado">
            <button
              type="button"
              class="scene-control"
              aria-label="Destino anterior"
              @click="showPreviousDestination"
            >
              <ArrowLeft :size="14" aria-hidden="true" />
            </button>
            <span class="caption-dot"></span>
            <span class="scene-caption__text">{{ activeDestination.category }}</span>
            <button
              type="button"
              class="scene-control"
              aria-label="Siguiente destino"
              @click="showNextDestination"
            >
              <ArrowRight :size="14" aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      <div class="container hero-bottom">
        <a href="#territorios" class="scroll-cue">
          <span class="scroll-cue__icon"><ArrowDown :size="15" aria-hidden="true" /></span>
          <span>Desliza para explorar</span>
        </a>
        <p class="hero-route-line">
          <span>{{ activeDestination.category }}</span>
          <span class="route-line" aria-hidden="true"></span>
          <span>{{ activeDestination.destination }}</span>
        </p>
      </div>
      <span class="hero-index" aria-hidden="true">
        {{ String(activeDestinationIndex + 1).padStart(2, '0') }} —
        {{ String(featuredDestinations.length).padStart(2, '0') }}
      </span>
    </section>

    <TourShowroom :tours="toursStore.tours" :error="toursStore.catalogError" />

    <section class="manifesto-section" aria-labelledby="manifesto-title">
      <div class="container manifesto-inner">
        <div class="manifesto-copy">
          <p class="manifesto-index">
            <span class="manifesto-index-number">01</span>
            Una forma distinta de viajar
          </p>
          <h2 id="manifesto-title" class="manifesto-quote">
            No colecciones<br />destinos.
            <em>Déjalos quedarse<br />contigo.</em>
          </h2>
          <p class="manifesto-note">
            Hay lugares que no solo visitas: te cambian la mirada y se quedan en tu historia.
          </p>
          <RouterLink to="/tours" class="manifesto-link">
            <span>Encuentra tu próxima historia</span>
            <span class="manifesto-link-icon"><ArrowUpRight :size="17" aria-hidden="true" /></span>
          </RouterLink>
        </div>

        <div class="manifesto-gallery" role="group" aria-label="Postales de destinos Cactours">
          <div class="manifesto-orbit" aria-hidden="true"></div>
          <figure
            v-for="(destination, index) in manifestoDestinations"
            :key="destination.id"
            class="manifesto-photo"
            :class="`manifesto-photo--${index + 1}`"
          >
            <img
              :src="destination.gallery[0].url"
              :alt="destination.gallery[0].alt"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>{{ destination.destination }}</span>
              <strong>{{ destination.name }}</strong>
            </figcaption>
          </figure>
          <div class="manifesto-stamp" aria-hidden="true">
            <Compass :size="21" />
            <span>VIAJA<br />SIN PRISA</span>
          </div>
          <p class="manifesto-coordinate">
            <span></span>
            12°35' N · CARIBE COLOMBIANO
          </p>
        </div>
      </div>
      <div class="manifesto-decoration" aria-hidden="true">C</div>
    </section>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Compass, MapPin } from 'lucide-vue-next'
import { useToursStore } from '@/stores/tours.store'
import { tourMediaShowcases } from '@/data/tourMedia'

const toursStore = useToursStore()
const cardTilt = ref({ x: 0, y: 0 })
const firstDestination = tourMediaShowcases.find((destination) => destination.id === 'san-andres')
const featuredDestinations = [
  ...(firstDestination ? [firstDestination] : []),
  ...tourMediaShowcases.filter((destination) => destination.id !== 'san-andres'),
].filter((destination) => destination.gallery[0]?.url)
const activeDestinationIndex = ref(0)
const activeDestination = computed(
  () => featuredDestinations[activeDestinationIndex.value] || featuredDestinations[0],
)
const featuredImage = computed(() => activeDestination.value?.gallery[0]?.url || '')
const manifestoDestinations = ['san-andres', 'cabo-de-la-vela', 'punta-cana']
  .map((id) => tourMediaShowcases.find((destination) => destination.id === id))
  .filter(Boolean)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isPointerWithinScene = ref(false)
const hasSceneFocus = ref(false)
const TourShowroom = defineAsyncComponent(() => import('@/components/tours/TourShowroom.vue'))
let featuredRotationInterval

function selectFeaturedDestination(index) {
  const count = featuredDestinations.length
  if (!count) return
  activeDestinationIndex.value = (index + count) % count
  resetCard()
}

function showPreviousDestination() {
  selectFeaturedDestination(activeDestinationIndex.value - 1)
}

function showNextDestination() {
  selectFeaturedDestination(activeDestinationIndex.value + 1)
}

function handleSceneFocusOut(event) {
  hasSceneFocus.value = event.currentTarget.contains(event.relatedTarget)
}

function moveCard(event) {
  if (event.pointerType !== 'mouse') return

  const bounds = event.currentTarget.getBoundingClientRect()
  const horizontal = (event.clientX - bounds.left) / bounds.width
  const vertical = (event.clientY - bounds.top) / bounds.height

  cardTilt.value = {
    x: (0.5 - vertical) * 8,
    y: (horizontal - 0.5) * 10,
  }
}

function resetCard() {
  cardTilt.value = { x: 0, y: 0 }
}

onMounted(() => {
  toursStore.fetchTours()
  if (!prefersReducedMotion && featuredDestinations.length > 1) {
    featuredRotationInterval = window.setInterval(() => {
      if (!document.hidden && !isPointerWithinScene.value && !hasSceneFocus.value) {
        showNextDestination()
      }
    }, 6500)
  }
})

onBeforeUnmount(() => {
  if (featuredRotationInterval) window.clearInterval(featuredRotationInterval)
})
</script>

<style scoped>
.home-page {
  overflow: clip;
}

.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: max(760px, 100svh);
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: #102a2b;
  color: var(--color-blanco);
}

.hero-video,
.hero-shade,
.hero-grain {
  position: absolute;
  z-index: -1;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-video {
  object-fit: cover;
  object-position: center 52%;
  transform: scale(1.025);
}

.hero-shade {
  background:
    linear-gradient(90deg, rgba(7, 27, 29, 0.86) 0%, rgba(7, 29, 31, 0.68) 43%, rgba(9, 36, 39, 0.2) 100%),
    linear-gradient(0deg, rgba(5, 23, 24, 0.64), transparent 30%, rgba(5, 23, 24, 0.16));
}

.hero-grain {
  opacity: 0.2;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(300px, 0.72fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5.5rem);
  padding-top: 7.25rem;
  padding-bottom: 4rem;
}

.hero-copy {
  max-width: 720px;
  animation: rise-in 900ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
}

.hero-eyebrow,
.section-kicker,
.manifesto-index {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0 0 1.7rem;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  line-height: 1.4;
  text-transform: uppercase;
}

.eyebrow-line {
  width: 34px;
  height: 1px;
  background: var(--color-azul-brillante);
}

.hero-copy h1 {
  max-width: 900px;
  margin: 0;
  color: var(--color-blanco);
  font-size: clamp(3.2rem, 5.5vw, 5.7rem);
  font-weight: 600;
  letter-spacing: -0.075em;
  line-height: 0.97;
}

.hero-copy h1 > span {
  display: block;
}

.hero-copy h1 em,
.section-heading h2 em,
.manifesto-quote em {
  color: #a9d8d1;
  font-family: var(--font-editorial);
  font-weight: 500;
  letter-spacing: -0.065em;
}

.hero-copy h1 em {
  font-size: 1.04em;
}

.hero-lead {
  max-width: 500px;
  margin: 1.8rem 0 2rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(1rem, 1.3vw, 1.12rem);
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
}

.hero-button {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.8rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.hero-button:hover {
  transform: translateY(-2px);
}

.hero-button--light {
  background: var(--color-azul-brillante);
  color: var(--color-carbon);
}

.hero-button--light:hover {
  background: #42b6ea;
}

.hero-button--quiet {
  color: var(--color-blanco);
}

.hero-button--quiet:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.1);
}

.hero-signature {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 3.2rem;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 0.4rem 0.8rem 0.4rem 0.4rem;
  background: rgba(5, 28, 31, 0.25);
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.78rem;
  letter-spacing: 0.015em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  -webkit-backdrop-filter: blur(14px) saturate(155%);
  backdrop-filter: blur(14px) saturate(155%);
}

.signature-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 50%;
  color: #a9d8d1;
}

.hero-scene {
  position: relative;
  display: grid;
  min-height: 480px;
  place-items: center;
  perspective: 1200px;
  animation: scene-in 1.1s 120ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
}

.destination-card {
  position: relative;
  width: min(100%, 350px);
  aspect-ratio: 0.82;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 210px 210px 30px 30px;
  background: #325958;
  box-shadow:
    0 42px 100px rgba(2, 18, 19, 0.52),
    0 0 0 8px rgba(255, 255, 255, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) rotateZ(-3deg);
  transform-style: preserve-3d;
  transition: transform 450ms cubic-bezier(0.2, 0.75, 0.25, 1);
  will-change: transform;
}

.destination-card__image,
.destination-card__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.destination-card__image {
  inset: 0 0 auto;
  height: 46%;
  object-fit: cover;
  transform: translateZ(-1px);
  transition: transform 900ms var(--motion-glide);
  animation: destination-reveal 650ms var(--motion-glide) both;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .destination-card:hover .destination-card__image {
    transform: scale(1.025) translateZ(-1px);
  }
}

.destination-card__veil {
  background:
    linear-gradient(180deg, rgba(8, 24, 25, 0.38), transparent 24%),
    linear-gradient(180deg, transparent 25%, rgba(8, 25, 27, 0.58) 39%, #08191b 48%, #08191b 100%);
}

.destination-card__topline,
.destination-card__bottom {
  position: absolute;
  right: 1.35rem;
  left: 1.35rem;
  z-index: 1;
}

.destination-card__topline {
  top: 2.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.54);
  padding: 0 0 0.72rem;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transform: translateZ(24px);
}

.destination-card__topline > span:first-child::before {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 0.55rem;
  border-radius: 50%;
  background: #a9d8d1;
  box-shadow: 0 0 14px rgba(169, 216, 209, 0.8);
  content: '';
}

.card-number {
  color: var(--color-blanco);
  font-variant-numeric: tabular-nums;
}

.card-number i {
  color: rgba(255, 255, 255, 0.58);
  font-style: normal;
}

.destination-card__bottom {
  bottom: 1.7rem;
  transform: translateZ(34px);
}

.destination-card__region {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.7rem;
}

.destination-card__bottom h2 {
  margin: 0.45rem 0 0.35rem;
  color: var(--color-blanco);
  font-size: clamp(2.35rem, 4vw, 3.45rem);
  font-weight: 600;
  letter-spacing: -0.075em;
  line-height: 0.96;
}

.destination-card__story {
  display: -webkit-box;
  max-width: 17rem;
  min-height: 2.2em;
  margin-bottom: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-family: var(--font-editorial);
  font-size: 1.02rem;
  font-style: italic;
  line-height: 1.1;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.destination-card__seal {
  position: absolute;
  z-index: 2;
  right: 0.85rem;
  bottom: 32%;
  display: grid;
  width: 76px;
  height: 76px;
  align-content: center;
  justify-items: center;
  gap: 0.15rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  border-radius: 50%;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(2, 99, 116, 0.68)),
    rgba(2, 99, 116, 0.74);
  color: var(--color-blanco);
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1.2;
  text-align: center;
  transform: translateZ(56px);
  box-shadow:
    0 12px 28px rgba(3, 30, 34, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.48);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
  backdrop-filter: blur(18px) saturate(165%);
  transition:
    box-shadow 280ms ease,
    transform 420ms var(--motion-glide);
}

.destination-card__seal:hover {
  box-shadow:
    0 16px 36px rgba(3, 30, 34, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.58);
  transform: translateZ(56px) rotate(8deg) scale(1.06);
}

.scene-orbit {
  position: absolute;
  border: 1px solid rgba(191, 226, 217, 0.24);
  border-radius: 50%;
  transform: rotateX(68deg) rotateZ(-23deg);
}

.scene-orbit--outer {
  width: 520px;
  height: 520px;
}

.scene-orbit--inner {
  width: 430px;
  height: 430px;
  border-style: dashed;
  opacity: 0.65;
  transform: rotateX(68deg) rotateZ(20deg);
}

.scene-spark {
  position: absolute;
  z-index: 3;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #b6e3d4;
  box-shadow: 0 0 22px 4px rgba(182, 227, 212, 0.48);
}

.scene-spark--one {
  top: 14%;
  right: 14%;
}

.scene-spark--two {
  bottom: 17%;
  left: 9%;
  width: 4px;
  height: 4px;
}

.scene-caption {
  position: absolute;
  right: 0;
  bottom: -1.5rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  padding: 0.5rem 0.75rem;
  background: rgba(4, 25, 28, 0.34);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.63rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  backdrop-filter: blur(16px) saturate(160%);
}

.scene-caption__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-control {
  display: grid;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-blanco);
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease;
}

.scene-control:hover {
  background: var(--color-blanco);
  color: var(--color-turquesa-cactours);
}

.caption-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-azul-brillante);
  box-shadow: 0 0 12px rgba(6, 155, 224, 0.8);
}

.hero-bottom {
  position: absolute;
  right: 0;
  bottom: 2.2rem;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scroll-cue,
.hero-route-line {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.scroll-cue__icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 50%;
}

.hero-route-line {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.61rem;
}

.route-line {
  width: 58px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

.hero-index {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  writing-mode: vertical-rl;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.manifesto-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 77% 52%, rgba(2, 99, 116, 0.25), transparent 38%),
    linear-gradient(125deg, #0d3439 0%, #0b2f34 58%, #08282d 100%);
  color: var(--color-blanco);
}

.manifesto-section::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(rgba(183, 229, 223, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(183, 229, 223, 0.035) 1px, transparent 1px);
  background-size: 72px 72px;
  content: '';
  mask-image: linear-gradient(90deg, transparent 34%, #000 100%);
  pointer-events: none;
}

.manifesto-inner {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 690px;
  grid-template-columns: minmax(0, 1.04fr) minmax(390px, 0.96fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5.5rem);
  padding-top: clamp(4.5rem, 8vw, 7rem);
  padding-bottom: clamp(4.5rem, 8vw, 7rem);
}

.manifesto-copy {
  position: relative;
  z-index: 2;
  max-width: 720px;
}

.manifesto-index {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 0 1.8rem;
  color: #a9d8d1;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.manifesto-index-number {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(183, 229, 223, 0.44);
  border-radius: 50%;
  color: var(--color-blanco);
  font-size: 0.58rem;
  letter-spacing: 0.04em;
}

.manifesto-quote {
  max-width: 720px;
  margin: 0;
  color: var(--color-blanco);
  font-family: var(--font-heading);
  font-size: clamp(3rem, 5.2vw, 5.45rem);
  font-weight: 500;
  letter-spacing: -0.082em;
  line-height: 0.94;
}

.manifesto-quote em {
  display: block;
  margin-top: 0.12em;
  color: #a9d8d1;
  font-family: var(--font-editorial);
  font-size: 1.06em;
  font-weight: 500;
  letter-spacing: -0.065em;
  line-height: 0.9;
}

.manifesto-note {
  max-width: 430px;
  margin: 1.6rem 0 1.8rem;
  color: rgba(245, 249, 246, 0.72);
  font-size: 0.92rem;
  line-height: 1.75;
}

.manifesto-link {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  gap: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 0.45rem 0.5rem 0.45rem 1.15rem;
  background: rgba(255, 255, 255, 0.07);
  color: var(--color-blanco);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 220ms ease,
    border-color 220ms ease,
    transform 220ms ease;
}

.manifesto-link:hover {
  border-color: rgba(183, 229, 223, 0.65);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.manifesto-link-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: #a9d8d1;
  color: #0b2f34;
  transition: transform 220ms ease;
}

.manifesto-link:hover .manifesto-link-icon {
  transform: rotate(45deg);
}

.manifesto-gallery {
  position: relative;
  width: 100%;
  max-width: 570px;
  height: clamp(410px, 43vw, 560px);
  justify-self: end;
}

.manifesto-orbit {
  position: absolute;
  inset: 9% 7%;
  border: 1px solid rgba(183, 229, 223, 0.18);
  border-radius: 50%;
  transform: rotate(-24deg) scaleX(0.82);
}

.manifesto-orbit::before,
.manifesto-orbit::after {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid #a9d8d1;
  border-radius: 50%;
  background: #0d3439;
  content: '';
}

.manifesto-orbit::before {
  top: 13%;
  left: 16%;
}

.manifesto-orbit::after {
  right: 12%;
  bottom: 17%;
}

.manifesto-photo {
  position: absolute;
  overflow: hidden;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.78);
  padding: 7px;
  background: rgba(247, 245, 235, 0.92);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.28);
  transition:
    box-shadow 260ms ease,
    scale 260ms ease;
  animation: manifesto-drift 7s ease-in-out infinite;
}

.manifesto-photo:hover {
  z-index: 5;
  box-shadow: 0 34px 86px rgba(0, 0, 0, 0.4);
  scale: 1.035;
}

.manifesto-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.manifesto-photo:hover img {
  transform: scale(1.055);
}

.manifesto-photo figcaption {
  position: absolute;
  right: 7px;
  bottom: 7px;
  left: 7px;
  display: grid;
  gap: 0.18rem;
  padding: 2.2rem 0.85rem 0.8rem;
  background: linear-gradient(transparent, rgba(5, 28, 31, 0.82));
  color: var(--color-blanco);
}

.manifesto-photo figcaption span {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.48rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.manifesto-photo figcaption strong {
  font-family: var(--font-editorial);
  font-size: 1.24rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.manifesto-photo--1 {
  z-index: 2;
  top: 50%;
  left: 50%;
  width: 58%;
  aspect-ratio: 0.76;
  border-radius: 48% 48% 14px 14px;
  transform: translate(-50%, -50%) rotate(2deg);
}

.manifesto-photo--1 img {
  border-radius: 45% 45% 8px 8px;
}

.manifesto-photo--2 {
  z-index: 3;
  top: 12%;
  left: 2%;
  width: 34%;
  aspect-ratio: 0.8;
  border-radius: 46% 46% 12px 12px;
  transform: rotate(-9deg);
  animation-delay: -2.3s;
}

.manifesto-photo--2 img {
  border-radius: 44% 44% 7px 7px;
}

.manifesto-photo--3 {
  z-index: 3;
  right: 1%;
  bottom: 9%;
  width: 33%;
  aspect-ratio: 0.82;
  border-radius: 46% 46% 12px 12px;
  transform: rotate(8deg);
  animation-delay: -4.5s;
}

.manifesto-photo--3 img {
  border-radius: 44% 44% 7px 7px;
}

.manifesto-stamp {
  position: absolute;
  z-index: 4;
  top: 3%;
  right: 2%;
  display: grid;
  width: 94px;
  height: 94px;
  align-content: center;
  justify-items: center;
  gap: 0.28rem;
  border: 1px solid rgba(183, 229, 223, 0.52);
  border-radius: 50%;
  background: rgba(8, 40, 45, 0.74);
  color: #c3eee7;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-align: center;
  backdrop-filter: blur(12px);
}

.manifesto-coordinate {
  position: absolute;
  bottom: 4%;
  left: 3%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.53rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.manifesto-coordinate span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a9d8d1;
  box-shadow: 0 0 12px rgba(169, 216, 209, 0.8);
}

.manifesto-decoration {
  position: absolute;
  z-index: 0;
  top: -0.58em;
  right: -0.03em;
  color: rgba(255, 255, 255, 0.035);
  font-family: var(--font-editorial);
  font-size: min(65vw, 56rem);
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

@keyframes manifesto-drift {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -12px;
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scene-in {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes destination-reveal {
  from {
    opacity: 0.5;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@media (max-width: 980px) {
  .hero-layout {
    grid-template-columns: minmax(0, 1fr) minmax(250px, 0.8fr);
    gap: 1.5rem;
  }

  .hero-scene {
    min-height: 430px;
  }

  .destination-card {
    width: min(100%, 310px);
  }

  .scene-orbit--outer {
    width: 420px;
    height: 420px;
  }

  .scene-orbit--inner {
    width: 350px;
    height: 350px;
  }

  .territory-card {
    min-height: 360px;
  }

  .manifesto-inner {
    min-height: 620px;
    grid-template-columns: minmax(0, 1fr) minmax(290px, 0.85fr);
    gap: 2rem;
  }

  .manifesto-quote {
    font-size: clamp(2.8rem, 5.6vw, 4.6rem);
  }

  .manifesto-gallery {
    height: 460px;
  }
}

@media (max-width: 720px) {
  .hero {
    min-height: max(820px, 100svh);
    justify-content: flex-start;
  }

  .hero-video {
    object-position: 58% center;
  }

  .hero-shade {
    background:
      linear-gradient(90deg, rgba(7, 27, 29, 0.77), rgba(7, 29, 31, 0.42)),
      linear-gradient(0deg, rgba(5, 23, 24, 0.83), rgba(5, 23, 24, 0.22) 70%);
  }

  .hero-layout {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    padding-top: 8.5rem;
    padding-bottom: 7rem;
  }

  .hero-copy h1 {
    font-size: clamp(3.35rem, 13vw, 5.4rem);
  }

  .hero-lead {
    max-width: 440px;
    margin: 1.25rem 0 1.45rem;
    font-size: 0.94rem;
  }

  .hero-signature {
    margin-top: 1.5rem;
  }

  .hero-scene {
    min-height: 320px;
    margin: -0.5rem 0 0 auto;
    width: min(100%, 360px);
  }

  .destination-card {
    width: 220px;
    aspect-ratio: 0.88;
    border-radius: 135px 135px 20px 20px;
    transform: perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) rotateZ(-3deg);
  }

  .destination-card__topline {
    top: 1.55rem;
    right: 0.9rem;
    left: 0.9rem;
    font-size: 0.46rem;
    padding-bottom: 0.55rem;
  }

  .destination-card__bottom {
    right: 0.9rem;
    bottom: 1rem;
    left: 0.9rem;
  }

  .destination-card__bottom h2 {
    font-size: clamp(1.7rem, 7vw, 2.2rem);
    letter-spacing: -0.065em;
  }

  .destination-card__story {
    font-size: 0.82rem;
    line-height: 1.15;
  }

  .destination-card__region {
    font-size: 0.58rem;
  }

  .destination-card__seal {
    right: 0.55rem;
    bottom: 34%;
    width: 60px;
    height: 60px;
    font-size: 0.4rem;
  }

  .scene-orbit--outer {
    width: 300px;
    height: 300px;
  }

  .scene-orbit--inner {
    width: 255px;
    height: 255px;
  }

  .scene-caption {
    right: auto;
    bottom: -1.25rem;
    left: 0;
    gap: 0.35rem;
    font-size: 0.53rem;
  }

  .scene-control {
    width: 23px;
    height: 23px;
  }

  .hero-bottom {
    bottom: 1rem;
  }

  .hero-route-line,
  .hero-index,
  .desktop-break {
    display: none;
  }

  .manifesto-inner {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.5rem;
    padding-top: 4.25rem;
    padding-bottom: 3.5rem;
  }

  .manifesto-index {
    margin-bottom: 1.35rem;
  }

  .manifesto-quote {
    font-size: clamp(3rem, 10vw, 4.7rem);
  }

  .manifesto-note {
    margin: 1.1rem 0 1.3rem;
    font-size: 0.86rem;
  }

  .manifesto-gallery {
    width: 100%;
    max-width: 500px;
    height: min(105vw, 465px);
    min-height: 340px;
    justify-self: center;
  }

  .manifesto-stamp {
    width: 82px;
    height: 82px;
    font-size: 0.43rem;
  }

  .manifesto-coordinate {
    bottom: 3%;
    left: 4%;
    font-size: 0.46rem;
  }

  .manifesto-decoration {
    top: 0;
    font-size: 95vw;
  }
}

@media (max-width: 420px) {
  .hero-layout {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .hero-eyebrow {
    font-size: 0.6rem;
  }

  .hero-copy h1 {
    font-size: 3.15rem;
  }

  .hero-button {
    min-height: 48px;
    padding: 0.7rem 0.95rem;
    font-size: 0.77rem;
  }

  .hero-button--quiet {
    gap: 0.4rem;
  }

  .hero-scene {
    min-height: 320px;
    width: 100%;
  }

  .manifesto-inner {
    padding-top: 3.5rem;
  }

  .manifesto-quote {
    font-size: clamp(2.75rem, 11vw, 3.8rem);
  }

  .manifesto-gallery {
    height: 350px;
    min-height: 0;
  }

  .manifesto-photo {
    padding: 5px;
  }

  .manifesto-photo figcaption {
    right: 5px;
    bottom: 5px;
    left: 5px;
    padding: 1.8rem 0.55rem 0.6rem;
  }

  .manifesto-photo figcaption span {
    font-size: 0.4rem;
  }

  .manifesto-photo figcaption strong {
    font-size: 1rem;
  }

  .manifesto-stamp {
    width: 72px;
    height: 72px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .hero-copy,
  .hero-scene {
    animation: none;
  }

  .destination-card,
  .destination-card__image,
  .territory-card img,
  .hero-button {
    transition: none;
    transform: none;
  }

  .destination-card__image {
    animation: none;
  }

  .manifesto-photo,
  .manifesto-photo img,
  .manifesto-link,
  .manifesto-link-icon {
    transition: none;
    animation: none;
  }
}
</style>
