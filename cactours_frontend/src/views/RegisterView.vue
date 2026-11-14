<template>
  <section class="register-experience" aria-labelledby="register-title">
    <!-- Video de fondo cinematográfico -->
    <video
      ref="backgroundVideo"
      class="register-backdrop"
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
    <div class="register-film" aria-hidden="true"></div>
    <div class="register-grain" aria-hidden="true"></div>

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

    <div class="register-layout">
      <!-- Orbes atmosféricos con brillo animado -->
      <div class="register-ambient-canvas" aria-hidden="true">
        <div class="ambient-orb ambient-orb--cyan"></div>
        <div class="ambient-orb ambient-orb--emerald"></div>
        <div class="ambient-orb ambient-orb--gold"></div>
      </div>

      <!-- Columna izquierda: Intro y beneficios -->
      <div ref="introElement" class="register-intro">
        <!-- Tipografía cinética con split-words -->
        <h1 class="register-split-heading" aria-label="Comienza tu próxima aventura.">
          <span class="split-line">
            <span class="split-word">Comienza</span>
            <span class="split-word">tu</span>
          </span>
          <span class="split-line">
            <span class="split-word">próxima</span>
            <span class="split-word split-word--highlight"><em>aventura.</em></span>
          </span>
        </h1>

        <p class="register-intro-copy">
          Regístrate para reservar expediciones exclusivas, personalizar tus rutas y viajar con la certeza de guías locales en cada destino.
        </p>

        <!-- Credencial de Viajero Cactours -->
        <div class="passport-board" role="region" aria-label="Beneficios de tu pasaporte de viajero">
          <header class="passport-head">
            <span class="passport-title">
              <Compass :size="14" aria-hidden="true" />
              PASAPORTE DE VIAJERO
            </span>
            <span class="passport-series">
              <i aria-hidden="true"></i>SERIE CO · 2026
            </span>
          </header>

          <div class="passport-privileges">
            <article class="privilege-card">
              <div class="privilege-icon">01</div>
              <div class="privilege-body">
                <strong>Rutas Nativas y Comunitarias</strong>
                <p>Acceso directo a comunidades Wayuu y parajes protegidos sin intermediarios masivos.</p>
              </div>
            </article>

            <article class="privilege-card">
              <div class="privilege-icon">02</div>
              <div class="privilege-body">
                <strong>Cupos Protegidos en Temporada</strong>
                <p>Prioridad en reservas de alta demanda, convoyes 4x4 y salidas exclusivas de velero.</p>
              </div>
            </article>

            <article class="privilege-card">
              <div class="privilege-icon">03</div>
              <div class="privilege-body">
                <strong>Bitácora y Soporte Satelital</strong>
                <p>Itinerarios offline en tu perfil y asistencia continua en territorio colombiano.</p>
              </div>
            </article>
          </div>

          <footer class="passport-metrics">
            <div class="metric-item">
              <strong>+48</strong>
              <small>DESTINOS</small>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <strong>100%</strong>
              <small>GUÍAS LOCALES</small>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <strong>24 / 7</strong>
              <small>SOPORTE</small>
            </div>
          </footer>
        </div>
      </div>

      <!-- Card principal 3D de Registro con Spotlight interactivo y Border-Beam -->
      <section
        ref="panelElement"
        class="register-panel spotlight-card--flat"
        @mousemove="handleCardMouseMove"
        @mouseleave="handleCardMouseLeave"
      >
        <div class="border-beam" aria-hidden="true"></div>

        <div class="register-panel-heading form-stagger-item">
          <div class="register-panel-emblem"><Sparkles :size="19" :stroke-width="1.6" aria-hidden="true" /></div>
          <p class="register-panel-status" aria-live="polite">
            <span></span>{{ panelStatus }}
          </p>
        </div>

        <p class="register-eyebrow form-stagger-item">NUEVO VIAJERO</p>

        <!-- Título del panel con letras animadas -->
        <h2 id="register-title" class="register-split-heading form-stagger-item" aria-label="Crea tu cuenta en Cactours.">
          <span class="split-line">
            <span class="split-word">Crea</span>
            <span class="split-word">tu</span>
          </span>
          <span class="split-line">
            <span class="split-word">cuenta</span>
            <span class="split-word">en</span>
            <span class="split-word split-word--highlight"><em>Cactours.</em></span>
          </span>
        </h2>

        <p class="register-description form-stagger-item">
          Solo te tomará un minuto unirte a nuestra comunidad de exploradores.
        </p>

        <p v-if="authStore.error" class="register-error form-stagger-item" role="alert">
          <span class="register-error-mark">!</span>
          {{ authStore.error }}
        </p>

        <form class="register-form" @submit.prevent="submitRegister">
          <!-- Cuadrícula 2 columnas: Nombre y Apellido -->
          <div class="register-fields-row">
            <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'nombre' }">
              <label for="reg-nombre">Nombre</label>
              <div class="register-input-wrap">
                <User :size="16" aria-hidden="true" />
                <input
                  id="reg-nombre"
                  v-model="form.nombre"
                  type="text"
                  autocomplete="given-name"
                  placeholder="Tu nombre"
                  required
                  @focus="focusedField = 'nombre'"
                  @blur="focusedField = ''"
                />
                <span class="register-field-index">01</span>
              </div>
            </div>

            <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'apellido' }">
              <label for="reg-apellido">Apellido</label>
              <div class="register-input-wrap">
                <UserCheck :size="16" aria-hidden="true" />
                <input
                  id="reg-apellido"
                  v-model="form.apellido"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Tu apellido"
                  required
                  @focus="focusedField = 'apellido'"
                  @blur="focusedField = ''"
                />
                <span class="register-field-index">02</span>
              </div>
            </div>
          </div>

          <!-- Cuadrícula 2 columnas: Documento y Teléfono -->
          <div class="register-fields-row">
            <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'identificacion' }">
              <label for="reg-id">Documento de identidad</label>
              <div class="register-input-wrap">
                <CreditCard :size="16" aria-hidden="true" />
                <input
                  id="reg-id"
                  v-model="form.identificacion"
                  type="text"
                  autocomplete="off"
                  placeholder="N° de documento"
                  required
                  @focus="focusedField = 'identificacion'"
                  @blur="focusedField = ''"
                />
                <span class="register-field-index">03</span>
              </div>
            </div>

            <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'telefono' }">
              <label for="reg-telefono">Teléfono</label>
              <div class="register-input-wrap">
                <Phone :size="16" aria-hidden="true" />
                <input
                  id="reg-telefono"
                  v-model="form.telefono"
                  type="tel"
                  autocomplete="tel"
                  placeholder="+57 300 000 0000"
                  required
                  @focus="focusedField = 'telefono'"
                  @blur="focusedField = ''"
                />
                <span class="register-field-index">04</span>
              </div>
            </div>
          </div>

          <!-- Correo electrónico (ancho completo) -->
          <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'correo' }">
            <label for="reg-correo">Correo electrónico</label>
            <div class="register-input-wrap">
              <AtSign :size="16" aria-hidden="true" />
              <input
                id="reg-correo"
                v-model="form.correo"
                type="email"
                autocomplete="email"
                placeholder="viajero@correo.com"
                required
                @focus="focusedField = 'correo'"
                @blur="focusedField = ''"
              />
              <span class="register-field-index">05</span>
            </div>
          </div>

          <!-- Contraseña (ancho completo) -->
          <div class="register-field form-stagger-item" :class="{ 'is-focused': focusedField === 'password' }">
            <label for="reg-password">Contraseña · mínimo 8 caracteres</label>
            <div class="register-input-wrap">
              <LockKeyhole :size="16" aria-hidden="true" />
              <input
                id="reg-password"
                v-model="form.password"
                :type="passwordVisible ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                placeholder="Crea una contraseña segura"
                required
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
              <button
                class="register-password-toggle"
                type="button"
                :aria-label="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="passwordVisible"
                aria-controls="reg-password"
                @click="passwordVisible = !passwordVisible"
              >
                <Eye v-if="!passwordVisible" :size="16" aria-hidden="true" />
                <EyeOff v-else :size="16" aria-hidden="true" />
              </button>
              <span class="register-field-index">06</span>
            </div>
          </div>

          <!-- Botón de submit principal -->
          <button
            type="submit"
            class="register-submit btn-accent magnetic-button form-stagger-item"
            :disabled="authStore.loading || isTransitioning"
          >
            <span>{{ authStore.loading ? 'Creando tu pasaporte...' : 'Comenzar mi viaje' }}</span>
            <span class="register-submit-arrow">
              <LoaderCircle v-if="authStore.loading" :size="17" class="register-spinner" aria-hidden="true" />
              <ArrowRight v-else :size="17" aria-hidden="true" />
            </span>
          </button>
        </form>

        <div class="register-panel-divider form-stagger-item"><span>¿YA FORMAS PARTE DE CACTOURS?</span></div>

        <!-- Botón animado de regreso al login -->
        <button
          type="button"
          class="register-login-link magnetic-button form-stagger-item"
          :disabled="isTransitioning"
          @click="navigateToLogin"
        >
          <span>Iniciar sesión</span>
          <ArrowRight :size="15" aria-hidden="true" />
        </button>

        <div class="register-panel-foot form-stagger-item">
          <ShieldCheck :size="15" aria-hidden="true" />
          <span>Protección SSL</span>
          <span class="register-panel-foot-dash"></span>
          <span>Tus datos viajan seguros con Cactours</span>
        </div>
      </section>
    </div>

    <footer class="register-footer">
      <span>HECHO PARA VIAJAR SIN PRISA</span>
      <span class="register-footer-route"><i></i><i></i><i></i></span>
      <span>LA GUAJIRA · COLOMBIA</span>
    </footer>

    <p v-if="videoError" class="register-video-error" role="status">{{ videoError }}</p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowRight,
  AtSign,
  Compass,
  CreditCard,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-vue-next'
