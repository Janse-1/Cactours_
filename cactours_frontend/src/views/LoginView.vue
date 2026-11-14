<template>
  <section class="login-experience" aria-labelledby="login-title">
    <video
      ref="backgroundVideo"
      class="login-backdrop"
      src="/images/video/login-background.mp4"
      poster="/images/video/login-poster.jpg"
      :autoplay="!prefersReducedMotion"
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      @play="videoPlaying = true"
      @pause="videoPlaying = false"
      @error="videoError = 'No se pudo cargar el video de fondo.'"
    ></video>
    <div class="login-film" aria-hidden="true"></div>
    <div class="login-grain" aria-hidden="true"></div>

    <button
      class="auth-scene-toggle"
      type="button"
      :aria-label="videoPlaying ? 'Pausar video de fondo' : 'Reproducir video de fondo'"
      @click="toggleBackgroundVideo"
    >
      <Pause v-if="videoPlaying" :size="14" aria-hidden="true" />
      <Play v-else :size="14" aria-hidden="true" />
      <span>{{ videoPlaying ? 'Pausar escena' : 'Reproducir escena' }}</span>
    </button>

    <div class="login-layout">
      <!-- Orbes atmosféricos con brillo animado -->
      <div class="login-ambient-canvas" aria-hidden="true">
        <div class="ambient-orb ambient-orb--cyan"></div>
        <div class="ambient-orb ambient-orb--emerald"></div>
        <div class="ambient-orb ambient-orb--gold"></div>
      </div>

      <div ref="introElement" class="login-intro">
        <!-- Tipografía con animación de letras / split-words -->
        <h1 class="login-split-heading" aria-label="Vuelve por lo que te mueve.">
          <span class="split-line">
            <span class="split-word">Vuelve</span>
            <span class="split-word">por</span>
          </span>
          <span class="split-line">
            <span class="split-word">lo</span>
            <span class="split-word">que</span>
            <span class="split-word split-word--highlight"><em>te mueve.</em></span>
          </span>
        </h1>

        <p class="login-intro-copy">
          Tus lugares pendientes, tus momentos favoritos y esa ruta que todavía te está esperando.
        </p>

        <!-- Tablero de salidas split-flap -->
        <div class="departures-board" role="group" aria-label="Próximas salidas Cactours">
          <header class="board-head">
            <span class="board-title"><PlaneTakeoff :size="14" aria-hidden="true" /> SALIDAS</span>
            <span class="board-clock" aria-label="Hora en Colombia">
              <i aria-hidden="true"></i>{{ colombiaTime }} <small>COT</small>
            </span>
          </header>

          <div class="board-flaps" aria-live="polite" :aria-label="`Destino: ${currentDestination.name}`">
            <span
              v-for="(char, index) in flapChars"
              :key="`${index}-${char}`"
              class="flap"
              aria-hidden="true"
            >{{ char }}</span>
          </div>

          <div class="board-meta">
            <div>
              <small>REGIÓN</small>
              <strong>{{ currentDestination.region }}</strong>
            </div>
            <div>
              <small>COORDENADAS</small>
              <strong>{{ currentDestination.coords }}</strong>
            </div>
            <div>
              <small>ESTADO</small>
              <strong class="board-status"><i aria-hidden="true"></i>{{ currentDestination.status }}</strong>
            </div>
          </div>

          <div class="board-progress" aria-hidden="true">
            <span
              v-for="(destination, index) in destinations"
              :key="destination.name"
              :class="{ 'is-active': index === activeDestinationIndex, 'is-past': index < activeDestinationIndex }"
              @click.stop="goToDestination(index)"
            ><i :style="{ animationDuration: `${DESTINATION_INTERVAL}ms` }"></i></span>
          </div>
        </div>
      </div>

      <!-- Card principal 3D con spotlight interactivo y border-beam -->
      <section
        ref="panelElement"
        class="login-panel spotlight-card--flat"
        @mousemove="handleCardMouseMove"
        @mouseleave="handleCardMouseLeave"
      >
        <div class="border-beam" aria-hidden="true"></div>

        <div class="login-panel-heading form-stagger-item">
          <div class="login-panel-emblem"><Sparkles :size="19" :stroke-width="1.6" aria-hidden="true" /></div>
          <p class="login-panel-status" aria-live="polite">
            <span></span>{{ panelStatus }}
          </p>
        </div>

        <p class="login-eyebrow form-stagger-item">TU ESPACIO CACTOURS</p>

        <!-- Título del panel con letras animadas -->
        <h2 id="login-title" class="login-split-heading form-stagger-item" aria-label="Qué bueno tenerte de vuelta.">
          <span class="split-line">
            <span class="split-word">Qué</span>
            <span class="split-word">bueno</span>
          </span>
          <span class="split-line">
            <span class="split-word">tenerte</span>
            <span class="split-word split-word--highlight"><em>de vuelta.</em></span>
          </span>
        </h2>

        <p class="login-description form-stagger-item">Entra y sigamos trazando una aventura hecha a tu manera.</p>

        <p v-if="authStore.error" class="login-error form-stagger-item" role="alert">
          <span class="login-error-mark">!</span>
          {{ authStore.error }}
        </p>

        <form class="login-form" @submit.prevent="submitLogin">
          <div class="login-field form-stagger-item" :class="{ 'is-focused': focusedField === 'correo' }">
            <label for="login-email">Correo o nombre de viajero</label>
            <div class="login-input-wrap">
              <AtSign :size="17" aria-hidden="true" />
              <input
                id="login-email"
                v-model="correo"
                type="text"
                autocomplete="username"
                placeholder="nombre@correo.com"
                required
                @focus="focusedField = 'correo'"
                @blur="focusedField = ''"
              />
              <span class="login-field-index">01</span>
            </div>
          </div>

          <div class="login-field form-stagger-item" :class="{ 'is-focused': focusedField === 'password' }">
            <label for="login-password">Contraseña</label>
            <div class="login-input-wrap">
              <LockKeyhole :size="17" aria-hidden="true" />
              <input
                id="login-password"
                v-model="password"
                :type="passwordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Tu clave secreta"
                required
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
              <button
                class="login-password-toggle"
                type="button"
                :aria-label="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="passwordVisible"
                aria-controls="login-password"
                @click="passwordVisible = !passwordVisible"
              >
                <Eye v-if="!passwordVisible" :size="17" aria-hidden="true" />
                <EyeOff v-else :size="17" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button type="submit" class="login-submit btn-accent magnetic-button form-stagger-item" :disabled="authStore.loading">
            <span>{{ authStore.loading ? 'Preparando tu ruta...' : 'Entrar a mi espacio' }}</span>
            <span class="login-submit-arrow">
              <LoaderCircle v-if="authStore.loading" :size="17" class="login-spinner" aria-hidden="true" />
              <ArrowRight v-else :size="17" aria-hidden="true" />
            </span>
          </button>
        </form>

        <div class="login-panel-divider form-stagger-item"><span>O EMPIEZA UNA NUEVA RUTA</span></div>
        <button
          type="button"
          class="login-register-link magnetic-button form-stagger-item"
          :disabled="isTransitioning"
          @click="navigateToRegister"
        >
          <span>Crear mi cuenta</span>
          <ArrowUpRight :size="16" aria-hidden="true" />
        </button>

        <div class="login-panel-foot form-stagger-item">
          <ShieldCheck :size="15" aria-hidden="true" />
          <span>Tu información viaja protegida</span>
          <span class="login-panel-foot-dash"></span>
          <span>Colombia, con cariño</span>
        </div>
      </section>
    </div>

    <footer class="login-footer">
      <span>HECHO PARA VIAJAR SIN PRISA</span>
      <span class="login-footer-route"><i></i><i></i><i></i></span>
      <span>LA GUAJIRA · COLOMBIA</span>
    </footer>

    <p v-if="videoError" class="login-video-error" role="status">{{ videoError }}</p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  AtSign,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Pause,
  PlaneTakeoff,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next'
