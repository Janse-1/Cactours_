<template>
  <section class="auth-shell container mx-auto grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <aside ref="storyElement" class="auth-story">
      <img
        class="auth-story-image"
        :src="featuredSanAndresImage"
        alt=""
        aria-hidden="true"
      />
      <div class="auth-story-overlay">
        <div class="auth-story-brand">
          <img :src="logoUrl" alt="Logo Cactours" />
          <span>Cactours</span>
        </div>

        <div class="auth-story-copy">
          <p class="auth-story-kicker"><Compass :size="15" aria-hidden="true" /> VIAJA CON RAÍZ</p>
          <h2>Descubre Colombia<br /><em>a tu ritmo.</em></h2>
          <p>Un buen viaje empieza con curiosidad, confianza y ganas de conocer el territorio.</p>
          <div class="auth-story-promise">
            <ShieldCheck :size="17" aria-hidden="true" />
            <span>Tu próxima historia empieza aquí.</span>
          </div>
        </div>

        <div class="auth-story-footer">
          <span>ISLAS DE SAN ANDRÉS · CARIBE COLOMBIANO</span>
          <span>DESTINOS CACTOURS</span>
        </div>
      </div>
    </aside>

    <div class="auth-panel">
      <div ref="formElement" class="auth-form-card">
        <p class="auth-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="auth-description">{{ description }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Compass, ShieldCheck } from 'lucide-vue-next'
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
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out' },
  )
})

onBeforeUnmount(() => {
  gsap.killTweensOf([storyElement.value, formElement.value])
})
</script>

<style scoped>
.auth-shell {
  max-width: 1320px;
  min-height: 740px;
  align-items: stretch;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: clamp(1.5rem, 4vw, 3.25rem);
  padding-bottom: clamp(1.5rem, 4vw, 3.25rem);
}

.auth-story {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  background: #0c3439;
  isolation: isolate;
}

.auth-story-image,
.auth-story-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.auth-story-image {
  z-index: -2;
  object-fit: cover;
  object-position: center;
}

.auth-story-overlay {
  z-index: -1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.5rem, 4vw, 3rem);
  background:
    linear-gradient(180deg, rgba(5, 28, 31, 0.54), rgba(5, 28, 31, 0.06) 34%, rgba(5, 28, 31, 0.82)),
    radial-gradient(ellipse at 18% 82%, rgba(2, 99, 116, 0.35), transparent 58%);
}

.auth-story-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  align-self: flex-start;
  color: var(--color-blanco);
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.035em;
}

.auth-story-brand img {
  width: 54px;
  height: 54px;
  min-width: 54px;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
}

.auth-story-copy {
  max-width: 470px;
  margin: auto 0;
  padding: 3rem 0;
  color: var(--color-blanco);
}

.auth-story-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  color: #b7e5df;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.auth-story-copy h2 {
  margin: 0;
  color: var(--color-blanco);
  font-size: clamp(2.6rem, 5vw, 4.65rem);
  letter-spacing: -0.075em;
  line-height: 0.98;
}

.auth-story-copy h2 em {
  color: #b7e5df;
  font-family: var(--font-editorial);
  font-size: 1.08em;
  font-weight: 500;
  letter-spacing: -0.045em;
}

.auth-story-copy > p:not(.auth-story-kicker) {
  max-width: 370px;
  margin: 1.35rem 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.93rem;
  line-height: 1.8;
}

.auth-story-promise {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  padding: 0.6rem 0.85rem;
  background: rgba(5, 28, 31, 0.46);
  color: var(--color-blanco);
  font-size: 0.72rem;
  backdrop-filter: blur(12px);
}

.auth-story-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.auth-story-footer a {
  color: inherit;
  font-weight: 500;
  letter-spacing: 0;
  text-align: right;
  text-decoration-color: rgba(255, 255, 255, 0.5);
  text-underline-offset: 3px;
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0rem, 2vw, 1.25rem);
}

.auth-form-card {
  width: 100%;
  max-width: 520px;
  border: 1px solid rgba(2, 99, 116, 0.08);
  border-radius: var(--radius-lg);
  padding: clamp(1.5rem, 4vw, 2.75rem);
  background: var(--color-blanco);
  box-shadow: 0 24px 70px rgba(2, 44, 49, 0.1);
}

.auth-eyebrow {
  margin: 0 0 0.6rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.auth-form-card h1 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  letter-spacing: -0.065em;
  line-height: 1.12;
}

.auth-description {
  margin: 0.8rem 0 1.7rem;
  color: var(--color-muted);
  font-size: 0.88rem;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .auth-shell {
    min-height: auto;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  }

  .auth-story {
    min-height: 590px;
  }

  .auth-story-footer {
    flex-direction: column;
  }

  .auth-story-footer a {
    text-align: left;
  }
}

@media (max-width: 700px) {
  .auth-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    padding-top: 1.1rem;
  }

  .auth-story {
    min-height: 290px;
    height: clamp(290px, 78vw, 340px);
  }

  .auth-story-overlay {
    padding: 1.2rem;
  }

  .auth-story-brand {
    display: none;
  }

  .auth-story-copy {
    margin: 0;
    padding: 0.75rem 0;
  }

  .auth-story-copy h2 {
    font-size: clamp(2.1rem, 9vw, 3rem);
  }

  .auth-story-copy > p:not(.auth-story-kicker) {
    max-width: 310px;
    margin-top: 0.7rem;
    font-size: 0.8rem;
  }

  .auth-story-promise {
    display: none;
  }

  .auth-story-footer {
    flex-direction: row;
    font-size: 0.48rem;
  }

  .auth-story-footer a {
    max-width: 55%;
    text-align: right;
  }

  .auth-panel {
    position: relative;
    z-index: 1;
    margin-top: -1.25rem;
    padding: 0 0.4rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-story-image {
    transform: none;
  }
}
</style>