import { gsap } from 'gsap'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const backgroundVideo = ref(null)
const introElement = ref(null)
const panelElement = ref(null)

const form = reactive({
  nombre: '',
  apellido: '',
  identificacion: '',
  telefono: '',
  correo: '',
  password: '',
})

const passwordVisible = ref(false)
const focusedField = ref('')
const videoPlaying = ref(false)
const videoError = ref('')
const prefersReducedMotion = ref(false)
const isTransitioning = ref(false)

let motionPreference
let entranceTimeline
let xTo
let yTo

const panelStatus = computed(() => {
  if (authStore.loading) return 'PREPARANDO TU CUENTA'
  if (focusedField.value) return 'COMPLETANDO PASAPORTE'
  return 'REGISTRO SEGURO'
})

// Parallax 3D interactivo y spotlight reactivo (Ultra-fluido con gsap.quickTo)
function handleCardMouseMove(e) {
  if (prefersReducedMotion.value || !panelElement.value || isTransitioning.value) return
  const rect = panelElement.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  panelElement.value.style.setProperty('--spotlight-x', `${x}px`)
  panelElement.value.style.setProperty('--spotlight-y', `${y}px`)

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

// Transición 3D cinematográfica hacia la pantalla de login
function navigateToLogin() {
  if (isTransitioning.value) return
  isTransitioning.value = true

  if (prefersReducedMotion.value) {
    router.push('/login')
    return
  }

  const exitTl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      router.push('/login')
    },
  })

  exitTl
    .to(panelElement.value, {
      x: 90,
      rotateY: 16,
      scale: 0.91,
      opacity: 0,
      filter: 'blur(12px)',
      duration: 0.48,
    })
    .to(
      introElement.value,
      {
        x: 50,
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

  if (prefersReducedMotion.value) {
    backgroundVideo.value?.pause()
    return
  }

  // Inicializar listeners rápidos para el tilt 3D a 60/120fps sin recargas
  if (panelElement.value) {
    xTo = gsap.quickTo(panelElement.value, 'rotateY', { duration: 0.45, ease: 'power2.out' })
    yTo = gsap.quickTo(panelElement.value, 'rotateX', { duration: 0.45, ease: 'power2.out' })
  }

  // Master Entrance Animation Timeline (Llegada suave desde la derecha)
  entranceTimeline = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => {
      // Limpiar filtros temporales tras la entrada
      if (panelElement.value) {
        gsap.set(panelElement.value, { clearProps: 'filter' })
      }
    },
  })

  // 1. Orbes ambientales
  entranceTimeline.fromTo(
    '.ambient-orb',
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 0.5, duration: 1.8, stagger: 0.2, ease: 'power2.out' },
    0,
  )

  // 2. Entrada de la columna intro
  entranceTimeline.fromTo(
    introElement.value,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.9 },
    0.1,
  )

  // 3. Letras animadas en H1
  entranceTimeline.fromTo(
    '.register-intro .split-word',
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

  // 4. Copia y tarjeta de pasaporte de viajero
  entranceTimeline.fromTo(
    ['.register-intro-copy', '.passport-board'],
    { y: 22, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12 },
    0.45,
  )

  // 5. Entrada 3D de la Card de Registro (Llegando suavemente con rotación)
  entranceTimeline.fromTo(
    panelElement.value,
    {
      x: 60,
      scale: 0.92,
      rotateY: -10,
      opacity: 0,
      filter: 'blur(12px)',
    },
    {
      x: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.15,
      ease: 'power3.out',
    },
    0.25,
  )

  // 6. Letras animadas en H2
  entranceTimeline.fromTo(
    '.register-panel .split-word',
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
      stagger: 0.045,
      ease: 'power4.out',
    },
    0.45,
  )

  // 7. Cascada de campos de registro
  entranceTimeline.fromTo(
    '.form-stagger-item',
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.045, ease: 'power2.out' },
    0.55,
  )
})

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
  entranceTimeline?.kill()
})