import { gsap } from 'gsap'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const backgroundVideo = ref(null)
const introElement = ref(null)
const panelElement = ref(null)
const correo = ref('')
const password = ref('')
const passwordVisible = ref(false)
const focusedField = ref('')
const videoPlaying = ref(false)
const videoError = ref('')
const prefersReducedMotion = ref(false)
const isTransitioning = ref(false)

let motionPreference
let entranceTimeline
let destinationTimer
let clockTimer
let flapFrame
let xTo
let yTo

// Tablero de salidas: destinos reales con efecto split-flap
const DESTINATION_INTERVAL = 4600
const FLAP_LENGTH = 16
const FLAP_CHARSET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
const destinations = [
  { name: 'Cabo de la Vela', region: 'La Guajira', coords: '12°12′ N · 72°09′ O', status: 'Embarcando' },
  { name: 'Punta Gallinas', region: 'La Guajira', coords: '12°27′ N · 71°40′ O', status: 'A tiempo' },
  { name: 'Bahía Concha', region: 'Magdalena', coords: '11°18′ N · 74°08′ O', status: 'Embarcando' },
  { name: 'Valle del Cocora', region: 'Quindío', coords: '04°38′ N · 75°29′ O', status: 'A tiempo' },
  { name: 'Palomino', region: 'La Guajira', coords: '11°14′ N · 73°33′ O', status: 'Últimos cupos' },
]
const activeDestinationIndex = ref(0)
const currentDestination = computed(() => destinations[activeDestinationIndex.value])

function toFlapText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .padEnd(FLAP_LENGTH, ' ')
    .slice(0, FLAP_LENGTH)
    .split('')
}

const flapChars = ref(toFlapText(destinations[0].name))
const colombiaTime = ref('')
const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Bogota',
})

function updateClock() {
  colombiaTime.value = timeFormatter.format(new Date())
}

