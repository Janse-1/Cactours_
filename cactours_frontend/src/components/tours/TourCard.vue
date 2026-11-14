<template>
  <article
    class="tour-card"
    @pointermove="handlePointerMove"
    @pointerleave="resetSpotlight"
  >
    <div class="tour-media">
      <img
        v-if="coverImage && !imageUnavailable"
        :src="coverImage"
        :alt="tour.nombre_tour"
        loading="lazy"
        @error="imageUnavailable = true"
      />
      <div v-else class="tour-placeholder" aria-hidden="true">
        <Compass :size="30" />
      </div>
      <div class="tour-image-shade" aria-hidden="true"></div>
      <span class="tour-badge">
        <Clock3 :size="13" aria-hidden="true" />
        {{ tour.duracion_dias }} {{ tour.duracion_dias === 1 ? 'día' : 'días' }}
      </span>
      <span class="tour-location-overlay">
        <MapPin :size="14" aria-hidden="true" />
        {{ tour.ciudad_destino }}
      </span>
    </div>

    <div class="tour-body">
      <h3>
        <RouterLink :to="`/tours/${tour.id}`">{{ tour.nombre_tour }}</RouterLink>
      </h3>
      <p class="tour-description">{{ tour.descripcion }}</p>

      <div class="tour-footer">
        <div class="tour-price">
          <span class="price-label">Desde</span>
          <strong class="price-value">{{ formattedPrice }}</strong>
        </div>
        <RouterLink :to="`/tours/${tour.id}`" class="tour-link">
          Ver experiencia
          <ArrowUpRight :size="17" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowUpRight, Clock3, Compass, MapPin } from 'lucide-vue-next'
import { resolveTourCover } from '@/data/tourMedia'

const props = defineProps({
  tour: {
    type: Object,
    required: true,
  },
})

const imageUnavailable = ref(false)
const formattedPrice = computed(() => {
  const amount = Number(props.tour.costo)
  if (!Number.isFinite(amount)) return 'Consulta disponibilidad'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
})
const coverImage = computed(() => resolveTourCover(props.tour))

watch(() => props.tour.id, () => {
  imageUnavailable.value = false
})

function handlePointerMove(event) {
  if (
    event.pointerType !== 'mouse'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return
  }

  const bounds = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - bounds.left) / bounds.width) * 100
  const y = ((event.clientY - bounds.top) / bounds.height) * 100
  event.currentTarget.style.setProperty('--spotlight-x', `${x}%`)
  event.currentTarget.style.setProperty('--spotlight-y', `${y}%`)
  event.currentTarget.style.setProperty('--tilt-x', `${(50 - y) * 0.035}deg`)
  event.currentTarget.style.setProperty('--tilt-y', `${(x - 50) * 0.035}deg`)
}

function resetSpotlight(event) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg')
  event.currentTarget.style.setProperty('--tilt-y', '0deg')
}
</script>

<style scoped>
.tour-card {
  --spotlight-x: 50%;
  --spotlight-y: 0%;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  position: relative;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(2, 99, 116, 0.12);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 14px 40px rgba(2, 44, 49, 0.07);
  transform-style: preserve-3d;
  transition:
    box-shadow 250ms ease,
    transform 250ms ease;
}

.tour-card::after {
  position: absolute;
  z-index: 2;
  top: 0;
  left: -85%;
  width: 42%;
  height: 100%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  content: '';
  pointer-events: none;
  transform: skewX(-16deg);
  transition: left 700ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.tour-card::before {
  position: absolute;
  z-index: 3;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    330px circle at var(--spotlight-x) var(--spotlight-y),
    rgba(6, 155, 224, 0.14),
    transparent 66%
  );
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.tour-media {
  position: relative;
  height: 245px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 70% 20%, rgba(6, 155, 224, 0.45), transparent 40%),
    var(--color-azul-petroleo);
}

.tour-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 650ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.tour-image-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 25, 27, 0.08) 30%, rgba(6, 25, 27, 0.66));
  pointer-events: none;
}

.tour-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: rgba(255, 255, 255, 0.8);
}

.tour-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 999px;
  padding: 0.42rem 0.65rem;
  background: rgba(8, 41, 46, 0.38);
  color: var(--color-blanco);
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
}

.tour-location-overlay {
  position: absolute;
  right: 1.15rem;
  bottom: 1.1rem;
  left: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-blanco);
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.tour-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.3rem;
}

.tour-body h3 {
  margin: 0;
  color: var(--color-carbon);
  font-size: 1.25rem;
  letter-spacing: -0.045em;
}

.tour-body h3 a {
  color: inherit;
  text-decoration: none;
}

.tour-body h3 a:hover {
  color: var(--color-turquesa-cactours);
}

.tour-description {
  display: -webkit-box;
  overflow: hidden;
  flex: 1;
  margin: 0.55rem 0 1.2rem;
  color: var(--color-muted);
  font-size: 0.84rem;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.tour-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--color-line);
  padding-top: 1rem;
}

.price-label {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--color-muted);
  font-size: 0.63rem;
}

.price-value {
  color: var(--color-turquesa-cactours);
  font-size: 1.04rem;
  line-height: 1.2;
}

.tour-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.tour-link:hover {
  background: var(--color-mineral-ivory);
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .tour-card {
    position: relative;
    transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
    transition:
      box-shadow 250ms ease,
      transform 180ms ease-out;
  }

  .tour-card:hover {
    box-shadow: 0 24px 52px rgba(2, 44, 49, 0.14);
  }

  .tour-card:hover::before {
    opacity: 1;
  }

  .tour-card:hover .tour-media img {
    transform: scale(1.045);
  }

  .tour-card:hover::after {
    left: 130%;
  }
}

@media (max-width: 480px) {
  .tour-media {
    height: 220px;
  }

  .tour-body {
    padding: 1.05rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tour-card,
  .tour-media img,
  .tour-card::before,
  .tour-card::after {
    transition: none;
  }

  .tour-card {
    transform: none;
  }
}
</style>