async function submitRegister() {
  try {
    await authStore.register(form)
    router.push('/mi-perfil')
  } catch {
    // El store expone el error junto al formulario.
  }
}
</script>

<style scoped>
.register-experience {
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

.register-backdrop,
.register-film,
.register-grain {
  position: absolute;
  z-index: -3;
  inset: 0;
  width: 100%;
  height: 100%;
}

.register-backdrop {
  object-fit: cover;
  object-position: center 54%;
  filter: saturate(0.82) brightness(0.72);
  transform: scale(1.025);
}

.register-film {
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(4, 17, 19, 0.84) 0%, rgba(5, 23, 24, 0.58) 42%, rgba(4, 18, 19, 0.44) 72%, rgba(4, 16, 18, 0.72) 100%),
    linear-gradient(0deg, rgba(3, 15, 17, 0.8), transparent 34%, rgba(3, 15, 17, 0.32));
}

.register-grain {
  z-index: -1;
  pointer-events: none;
  opacity: 0.18;
  background-image: radial-gradient(rgba(255, 255, 255, 0.7) 0.45px, transparent 0.65px);
  background-size: 4px 4px;
  mask-image: linear-gradient(90deg, #000, transparent 80%);
}

.register-panel-status > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a4e1d3;
  box-shadow: 0 0 0 4px rgba(164, 225, 211, 0.13), 0 0 16px rgba(164, 225, 211, 0.7);
  animation: register-signal 2.2s ease-in-out infinite;
}