// Animación split-flap: cada celda baraja letras y se asienta en cascada (throttled, sin bloquear el hilo)
function flipBoardTo(text) {
  const target = toFlapText(text)
  if (flapFrame) cancelAnimationFrame(flapFrame)

  if (prefersReducedMotion.value) {
    flapChars.value = target
    return
  }

  const start = performance.now()
  const settleAt = target.map((_, index) => 220 + index * 48 + Math.random() * 140)
  let lastSwap = 0

  const tick = (now) => {
    const elapsed = now - start
    if (now - lastSwap >= 55) {
      lastSwap = now
      flapChars.value = target.map((char, index) => {
        if (elapsed >= settleAt[index] || (char === ' ' && flapChars.value[index] === ' ')) return char
        return FLAP_CHARSET[Math.floor(Math.random() * FLAP_CHARSET.length)]
      })
    }

    if (elapsed < settleAt[settleAt.length - 1] + 60) {
      flapFrame = requestAnimationFrame(tick)
    } else {
      flapChars.value = target
      flapFrame = null
    }
  }

  flapFrame = requestAnimationFrame(tick)
}

function goToDestination(index) {
  if (index === activeDestinationIndex.value) return
  activeDestinationIndex.value = index
  flipBoardTo(destinations[index].name)
}

const panelStatus = computed(() => {
  if (authStore.loading) return 'VALIDANDO TU ACCESO'
  if (focusedField.value) return 'LISTO PARA TRAZAR TU RUTA'
  return 'CONEXIÓN SEGURA'
})

// Parallax interactivo 3D y spotlight reactivo en la Card de Login (Ultra-fluido con gsap.quickTo)
function handleCardMouseMove(e) {
  if (prefersReducedMotion.value || !panelElement.value || isTransitioning.value) return
  const rect = panelElement.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  // Variables CSS para el spotlight de luz
  panelElement.value.style.setProperty('--spotlight-x', `${x}px`)
  panelElement.value.style.setProperty('--spotlight-y', `${y}px`)

  // Inclinación 3D amortiguada y suave a 60/120fps sin recálculos de estilo
  const tiltX = ((y - centerY) / centerY) * -5
  const tiltY = ((x - centerX) / centerX) * 5

  if (xTo && yTo) {
    xTo(tiltY)
    yTo(tiltX)
  }
}

function handleCardMouseLeave() {
  if (prefersReducedMotion.value || !panelElement.value || isTransitioning.value) return
  if (xTo && yTo) {
    xTo(0)
    yTo(0)
  }
}

// Transición cinematográfica 3D hacia la pantalla de registro
function navigateToRegister() {
  if (isTransitioning.value) return
  isTransitioning.value = true

  if (prefersReducedMotion.value) {
    router.push('/registro')
    return
  }

  const exitTl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      router.push('/registro')
    },
  })

  exitTl
    .to(panelElement.value, {
      x: -90,
      rotateY: -16,
      scale: 0.91,
      opacity: 0,
      filter: 'blur(12px)',
      duration: 0.48,
    })
    .to(
      introElement.value,
      {
        x: -50,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.42,
      },
      '-=0.36',
    )
}

async function toggleBackgroundVideo() {
  const video = backgroundVideo.value
  if (!video) return

  videoError.value = ''
  if (!video.paused) {
    video.pause()
    return
  }

  try {
    await video.play()
  } catch {
    videoError.value = 'No se pudo reproducir el video de fondo en este navegador.'
  }
}