/* Orbes atmosféricos */
.register-ambient-canvas {
  position: absolute;
  inset: -15% -10%;
  pointer-events: none;
  z-index: -1;
  overflow: visible;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(95px);
  opacity: 0.45;
  will-change: transform;
}

.ambient-orb--cyan {
  top: 10%;
  right: 15%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(6, 155, 224, 0.44) 0%, rgba(2, 99, 116, 0.18) 60%, transparent 80%);
  animation: reg-orb-drift-1 16s ease-in-out infinite alternate;
}

.ambient-orb--emerald {
  bottom: 8%;
  right: 5%;
  width: 490px;
  height: 490px;
  background: radial-gradient(circle, rgba(164, 225, 211, 0.38) 0%, rgba(12, 53, 54, 0.22) 65%, transparent 85%);
  animation: reg-orb-drift-2 18s ease-in-out infinite alternate;
}

.ambient-orb--gold {
  top: 30%;
  left: 2%;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(227, 168, 87, 0.25) 0%, rgba(2, 99, 116, 0.08) 60%, transparent 80%);
  animation: reg-orb-drift-3 20s ease-in-out infinite alternate;
}

@keyframes reg-orb-drift-1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-35px, 45px) scale(1.12); }
  100% { transform: translate(30px, -25px) scale(0.94); }
}

@keyframes reg-orb-drift-2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(45px, -40px) scale(1.1); }
  100% { transform: translate(-30px, 30px) scale(0.9); }
}

@keyframes reg-orb-drift-3 {
  0% { transform: translate(0, 0) scale(0.92); }
  50% { transform: translate(40px, 35px) scale(1.16); }
  100% { transform: translate(-25px, -40px) scale(1); }
}

.register-layout {
  position: relative;
  display: grid;
  width: min(100%, 1240px);
  flex: 1;
  align-items: center;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 480px);
  gap: clamp(2rem, 5vw, 6.5rem);
  margin: 0 auto;
  padding: 0.5rem 0;
  perspective: 1200px;
}

.register-intro {
  position: relative;
  align-self: center;
  max-width: 620px;
  padding: 0.5rem 0;
}

.register-orbit {
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

.register-orbit::before,
.register-orbit::after {
  position: absolute;
  border: 1px solid rgba(228, 249, 242, 0.14);
  border-radius: 50%;
  content: '';
}

.register-orbit::before {
  inset: 12%;
}

.register-orbit::after {
  inset: 25%;
  border-style: dashed;
  animation: register-orbit-spin 46s linear infinite;
}

.register-orbit-core {
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

.register-orbit-point {
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

.register-kicker,
.register-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0;
  color: #b7e9dd;
  font-size: 0.61rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.register-kicker > span {
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

/* Tipografía animada Split-Words */
.register-split-heading {
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
  animation: reg-text-shimmer-flow 5s linear infinite;
  font-style: italic;
}

@keyframes reg-text-shimmer-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 240% 50%;
  }
}

.register-intro-copy {
  max-width: 440px;
  margin: 0;
  color: rgba(255, 255, 255, 0.77);
  font-size: clamp(0.85rem, 1.15vw, 0.96rem);
  line-height: 1.75;
}

/* Pasaporte de Viajero Cactours (Register hero companion) */
.passport-board {
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

.passport-board::before {
  position: absolute;
  top: 0;
  right: 1.5rem;
  left: 1.5rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(210, 249, 237, 0.75), transparent);
  content: '';
  pointer-events: none;
}

.passport-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.22em;
}

.passport-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #b7e9dd;
  text-transform: uppercase;
}

.passport-series {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}

.passport-series i {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #a4e1d3;
  box-shadow: 0 0 10px rgba(164, 225, 211, 0.85);
  animation: passport-blink 1.6s ease-in-out infinite;
}

@keyframes passport-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}

.passport-privileges {
  display: grid;
  gap: 0.5rem;
}

.privilege-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  padding: 0.55rem 0.75rem;
  background: rgba(14, 35, 37, 0.45);
  transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
}

.privilege-card:hover {
  transform: translateX(4px);
  border-color: rgba(164, 225, 211, 0.4);
  background: rgba(14, 35, 37, 0.75);
}

.privilege-icon {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border: 1px solid rgba(183, 233, 221, 0.35);
  border-radius: 6px;
  color: #b7e9dd;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  background: rgba(164, 225, 211, 0.08);
}

.privilege-body {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.privilege-body strong {
  color: #f2fbf7;
  font-size: 0.73rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.privilege-body p {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.66rem;
  line-height: 1.4;
}

.passport-metrics {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 0.75rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.14);
  padding-top: 0.65rem;
}

.metric-item {
  display: grid;
  place-items: center;
  gap: 0.15rem;
}

.metric-item strong {
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.metric-item small {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.46rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.metric-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
}

/* Card 3D principal de Registro con Spotlight interactivo */
.register-panel {
  position: relative;
  width: 100%;
  max-width: 470px;
  justify-self: end;
  overflow: hidden;
  border: 1px solid rgba(239, 255, 249, 0.28);
  border-radius: 24px;
  padding: clamp(1.15rem, 2vw, 1.65rem);
  background:
    radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 30%), rgba(6, 155, 224, 0.18), transparent 60%),
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

/* Border Beam: Haz de luz giratorio */
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
  animation: reg-border-beam-rotate 7.5s linear infinite;
}

@property --beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes reg-border-beam-rotate {
  from {
    --beam-angle: 0deg;
    transform: rotate(0deg);
  }
  to {
    --beam-angle: 360deg;
    transform: rotate(360deg);
  }
}

.register-panel::after {
  position: absolute;
  top: 0;
  right: 2rem;
  left: 2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(210, 249, 237, 0.8), transparent);
  content: '';
  pointer-events: none;
}

.register-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.register-panel-emblem {
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

.register-panel-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: rgba(231, 249, 243, 0.78);
  font-size: 0.51rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.register-panel-status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a4e1d3;
  box-shadow: 0 0 12px rgba(164, 225, 211, 0.7);
}

.register-eyebrow {
  color: #b7e9dd;
  font-size: 0.54rem;
  letter-spacing: 0.17em;
}