function handleMotionPreferenceChange(event) {
  prefersReducedMotion.value = event.matches
  if (event.matches) {
    entranceTimeline?.kill()
    gsap.set([introElement.value, panelElement.value], { clearProps: 'transform,filter,opacity' })
    gsap.set('.split-word', { clearProps: 'all' })
    backgroundVideo.value?.pause()
  }
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionPreference.matches
  motionPreference.addEventListener('change', handleMotionPreferenceChange)

  // Reloj en hora de Colombia + tablero de salidas automático
  updateClock()
  clockTimer = setInterval(updateClock, 15000)
  destinationTimer = setInterval(() => {
    activeDestinationIndex.value = (activeDestinationIndex.value + 1) % destinations.length
    flipBoardTo(currentDestination.value.name)
  }, DESTINATION_INTERVAL)

  if (prefersReducedMotion.value) {
    backgroundVideo.value?.pause()
    return
  }

  // Inicializar listeners rápidos para el tilt 3D a 60/120fps sin recargas
  if (panelElement.value) {
    xTo = gsap.quickTo(panelElement.value, 'rotateY', { duration: 0.45, ease: 'power2.out' })
    yTo = gsap.quickTo(panelElement.value, 'rotateX', { duration: 0.45, ease: 'power2.out' })
  }

  // Master Entrance Animation Timeline
  entranceTimeline = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => {
      // Limpiar filtros temporales tras la entrada
      if (panelElement.value) {
        gsap.set(panelElement.value, { clearProps: 'filter' })
      }
    },
  })

  // 1. Orbes ambientales con brillo gradual
  entranceTimeline.fromTo(
    '.ambient-orb',
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 0.5, duration: 1.8, stagger: 0.2, ease: 'power2.out' },
    0,
  )

  // 2. Entrada de la columna intro y el orbit
  entranceTimeline.fromTo(
    introElement.value,
    { y: 35, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9 },
    0.1,
  )

  // 3. Animación de letras (Split-Words Stagger Reveal) en el H1
  entranceTimeline.fromTo(
    '.login-intro .split-word',
    {
      yPercent: 125,
      rotateX: -40,
      opacity: 0,
      filter: 'blur(8px)',
    },
    {
      yPercent: 0,
      rotateX: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.05,
      stagger: 0.065,
      ease: 'power4.out',
    },
    0.2,
  )

  // 4. Copia y tablero de salidas
  entranceTimeline.fromTo(
    ['.login-intro-copy', '.departures-board'],
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.14 },
    0.45,
  )
  entranceTimeline.add(() => flipBoardTo(currentDestination.value.name), 0.75)

  // 5. Entrada 3D de la Card de Login (Spotlight Glass Panel)
  entranceTimeline.fromTo(
    panelElement.value,
    {
      y: 45,
      scale: 0.92,
      rotateY: 8,
      opacity: 0,
      filter: 'blur(12px)',
    },
    {
      y: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.15,
      ease: 'power3.out',
    },
    0.3,
  )

  // 6. Animación de letras en el título del Panel (H2)
  entranceTimeline.fromTo(
    '.login-panel .split-word',
    {
      yPercent: 120,
      opacity: 0,
      filter: 'blur(6px)',
    },
    {
      yPercent: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      stagger: 0.05,
      ease: 'power4.out',
    },
    0.5,
  )

  // 7. Cascada de elementos del formulario
  entranceTimeline.fromTo(
    '.form-stagger-item',
    { y: 18, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: 'power2.out' },
    0.65,
  )
})

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
  entranceTimeline?.kill()
  if (destinationTimer) clearInterval(destinationTimer)
  if (clockTimer) clearInterval(clockTimer)
  if (flapFrame) cancelAnimationFrame(flapFrame)
})

async function submitLogin() {
  try {
    await authStore.login({ correo: correo.value, password: password.value })
    const redirectPath = route.query.redirect || '/mi-perfil'
    router.push(redirectPath)
  } catch {
    // El store expone el error junto al formulario.
  }
}
</script>

<style scoped>
.login-experience {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 100svh;
  flex-direction: column;
  overflow: visible;
  padding: clamp(4.2rem, 7.5vh, 5.5rem) clamp(1.35rem, 5vw, 6rem) 1.25rem;
  background: #071819;
  color: #f7fbf9;
  isolation: isolate;
}

.auth-scene-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1.75rem;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(7, 37, 41, 0.65);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: all 220ms ease;
}

.auth-scene-toggle:hover {
  background: rgba(14, 67, 70, 0.85);
  border-color: rgba(6, 155, 224, 0.6);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.login-backdrop,
.login-film,
.login-grain {
  position: fixed;
  z-index: -3;
  inset: 0;
  width: 100%;
  height: 100%;
}

.login-backdrop {
  object-fit: cover;
  object-position: center 54%;
  filter: saturate(0.82) brightness(0.72);
}

.login-film {
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(4, 17, 19, 0.82) 0%, rgba(5, 23, 24, 0.56) 42%, rgba(4, 18, 19, 0.42) 72%, rgba(4, 16, 18, 0.7) 100%),
    linear-gradient(0deg, rgba(3, 15, 17, 0.78), transparent 34%, rgba(3, 15, 17, 0.3));
}

.login-grain {
  z-index: -1;
  pointer-events: none;
  opacity: 0.18;
  background-image: radial-gradient(rgba(255, 255, 255, 0.7) 0.45px, transparent 0.65px);
  background-size: 4px 4px;
  mask-image: linear-gradient(90deg, #000, transparent 80%);
}

.login-panel-status > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a4e1d3;
  box-shadow: 0 0 0 4px rgba(164, 225, 211, 0.13), 0 0 16px rgba(164, 225, 211, 0.7);
  animation: login-signal 2.2s ease-in-out infinite;
}

/* Orbes de luz atmosférica flotante */
.login-ambient-canvas {
  position: absolute;
  inset: -15% 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(95px);
  opacity: 0.45;
  will-change: transform;
}

.ambient-orb--cyan {
  top: 15%;
  right: 10%;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, rgba(6, 155, 224, 0.42) 0%, rgba(2, 99, 116, 0.18) 60%, transparent 80%);
  animation: orb-drift-1 16s ease-in-out infinite alternate;
}

.ambient-orb--emerald {
  bottom: 5%;
  right: 2%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(164, 225, 211, 0.38) 0%, rgba(12, 53, 54, 0.22) 65%, transparent 85%);
  animation: orb-drift-2 18s ease-in-out infinite alternate;
}

.ambient-orb--gold {
  top: 35%;
  left: 2%;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(227, 168, 87, 0.25) 0%, rgba(2, 99, 116, 0.08) 60%, transparent 80%);
  animation: orb-drift-3 20s ease-in-out infinite alternate;
}

@keyframes orb-drift-1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-35px, 45px) scale(1.12); }
  100% { transform: translate(30px, -25px) scale(0.94); }
}

@keyframes orb-drift-2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(45px, -40px) scale(1.1); }
  100% { transform: translate(-30px, 30px) scale(0.9); }
}

@keyframes orb-drift-3 {
  0% { transform: translate(0, 0) scale(0.92); }
  50% { transform: translate(40px, 35px) scale(1.16); }
  100% { transform: translate(-25px, -40px) scale(1); }
}

.login-layout {
  position: relative;
  display: grid;
  width: min(100%, 1240px);
  flex: 1;
  align-items: center;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 440px);
  gap: clamp(2rem, 5vw, 6.5rem);
  margin: 0 auto;
  padding: 0.5rem 0;
  perspective: 1200px;
}

.login-intro {
  position: relative;
  align-self: center;
  max-width: 620px;
  padding: 0.5rem 0;
}

.login-orbit {
  position: absolute;
  top: -4.5rem;
  right: -1rem;
  display: grid;
  width: clamp(190px, 22vw, 290px);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(228, 249, 242, 0.16);
  border-radius: 50%;
  opacity: 0.65;
  pointer-events: none;
}

.login-orbit::before,
.login-orbit::after {
  position: absolute;
  border: 1px solid rgba(228, 249, 242, 0.14);
  border-radius: 50%;
  content: '';
}

.login-orbit::before {
  inset: 12%;
}

.login-orbit::after {
  inset: 25%;
  border-style: dashed;
  animation: login-orbit-spin 46s linear infinite;
}

.login-orbit-core {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(11, 55, 55, 0.38);
  box-shadow: 0 0 42px rgba(145, 224, 206, 0.13), inset 0 1px rgba(255, 255, 255, 0.22);
  color: #c9ede2;
  backdrop-filter: blur(10px);
}

.login-orbit-point {
  position: absolute;
  top: 17%;
  right: 23%;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  background: #b7ecdd;
  box-shadow: 0 0 20px 5px rgba(183, 236, 221, 0.5);
}

.login-kicker,
.login-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0;
  color: #b7e9dd;
  font-size: 0.61rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.login-kicker > span {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid rgba(183, 233, 221, 0.48);
  border-radius: 50%;
  color: #fff;
  font-size: 0.57rem;
  letter-spacing: 0;
}

/* Animaciones de letras y títulos (Split-Words & Shimmer) */
.login-split-heading {
  position: relative;
  z-index: 1;
  margin: 0.85rem 0 0.8rem;
  color: #fff;
  font-size: clamp(2.6rem, 5.2vw, 4.6rem);
  font-weight: 600;
  letter-spacing: -0.08em;
  line-height: 1;
}

.split-line {
  display: block;
  overflow: hidden;
  line-height: 1.05;
  padding-bottom: 0.08em;
}

.split-word {
  display: inline-block;
  transform-origin: bottom left;
  will-change: transform, opacity, filter;
  margin-right: 0.22em;
}

.split-word:last-child {
  margin-right: 0;
}

.split-word--highlight em {
  display: inline-block;
  color: #c3eee2;
  font-family: var(--font-editorial);
  font-weight: 500;
  letter-spacing: -0.045em;
  background: linear-gradient(
    115deg,
    #a8e8d8 0%,
    #ffffff 22%,
    #069be0 52%,
    #bfe9dd 78%,
    #ffffff 100%
  );
  background-size: 240% auto;
  color: transparent !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  animation: text-shimmer-flow 5s linear infinite;
  font-style: italic;
}

@keyframes text-shimmer-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 240% 50%;
  }
}

.login-intro-copy {
  max-width: 420px;
  margin: 0;
  color: rgba(255, 255, 255, 0.77);
  font-size: clamp(0.82rem, 1.1vw, 0.92rem);
  line-height: 1.65;
}

/* Tablero de salidas estilo aeropuerto / expediciones en vivo (split-flap) */
.departures-board {
  --board-font: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Space Mono', Consolas, monospace;
  position: relative;
  width: min(100%, 470px);
  margin-top: clamp(1.4rem, 3.2vh, 2.2rem);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 0.95rem 1.05rem 0.9rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.015) 45%),
    rgba(3, 16, 18, 0.62);
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.36),
    inset 0 1px rgba(255, 255, 255, 0.15);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  backdrop-filter: blur(20px) saturate(140%);
  user-select: none;
}

.departures-board::before {
  position: absolute;
  top: 0;
  right: 1.5rem;
  left: 1.5rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(210, 249, 237, 0.75), transparent);
  content: '';
  pointer-events: none;
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.22em;
}

.board-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #b7e9dd;
  text-transform: uppercase;
}

.board-clock {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  font-family: var(--board-font);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.board-clock small {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.5rem;
  letter-spacing: 0.14em;
}

.board-clock i,
.board-status i {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #a4e1d3;
  box-shadow: 0 0 10px rgba(164, 225, 211, 0.85);
  animation: board-blink 1.6s ease-in-out infinite;
}

@keyframes board-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}

.board-flaps {
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 3px;
  perspective: 500px;
}