.register-panel .register-split-heading {
  margin: 0.35rem 0 0;
  color: #fff;
  font-size: clamp(1.75rem, 2.3vw, 2.2rem);
  font-weight: 600;
  letter-spacing: -0.065em;
  line-height: 1.05;
}

.register-description {
  margin: 0.35rem 0 0.85rem;
  color: rgba(244, 250, 247, 0.7);
  font-size: 0.75rem;
  line-height: 1.5;
}

.register-error {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin: 0 0 1rem;
  border: 1px solid rgba(255, 177, 166, 0.36);
  border-radius: 12px;
  padding: 0.68rem 0.8rem;
  background: rgba(110, 30, 25, 0.34);
  color: #ffe2dc;
  font-size: 0.74rem;
  line-height: 1.55;
}

.register-error-mark {
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

.register-form {
  display: grid;
  gap: 0.55rem;
}

.register-fields-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.register-field {
  min-width: 0;
}

.register-field label {
  display: block;
  margin: 0 0 0.25rem 0.15rem;
  color: rgba(244, 250, 247, 0.88);
  font-size: 0.65rem;
  font-weight: 700;
}

.register-input-wrap {
  position: relative;
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 11px;
  padding: 0 0.75rem;
  background: rgba(2, 15, 17, 0.34);
  box-shadow:
    inset 4px 4px 10px rgba(0, 0, 0, 0.2),
    inset -3px -3px 9px rgba(255, 255, 255, 0.03),
    0 1px rgba(255, 255, 255, 0.06);
  color: rgba(197, 237, 225, 0.84);
  transition: border-color 220ms ease, box-shadow 220ms ease, background-color 220ms ease;
}

.register-input-wrap:focus-within,
.register-field.is-focused .register-input-wrap {
  border-color: rgba(168, 231, 214, 0.78);
  background: rgba(3, 24, 25, 0.56);
  box-shadow:
    inset 4px 4px 10px rgba(0, 0, 0, 0.18),
    0 0 0 3px rgba(153, 226, 208, 0.12),
    0 0 24px rgba(124, 219, 194, 0.09);
}

.register-input-wrap input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 0.7rem 0;
  background: transparent;
  color: #fff;
  font-size: 0.77rem;
}

.register-input-wrap input::placeholder {
  color: rgba(231, 244, 239, 0.4);
}

.register-input-wrap input:focus-visible {
  outline: 0;
}

.register-field-index {
  color: rgba(230, 245, 239, 0.38);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  transition: color 200ms ease;
}

.register-field.is-focused .register-field-index {
  color: #a4e1d3;
}

.register-password-toggle {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: rgba(235, 249, 244, 0.68);
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}

.register-password-toggle:hover {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.register-password-toggle:focus-visible,
.register-submit:focus-visible,
.register-login-link:focus-visible {
  outline: 2px solid #bdebdc;
  outline-offset: 3px;
}

.register-submit {
  position: relative;
  overflow: hidden;
  display: flex;
  width: 100%;
  min-height: 46px;
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

.register-submit::before {
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

.register-submit:hover:not(:disabled)::before {
  left: 150%;
}

.register-submit:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: 0 16px 36px rgba(103, 207, 177, 0.35), inset 0 1px rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
}

.register-submit:disabled {
  cursor: wait;
  filter: saturate(0.72);
  opacity: 0.8;
}

.register-submit-arrow {
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

.register-submit:hover:not(:disabled) .register-submit-arrow {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.43);
}

.register-spinner {
  animation: register-orbit-spin 1s linear infinite;
}

.register-panel-divider {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0.65rem 0 0.45rem;
  color: rgba(240, 249, 245, 0.52);
  font-size: 0.47rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.register-panel-divider::before,
.register-panel-divider::after {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.19));
  content: '';
}

.register-panel-divider::after {
  transform: rotate(180deg);
}

.register-login-link {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.21);
  border-radius: 11px;
  background: transparent;
  color: #effaf5;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.71rem;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 200ms ease, background-color 200ms ease, transform 180ms var(--motion-spring);
}

.register-login-link:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.register-panel-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.6rem;
  color: rgba(237, 248, 243, 0.58);
  font-size: 0.51rem;
}

.register-panel-foot svg {
  color: #b5e7d8;
}

.register-panel-foot-dash {
  width: 14px;
  height: 1px;
  margin: 0 0.15rem;
  background: rgba(255, 255, 255, 0.32);
}