.flap {
  position: relative;
  display: grid;
  aspect-ratio: 0.72;
  place-items: center;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(180deg, #163334 0%, #0e2325 49.2%, #051315 50.8%, #0c2022 100%);
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.12),
    0 2px 5px rgba(0, 0, 0, 0.45);
  color: #f2fbf7;
  font-family: var(--board-font);
  font-size: clamp(0.72rem, 1.35vw, 1.15rem);
  font-weight: 700;
  line-height: 1;
  transform-origin: 50% 50%;
  backface-visibility: hidden;
  animation: flap-drop 160ms cubic-bezier(0.3, 0.7, 0.4, 1) both;
}

.flap::after {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 1px rgba(255, 255, 255, 0.08);
  content: '';
}

@keyframes flap-drop {
  from {
    opacity: 0.4;
    transform: rotateX(-75deg);
  }
  to {
    opacity: 1;
    transform: rotateX(0deg);
  }
}

.board-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-top: 0.8rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.14);
  padding-top: 0.65rem;
}

.board-meta div {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.board-meta small {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.board-meta strong {
  overflow: hidden;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #a4e1d3 !important;
}

.board-progress {
  display: flex;
  gap: 5px;
  margin-top: 0.75rem;
}

.board-progress span {
  height: 3px;
  flex: 1;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: background 200ms ease;
}

.board-progress span:hover {
  background: rgba(255, 255, 255, 0.35);
}

.board-progress i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #a4e1d3, #069be0);
  transform: scaleX(0);
  transform-origin: left center;
}

.board-progress .is-past i {
  transform: scaleX(1);
}

.board-progress .is-active i {
  animation: board-fill linear forwards;
}

@keyframes board-fill {
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .flap,
  .board-clock i,
  .board-status i {
    animation: none;
  }

  .board-progress .is-active i {
    animation: none;
    transform: scaleX(1);
  }
}

/* Card 3D principal de Login con Spotlight interactivo */
.login-panel {
  position: relative;
  width: 100%;
  max-width: 440px;
  justify-self: end;
  overflow: hidden;
  border: 1px solid rgba(239, 255, 249, 0.28);
  border-radius: 24px;
  padding: clamp(1.2rem, 2.2vw, 1.75rem);
  background:
    radial-gradient(550px circle at var(--spotlight-x, 50%) var(--spotlight-y, 30%), rgba(6, 155, 224, 0.16), transparent 60%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.035)),
    rgba(5, 24, 25, 0.64);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.38),
    inset 0 1px rgba(255, 255, 255, 0.42),
    inset 0 -18px 34px rgba(0, 0, 0, 0.12);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  backdrop-filter: blur(28px) saturate(160%);
  transform-style: preserve-3d;
  will-change: transform;
}

/* Border Beam: Haz de luz que recorre el contorno de la Card */
.border-beam {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(
    from var(--beam-angle, 0deg) at 50% 50%,
    transparent 0%,
    transparent 65%,
    rgba(6, 155, 224, 0.4) 76%,
    rgba(164, 225, 211, 0.9) 88%,
    #ffffff 96%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  animation: border-beam-rotate 7.5s linear infinite;
}

@property --beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes border-beam-rotate {
  from {
    --beam-angle: 0deg;
    transform: rotate(0deg);
  }
  to {
    --beam-angle: 360deg;
    transform: rotate(360deg);
  }
}

.login-panel::after {
  position: absolute;
  top: 0;
  right: 2rem;
  left: 2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(210, 249, 237, 0.8), transparent);
  content: '';
  pointer-events: none;
}

.login-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.95rem;
}

.login-panel-emblem {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(215, 249, 239, 0.32);
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.035));
  box-shadow: 7px 7px 18px rgba(0, 0, 0, 0.18), -5px -5px 15px rgba(255, 255, 255, 0.035), inset 0 1px rgba(255, 255, 255, 0.25);
  color: #c2eee1;
}

.login-panel-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: rgba(231, 249, 243, 0.78);
  font-size: 0.51rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.login-panel-status > span {
  width: 6px;
  height: 6px;
}

.login-eyebrow {
  color: #b7e9dd;
  font-size: 0.54rem;
  letter-spacing: 0.17em;
}

.login-panel h2,
.login-panel .login-split-heading {
  margin: 0.4rem 0 0;
  color: #fff;
  font-size: clamp(1.75rem, 2.3vw, 2.2rem);
  font-weight: 600;
  letter-spacing: -0.065em;
  line-height: 1.05;
}

.login-panel h2 em,
.login-panel .login-split-heading em {
  color: #bfe9dd;
}

.login-description {
  margin: 0.45rem 0 0.95rem;
  color: rgba(244, 250, 247, 0.7);
  font-size: 0.76rem;
  line-height: 1.55;
}

.login-error {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin: 0 0 1.1rem;
  border: 1px solid rgba(255, 177, 166, 0.36);
  border-radius: 12px;
  padding: 0.72rem 0.8rem;
  background: rgba(110, 30, 25, 0.34);
  color: #ffe2dc;
  font-size: 0.75rem;
  line-height: 1.55;
}

.login-error-mark {
  display: grid;
  width: 19px;
  height: 19px;
  flex: 0 0 19px;
  place-items: center;
  border: 1px solid rgba(255, 226, 220, 0.7);
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
}

.login-form {
  display: grid;
  gap: 0.65rem;
}

.login-field {
  min-width: 0;
}

.login-field label {
  display: block;
  margin: 0 0 0.35rem 0.15rem;
  color: rgba(244, 250, 247, 0.88);
  font-size: 0.67rem;
  font-weight: 700;
}

.login-input-wrap {
  position: relative;
  display: flex;
  min-height: 47px;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 12px;
  padding: 0 0.8rem;
  background: rgba(2, 15, 17, 0.34);
  box-shadow:
    inset 5px 5px 12px rgba(0, 0, 0, 0.22),
    inset -4px -4px 11px rgba(255, 255, 255, 0.035),
    0 1px rgba(255, 255, 255, 0.06);
  color: rgba(197, 237, 225, 0.84);
  transition: border-color 220ms ease, box-shadow 220ms ease, background-color 220ms ease;
}

.login-input-wrap:focus-within,
.login-field.is-focused .login-input-wrap {
  border-color: rgba(168, 231, 214, 0.78);
  background: rgba(3, 24, 25, 0.56);
  box-shadow:
    inset 4px 4px 10px rgba(0, 0, 0, 0.18),
    0 0 0 3px rgba(153, 226, 208, 0.12),
    0 0 24px rgba(124, 219, 194, 0.09);
}

.login-input-wrap input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 0.75rem 0;
  background: transparent;
  color: #fff;
  font-size: 0.78rem;
}

.login-input-wrap input::placeholder {
  color: rgba(231, 244, 239, 0.43);
}

.login-input-wrap input:focus-visible {
  outline: 0;
}

.login-field-index {
  color: rgba(230, 245, 239, 0.43);
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  transition: color 200ms ease;
}

.login-field.is-focused .login-field-index {
  color: #a4e1d3;
}

.login-password-toggle {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: rgba(235, 249, 244, 0.68);
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}

.login-password-toggle:hover {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.login-password-toggle:focus-visible,
.login-video-toggle:focus-visible,
.login-submit:focus-visible,
.login-register-link:focus-visible {
  outline: 2px solid #bdebdc;
  outline-offset: 3px;
}

.login-submit {
  position: relative;
  overflow: hidden;
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.15rem;
  border: 1px solid rgba(224, 255, 245, 0.72);
  border-radius: 12px;
  padding: 0.35rem 0.45rem 0.35rem 1rem;
  background: linear-gradient(110deg, #c0f0df 0%, #96d9c8 48%, #81cfc1 100%);
  box-shadow: 0 10px 24px rgba(103, 207, 177, 0.18), inset 0 1px rgba(255, 255, 255, 0.72), inset 0 -3px 8px rgba(15, 85, 74, 0.1);
  color: #10372f;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 800;
  transition: box-shadow 220ms ease, filter 220ms ease, transform 200ms var(--motion-spring);
}

.login-submit::before {
  position: absolute;
  top: 0;
  left: -120%;
  width: 65%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  content: '';
  transform: skewX(-25deg);
  transition: left 0.7s ease;
  pointer-events: none;
}

.login-submit:hover:not(:disabled)::before {
  left: 150%;
}

.login-submit:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: 0 16px 36px rgba(103, 207, 177, 0.35), inset 0 1px rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
}

.login-submit:disabled {
  cursor: wait;
  filter: saturate(0.72);
  opacity: 0.8;
}

.login-submit-arrow {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border: 1px solid rgba(16, 55, 47, 0.12);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.27);
  transition: transform 220ms ease, background-color 220ms ease;
}

.login-submit:hover:not(:disabled) .login-submit-arrow {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.43);
}

.login-spinner {
  animation: login-orbit-spin 1s linear infinite;
}

.login-panel-divider {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0.75rem 0 0.55rem;
  color: rgba(240, 249, 245, 0.52);
  font-size: 0.47rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.login-panel-divider::before,
.login-panel-divider::after {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.19));
  content: '';
}

.login-panel-divider::after {
  transform: rotate(180deg);
}

.login-register-link {
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.21);
  border-radius: 11px;
  background: transparent;
  color: #effaf5;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 200ms ease, background-color 200ms ease, transform 180ms var(--motion-spring);
}

.login-register-link:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.login-panel-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.65rem;
  color: rgba(237, 248, 243, 0.58);
  font-size: 0.52rem;
}

.login-panel-foot svg {
  color: #b5e7d8;
}