.register-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.49rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.register-footer-route {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.register-footer-route i {
  width: 4px;
  height: 4px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.register-footer-route i:nth-child(2) {
  width: 32px;
  height: 1px;
  border: 0;
  background: rgba(255, 255, 255, 0.55);
}

.register-video-error {
  position: absolute;
  right: 1.5rem;
  bottom: 3.4rem;
  margin: 0;
  color: #fff;
  font-size: 0.7rem;
}

@keyframes register-orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes register-signal {
  50% {
    opacity: 0.55;
    box-shadow: 0 0 0 6px rgba(164, 225, 211, 0.08), 0 0 12px rgba(164, 225, 211, 0.42);
  }
}

@media (max-width: 960px) {
  .register-experience {
    padding-right: clamp(1.25rem, 5vw, 3rem);
    padding-left: clamp(1.25rem, 5vw, 3rem);
  }

  .register-layout {
    max-width: 640px;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.3rem;
    padding: 2.5rem 0;
  }

  .register-intro {
    max-width: 600px;
    padding-top: 0.5rem;
  }

  .register-intro h1,
  .register-intro .register-split-heading {
    max-width: 580px;
    font-size: clamp(3rem, 8.5vw, 4.6rem);
  }

  .register-intro-copy {
    max-width: 480px;
  }

  .register-orbit {
    top: -4rem;
    right: 1rem;
    width: clamp(190px, 30vw, 260px);
  }

  .register-panel {
    max-width: 540px;
    justify-self: center;
  }

  .passport-board {
    margin-top: 1.5rem;
  }
}

@media (max-width: 560px) {
  .register-experience {
    min-height: 100svh;
    padding: 4.5rem 1rem 1.1rem;
  }

  .register-live-indicator i {
    width: 5px;
    height: 5px;
  }

  .register-video-toggle {
    min-height: 32px;
    padding: 0.25rem 0.6rem;
    font-size: 0.56rem;
  }

  .register-layout {
    gap: 1.2rem;
    padding: 1.8rem 0 1.2rem;
  }

  .register-intro {
    padding: 0;
  }

  .register-orbit {
    top: -2.4rem;
    right: -1.6rem;
    width: 155px;
    opacity: 0.5;
  }

  .register-orbit-core {
    width: 38px;
    height: 38px;
  }

  .register-kicker {
    gap: 0.5rem;
    font-size: 0.48rem;
    letter-spacing: 0.11em;
  }

  .register-kicker > span {
    width: 24px;
    height: 24px;
    font-size: 0.5rem;
  }

  .register-split-heading {
    margin: 0.75rem 0 0.55rem;
    font-size: clamp(2.5rem, 11.5vw, 3.4rem);
  }

  .register-intro-copy {
    max-width: 380px;
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .passport-board {
    display: none;
  }

  .register-panel {
    border-radius: 23px;
    padding: 1.25rem 1.1rem 1.15rem;
  }

  .register-panel-heading {
    margin-bottom: 0.95rem;
  }

  .register-panel-emblem {
    width: 35px;
    height: 35px;
    border-radius: 11px;
  }

  .register-panel-status {
    font-size: 0.45rem;
    letter-spacing: 0.1em;
  }

  .register-panel .register-split-heading {
    font-size: 1.95rem;
  }

  .register-description {
    margin: 0.5rem 0 1rem;
    font-size: 0.72rem;
  }

  .register-fields-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  .register-form {
    gap: 0.75rem;
  }

  .register-input-wrap {
    min-height: 47px;
  }

  .register-submit {
    min-height: 48px;
  }

  .register-submit-arrow {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .register-panel-divider {
    margin-top: 0.9rem;
  }

  .register-panel-foot {
    margin-top: 0.85rem;
    font-size: 0.48rem;
  }

  .register-footer {
    font-size: 0.42rem;
    letter-spacing: 0.1em;
  }

  .register-footer-route i:nth-child(2) {
    width: 18px;
  }
}

@media (max-width: 360px) {
  .register-split-heading {
    font-size: 2.3rem;
  }

  .register-panel-foot {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .register-orbit::after,
  .register-live-indicator i,
  .register-panel-status > span,
  .register-spinner,
  .ambient-orb,
  .border-beam,
  .float-card,
  .split-word--highlight em {
    animation: none !important;
  }

  .register-backdrop {
    transform: none;
  }

  .register-panel {
    transform: none !important;
  }
}
</style>