.login-panel-foot-dash {
  width: 14px;
  height: 1px;
  margin: 0 0.15rem;
  background: rgba(255, 255, 255, 0.32);
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.49rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.login-footer-route {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.login-footer-route i {
  width: 4px;
  height: 4px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.login-footer-route i:nth-child(2) {
  width: 32px;
  height: 1px;
  border: 0;
  background: rgba(255, 255, 255, 0.55);
}

.login-video-error {
  position: absolute;
  right: 1.5rem;
  bottom: 3.4rem;
  margin: 0;
  color: #fff;
  font-size: 0.7rem;
}

@keyframes login-orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes login-signal {
  50% {
    opacity: 0.55;
    box-shadow: 0 0 0 6px rgba(164, 225, 211, 0.08), 0 0 12px rgba(164, 225, 211, 0.42);
  }
}

@media (max-width: 900px) {
  .login-experience {
    padding-right: clamp(1.25rem, 5vw, 3rem);
    padding-left: clamp(1.25rem, 5vw, 3rem);
  }

  .login-layout {
    max-width: 640px;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.3rem;
    padding: 3rem 0;
  }

  .login-intro {
    max-width: 600px;
    padding-top: 1rem;
  }

  .login-intro h1 {
    max-width: 580px;
    font-size: clamp(3.2rem, 9vw, 5rem);
  }

  .login-intro-copy {
    max-width: 460px;
  }

  .login-orbit {
    top: -4rem;
    right: 1rem;
    width: clamp(190px, 30vw, 270px);
  }

  .login-panel {
    max-width: 540px;
    justify-self: center;
  }

  .departures-board {
    margin-top: 1.5rem;
  }
}

@media (max-width: 560px) {
  .login-experience {
    min-height: 100svh;
    padding: 4.5rem 1rem 1.1rem;
  }

  .login-live-indicator i {
    width: 5px;
    height: 5px;
  }

  .login-video-toggle {
    min-height: 32px;
    padding: 0.25rem 0.6rem;
    font-size: 0.56rem;
  }

  .login-layout {
    gap: 1.2rem;
    padding: 2rem 0 1.4rem;
  }

  .login-intro {
    padding: 0;
  }

  .login-orbit {
    top: -2.4rem;
    right: 0;
    width: 155px;
    opacity: 0.5;
  }

  .login-orbit-core {
    width: 38px;
    height: 38px;
  }

  .login-kicker {
    gap: 0.5rem;
    font-size: 0.48rem;
    letter-spacing: 0.11em;
  }

  .login-kicker > span {
    width: 24px;
    height: 24px;
    font-size: 0.5rem;
  }

  .login-intro h1 {
    margin: 0.75rem 0 0.55rem;
    font-size: clamp(2.65rem, 12.5vw, 3.6rem);
  }

  .login-intro-copy {
    max-width: 380px;
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .departures-board {
    display: none;
  }

  .login-panel {
    border-radius: 23px;
    padding: 1.35rem 1.2rem 1.15rem;
  }

  .login-panel-heading {
    margin-bottom: 1.05rem;
  }

  .login-panel-emblem {
    width: 35px;
    height: 35px;
    border-radius: 11px;
  }

  .login-panel-status {
    font-size: 0.45rem;
    letter-spacing: 0.1em;
  }

  .login-panel h2 {
    font-size: 2.08rem;
  }

  .login-description {
    margin: 0.55rem 0 1.1rem;
    font-size: 0.72rem;
  }

  .login-form {
    gap: 0.8rem;
  }

  .login-input-wrap {
    min-height: 49px;
  }

  .login-submit {
    min-height: 50px;
  }

  .login-submit-arrow {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .login-panel-divider {
    margin-top: 1rem;
  }

  .login-panel-foot {
    margin-top: 0.9rem;
    font-size: 0.48rem;
  }

  .login-footer {
    font-size: 0.42rem;
    letter-spacing: 0.1em;
  }

  .login-footer-route i:nth-child(2) {
    width: 18px;
  }
}

@media (max-width: 360px) {
  .login-intro h1 {
    font-size: 2.4rem;
  }

  .login-panel-foot {
    flex-wrap: wrap;
  }
}

@media (min-width: 901px) and (max-height: 820px) {
  .login-experience {
    padding-top: 0.9rem;
    padding-bottom: 0.9rem;
  }

  .login-layout {
    padding: 0.35rem 0;
  }

  .login-panel {
    padding: 1.3rem 1.6rem;
  }

  .login-panel-heading {
    margin-bottom: 0.9rem;
  }

  .login-panel h2 {
    font-size: 2.1rem;
  }

  .login-description {
    margin: 0.45rem 0 0.85rem;
  }

  .login-form {
    gap: 0.7rem;
  }

  .login-input-wrap {
    min-height: 47px;
  }

  .login-submit {
    min-height: 48px;
  }

  .login-submit-arrow {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .login-panel-divider {
    margin: 0.8rem 0 0.55rem;
  }

  .login-register-link {
    min-height: 38px;
  }

  .login-panel-foot {
    margin-top: 0.7rem;
  }

  .departures-board {
    margin-top: 1.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-orbit::after,
  .login-live-indicator i,
  .login-panel-status > span,
  .login-spinner,
  .ambient-orb,
  .border-beam,
  .float-card,
  .split-word--highlight em {
    animation: none !important;
  }

  .login-backdrop {
    transform: none;
  }

  .login-panel {
    transform: none !important;
  }
}
</style>
