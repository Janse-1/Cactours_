<template>
  <section id="territorios" ref="sectionElement" class="showroom-section">
    <div class="container">
      <header class="showroom-heading" data-showroom-enter>
        <div>
          <p class="showroom-kicker"><span></span> Atlas de expediciones · 3D interactivo</p>
          <h2>Los destinos no se miran.<br /><em>Se recorren.</em></h2>
        </div>
        <p class="showroom-intro">
          Gira el atlas, elige un paisaje y empieza a imaginar tu próxima historia.
        </p>
      </header>

      <p v-if="error" class="showroom-api-note" role="status">
        No pudimos consultar el catálogo. Te mostramos los destinos de Cactours mientras vuelve.
      </p>

      <div class="showroom-layout">
        <div class="showroom-visual" data-showroom-enter>
          <div
            ref="stageElement"
            class="showroom-stage"
            :class="{ 'showroom-stage--fallback': webglUnavailable }"
            role="group"
            aria-label="Galería 3D de expediciones"
          >
            <div class="stage-grid" aria-hidden="true"></div>
            <img
              v-if="!webglUnavailable && activeTour.image"
              :key="activeTour.id"
              class="stage-ambient-image"
              :src="activeTour.image"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <div ref="sceneElement" class="scene-mount" aria-hidden="true"></div>

            <img
              v-if="webglUnavailable && activeTour.image"
              class="stage-fallback-image"
              :src="activeTour.image"
              :alt="activeTour.alt"
              @error="handleFallbackImageError"
            />
            <div v-else-if="webglUnavailable" class="stage-fallback-empty" role="img" :aria-label="activeTour.destination">
              <Compass :size="40" aria-hidden="true" />
              <span>{{ activeTour.destination }}</span>
            </div>

            <div class="stage-vignette" aria-hidden="true"></div>
            <div class="stage-topline">
              <span class="stage-brand"><Compass :size="15" aria-hidden="true" /> CACTOURS / ATLAS</span>
              <span class="stage-coordinate">{{ isLocalCollection ? 'DESTINOS CACTOURS' : 'TOURS CACTOURS' }}</span>
            </div>

            <div class="stage-index" aria-live="polite">
              <span>{{ isLocalCollection ? 'DESTINO' : 'TOUR' }}</span>
              <strong>{{ String(activeIndex + 1).padStart(2, '0') }}</strong>
              <i>/ {{ String(displayTours.length).padStart(2, '0') }}</i>
            </div>

            <div class="stage-bottomline">
              <span class="stage-live-dot"></span>
              <span>{{ webglUnavailable ? 'Vista fotográfica' : 'Atlas inmersivo' }}</span>
              <span class="stage-bottomline__rule"></span>
              <span>{{ activeTour.destination }}</span>
            </div>

            <p v-if="sceneLoading" class="stage-status" role="status">Abriendo el atlas 3D...</p>
            <p v-else-if="webglUnavailable" class="stage-status" role="status">
              Este dispositivo no ofrece WebGL; mostramos una vista fotográfica.
            </p>
            <p v-if="assetError" class="stage-asset-error" role="alert">
              Una imagen no pudo cargarse. Prueba otra ruta.
            </p>
          </div>

          <div class="showroom-legend">
            <span class="legend-mark" aria-hidden="true"></span>
            <span>
              {{ isLocalCollection ? 'Fotografías de destinos · disponibilidad por confirmar' : 'Tours publicados por Cactours' }}
            </span>
            <span class="legend-hint">Arrastra para girar · o elige una postal</span>
          </div>
        </div>

        <aside class="showroom-detail" aria-live="polite" data-showroom-enter>
          <div class="detail-topline">
            <span class="detail-category">{{ activeTour.category }}</span>
          </div>

          <p class="detail-location">
            <MapPin :size="15" aria-hidden="true" />
            {{ activeTour.destination }}
          </p>
          <h3>{{ activeTour.name }}</h3>
          <p class="detail-description">{{ activeTour.description }}</p>

          <div class="detail-facts">
            <div v-if="!isLocalCollection">
              <span>Duración</span>
              <strong>{{ activeTour.duration }}</strong>
            </div>
            <div v-if="!isLocalCollection && activeTour.price">
              <span>Desde</span>
              <strong>{{ activeTour.price }}</strong>
            </div>
            <div v-if="isLocalCollection">
              <span>Estado</span>
              <strong>Consulta disponibilidad</strong>
            </div>
          </div>

          <div v-if="activeTour.creditUrl" class="photo-credit">
            Foto:
            <a :href="activeTour.creditUrl" target="_blank" rel="noreferrer">
              {{ activeTour.creditName }} · {{ activeTour.license }}
            </a>
          </div>

          <div class="showroom-actions">
            <div class="showroom-controls" aria-label="Cambiar expedición">
              <button type="button" aria-label="Expedición anterior" @click="showPrevious">
                <ArrowLeft :size="19" aria-hidden="true" />
              </button>
              <div class="showroom-pagination" aria-label="Seleccionar expedición">
                <button
                  v-for="(tour, index) in displayTours"
                  :key="tour.id"
                  type="button"
                  :aria-label="`Ver ${tour.name}`"
                  :aria-current="index === activeIndex ? 'true' : undefined"
                  :class="{ 'pagination-dot--active': index === activeIndex }"
                  @click="selectTour(index)"
                ></button>
              </div>
              <button type="button" aria-label="Siguiente expedición" @click="showNext">
                <ArrowRight :size="19" aria-hidden="true" />
              </button>
            </div>

            <a
              v-if="isLocalCollection"
              :href="activeTour.contactUrl"
              class="detail-cta"
            >
              Consultar disponibilidad
              <ArrowUpRight :size="17" aria-hidden="true" />
            </a>
            <RouterLink
              v-else
              :to="`/tours/${activeTour.id}`"
              class="detail-cta"
            >
              Ver detalles
              <ArrowUpRight :size="17" aria-hidden="true" />
            </RouterLink>
          </div>

          <p v-if="isLocalCollection" class="media-disclaimer">
            Itinerario, precio y cupos se confirman directamente con nuestro equipo.
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import { 
  ClampToEdgeWrapping, 
  DoubleSide, 
  SRGBColorSpace, 
  PerspectiveCamera, 
  BoxGeometry, 
  IcosahedronGeometry, 
  PlaneGeometry, 
  TorusGeometry, 
  Raycaster, 
  Group, 
  Mesh, 
  MeshBasicMaterial, 
  TextureLoader, 
  MathUtils, 
  Vector2, 
  Scene, 
  WebGLRenderer 
} from 'three'
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, MapPin } from 'lucide-vue-next'
import { resolveTourCover, tourMediaShowcases } from '@/data/tourMedia'

const props = defineProps({
  tours: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: null,
  },
})

const sectionElement = ref(null)
const sceneElement = ref(null)
const stageElement = ref(null)
const activeIndex = ref(0)
const sceneLoading = ref(true)
const webglUnavailable = ref(false)
const assetError = ref(false)

const isLocalCollection = computed(() => props.tours.length === 0)
const displayTours = computed(() => {
  if (!props.tours.length) {
    return tourMediaShowcases.map((tour) => ({
      ...tour,
      image: tour.gallery[0]?.url || '',
      alt: tour.gallery[0]?.alt || tour.name,
    }))
  }

  return props.tours.slice(0, 8).map((tour) => ({
    id: tour.id,
    name: tour.nombre_tour,
    destination: tour.ciudad_destino,
    duration: tour.duracion_dias
      ? `${tour.duracion_dias} ${tour.duracion_dias === 1 ? 'día' : 'días'}`
      : '',
    category: 'Expedición Cactours',
    description: tour.descripcion,
    image: resolveTourCover(tour),
    alt: `Paisaje de ${tour.ciudad_destino}`,
    price: tour.costo_num
      ? new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(tour.costo_num)
      : '',
    contactUrl: '',
  }))
})

const activeTour = computed(() => displayTours.value[activeIndex.value] || displayTours.value[0] || tourMediaShowcases[0])

let scene
let camera
let renderer
let orbitGroup
let ringCards = []
let photoPlanes = []
let resizeObserver
let entranceObserver
let rotationTween
let sceneReady = false
let canvasPointerMove
let canvasPointerDown
let canvasPointerUp
let canvasPointerCancel
let raycaster
let pointer
let dragStartX = 0
let dragStartRotation = 0
let isDragging = false
let didDrag = false

function selectTour(index) {
  const count = displayTours.value.length
  if (!count) return
  activeIndex.value = (index + count) % count
}

function showPrevious() {
  selectTour(activeIndex.value - 1)
}

function showNext() {
  selectTour(activeIndex.value + 1)
}

function releaseObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (!child.material) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((material) => {
      if (material.map) material.map.dispose()
      material.dispose()
    })
  })
}

function clearCards() {
  if (!orbitGroup) return
  ringCards.forEach((card) => {
    orbitGroup.remove(card)
    releaseObject(card)
  })
  ringCards = []
  photoPlanes = []
}

function coverTexture(texture, width, height) {
  const imageAspect = texture.image.width / texture.image.height
  const planeAspect = width / height
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping

  if (imageAspect > planeAspect) {
    texture.repeat.x = planeAspect / imageAspect
    texture.offset.x = (1 - texture.repeat.x) / 2
  } else {
    texture.repeat.y = imageAspect / planeAspect
    texture.offset.y = (1 - texture.repeat.y) / 2
  }
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.needsUpdate = true
}

function buildCards() {
  if (!sceneReady || !orbitGroup) return

  clearCards()
  const tours = displayTours.value
  const visibleTours = tours.slice(0, 8)
  const step = (Math.PI * 2) / visibleTours.length
  const radius = visibleTours.length > 4 ? 4.15 : 3.55
  const textureLoader = new TextureLoader()

  visibleTours.forEach((tour, index) => {
    const angle = step * index
    const card = new Group()
    const width = 2.8
    let height = 1.85
    const minPhotoHeight = 1.55
    const maxPhotoHeight = 2.35
    const frame = new Mesh(
      new BoxGeometry(width + 0.1, height + 0.1, 0.08),
      [
        new MeshBasicMaterial({ color: 0x173c3d }),
        new MeshBasicMaterial({ color: 0x173c3d }),
        new MeshBasicMaterial({ color: 0x173c3d }),
        new MeshBasicMaterial({ color: 0x173c3d }),
        new MeshBasicMaterial({ color: 0xd7e9e1 }),
        new MeshBasicMaterial({ color: 0x173c3d }),
      ],
    )
    card.add(frame)

    const photoMaterial = new MeshBasicMaterial({
      color: 0x52746d,
      side: DoubleSide,
    })
    const photo = new Mesh(new PlaneGeometry(width, height), photoMaterial)
    photo.position.z = 0.047
    photo.userData.tourIndex = index
    card.add(photo)
    photoPlanes.push(photo)

    if (tour.image) {
      textureLoader.load(
        tour.image,
        (texture) => {
          if (!sceneReady || card.parent !== orbitGroup) {
            texture.dispose()
            return
          }
          const imageAspect = texture.image.width / texture.image.height
          height = MathUtils.clamp(width / imageAspect, minPhotoHeight, maxPhotoHeight)
          frame.geometry.dispose()
          frame.geometry = new BoxGeometry(width + 0.1, height + 0.1, 0.08)
          photo.geometry.dispose()
          photo.geometry = new PlaneGeometry(width, height)
          coverTexture(texture, width, height)
          photoMaterial.map = texture
          photoMaterial.color.set(0xffffff)
          photoMaterial.needsUpdate = true
          renderScene()
        },
        undefined,
        (error) => {
          if (card.parent !== orbitGroup) return
          assetError.value = true
          console.error(`No se pudo cargar la imagen del tour "${tour.name}".`, error)
        },
      )
    }

    card.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius - 0.2)
    card.rotation.y = angle
    card.userData.tourIndex = index
    orbitGroup.add(card)
    ringCards.push(card)
  })

  setCarouselRotation(false)
  renderScene()
}

function renderScene() {
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function setCarouselRotation(animate = true) {
  if (!orbitGroup) return
  const step = (Math.PI * 2) / Math.max(displayTours.value.length, 1)
  const targetRotation = -activeIndex.value * step

  if (rotationTween) rotationTween.kill()
  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    orbitGroup.rotation.y = targetRotation
    renderScene()
    return
  }

  rotationTween = gsap.to(orbitGroup.rotation, {
    y: targetRotation,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: renderScene,
  })
}

function resizeScene() {
  if (!renderer || !camera || !sceneElement.value) return
  const { width, height } = sceneElement.value.getBoundingClientRect()
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
  renderScene()
}

function updatePointer(event) {
  if (!renderer || !raycaster || !pointer) return
  if (isDragging) {
    if (Math.abs(event.clientX - dragStartX) > 4) didDrag = true
    if (didDrag) {
      orbitGroup.rotation.y = dragStartRotation + (event.clientX - dragStartX) * 0.006
      renderScene()
    }
    renderer.domElement.style.cursor = 'grabbing'
    return
  }

  const bounds = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const intersections = raycaster.intersectObjects(photoPlanes, false)
  renderer.domElement.style.cursor = intersections.length ? 'pointer' : 'grab'
}

function chooseCard(event) {
  if (!renderer || !raycaster || !pointer) return
  const bounds = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const intersections = raycaster.intersectObjects(photoPlanes, false)
  if (intersections.length) selectTour(intersections[0].object.userData.tourIndex)
}

function beginOrbit(event) {
  if (event.button !== 0 || !renderer || !orbitGroup) return
  if (rotationTween) rotationTween.kill()
  isDragging = true
  didDrag = false
  dragStartX = event.clientX
  dragStartRotation = orbitGroup.rotation.y
  renderer.domElement.setPointerCapture(event.pointerId)
  renderer.domElement.style.cursor = 'grabbing'
}

function finishOrbit(event) {
  if (!isDragging || !renderer) return
  isDragging = false
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId)
  }

  if (didDrag) {
    const step = (Math.PI * 2) / Math.max(displayTours.value.length, 1)
    const previousIndex = activeIndex.value
    selectTour(Math.round(-orbitGroup.rotation.y / step))
    if (activeIndex.value === previousIndex) setCarouselRotation()
  } else {
    chooseCard(event)
  }

  didDrag = false
  renderer.domElement.style.cursor = 'grab'
}

function cancelOrbit(event) {
  if (!isDragging || !renderer) return
  isDragging = false
  didDrag = false
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId)
  }
  setCarouselRotation()
  renderer.domElement.style.cursor = 'grab'
}

function initializeScene() {
  const width = sceneElement.value.clientWidth
  const height = sceneElement.value.clientHeight
  if (!width || !height) throw new Error('El escenario 3D no tiene dimensiones visibles.')

  scene = new Scene()
  camera = new PerspectiveCamera(38, width / height, 0.1, 100)
  camera.position.set(0, 0, 10.8)

  renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setSize(width, height, false)
  renderer.domElement.className = 'showroom-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.cursor = 'grab'
  sceneElement.value.appendChild(renderer.domElement)

  const globe = new Mesh(
    new IcosahedronGeometry(1.55, 2),
    new MeshBasicMaterial({
      color: 0x9acfc3,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    }),
  )
  globe.position.set(0, 0, -1.6)
  scene.add(globe)

  const equator = new Mesh(
    new TorusGeometry(2.08, 0.009, 5, 120),
    new MeshBasicMaterial({ color: 0x6ab8ac, transparent: true, opacity: 0.48 }),
  )
  equator.position.z = -1.5
  equator.rotation.x = 1.1
  equator.rotation.y = -0.22
  scene.add(equator)

  const orbit = new Mesh(
    new TorusGeometry(2.32, 0.006, 5, 120),
    new MeshBasicMaterial({ color: 0x6ab8ac, transparent: true, opacity: 0.23 }),
  )
  orbit.position.z = -1.8
  orbit.rotation.x = 1.23
  orbit.rotation.y = 0.32
  scene.add(orbit)

  orbitGroup = new Group()
  scene.add(orbitGroup)
  raycaster = new Raycaster()
  pointer = new Vector2()
  canvasPointerMove = updatePointer
  canvasPointerDown = beginOrbit
  canvasPointerUp = finishOrbit
  canvasPointerCancel = cancelOrbit
  renderer.domElement.addEventListener('pointermove', canvasPointerMove)
  renderer.domElement.addEventListener('pointerdown', canvasPointerDown)
  renderer.domElement.addEventListener('pointerup', canvasPointerUp)
  renderer.domElement.addEventListener('pointercancel', canvasPointerCancel)

  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(sceneElement.value)

  sceneReady = true
  buildCards()
  sceneLoading.value = false
}

function handleFallbackImageError() {
  assetError.value = true
}

function observeEntrance() {
  if (!sectionElement.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  entranceObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      const targets = sectionElement.value.querySelectorAll('[data-showroom-enter]')
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power2.out' },
      )
      entranceObserver.disconnect()
    },
    { threshold: 0.12 },
  )
  entranceObserver.observe(sectionElement.value)
}

watch(
  () => props.tours.map((tour) => tour.id).join('|'),
  () => {
    activeIndex.value = 0
    if (sceneReady) buildCards()
  },
)

watch(activeIndex, () => setCarouselRotation())

onMounted(async () => {
  observeEntrance()
  try {
    if (sceneElement.value) initializeScene()
  } catch (error) {
    webglUnavailable.value = true
    sceneLoading.value = false
    console.error('No se pudo iniciar el showroom 3D; se muestra la alternativa fotográfica.', error)
  }
})

onBeforeUnmount(() => {
  if (entranceObserver) entranceObserver.disconnect()
  if (resizeObserver) resizeObserver.disconnect()
  if (rotationTween) rotationTween.kill()
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointermove', canvasPointerMove)
    renderer.domElement.removeEventListener('pointerdown', canvasPointerDown)
    renderer.domElement.removeEventListener('pointerup', canvasPointerUp)
    renderer.domElement.removeEventListener('pointercancel', canvasPointerCancel)
  }
  if (scene) releaseObject(scene)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  sceneReady = false
})
</script>

<style scoped>
.showroom-section {
  position: relative;
  overflow: hidden;
  padding: clamp(5.5rem, 10vw, 9.25rem) 0;
  background:
    radial-gradient(ellipse at 86% 16%, rgba(19, 110, 117, 0.13), transparent 34rem),
    var(--color-mineral-ivory);
}

.showroom-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
}

.showroom-kicker {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 1rem;
  color: var(--color-turquesa-cactours);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.showroom-kicker span {
  width: 25px;
  height: 1px;
  background: var(--color-azul-brillante);
}

.showroom-heading h2 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(2.8rem, 6vw, 5.6rem);
  font-weight: 600;
  letter-spacing: -0.08em;
  line-height: 0.98;
}

.showroom-heading h2 em {
  color: var(--color-turquesa-cactours);
  font-family: var(--font-editorial);
  font-weight: 500;
}

.showroom-intro {
  max-width: 325px;
  margin: 0 0 0.35rem;
  color: #53615e;
  font-size: 0.94rem;
  line-height: 1.8;
}

.showroom-api-note {
  margin: -1.5rem 0 1.25rem;
  color: #53615e;
  font-size: 0.82rem;
}

.showroom-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.62fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5.5rem);
}

.showroom-stage {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(164, 213, 203, 0.22);
  border-radius: 8px;
  background:
    radial-gradient(ellipse at 50% 45%, rgba(31, 102, 102, 0.66), transparent 38%),
    radial-gradient(ellipse at 50% 100%, #153e41, #08292e 68%);
  box-shadow: 0 30px 80px rgba(8, 41, 46, 0.2);
  perspective: 1300px;
  isolation: isolate;
}

.scene-mount,
.stage-grid,
.stage-vignette,
.stage-fallback-image,
.stage-fallback-empty {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.scene-mount {
  z-index: 1;
}

.stage-ambient-image {
  position: absolute;
  z-index: 0;
  inset: -4%;
  width: 108%;
  height: 108%;
  object-fit: cover;
  opacity: 0.22;
  filter: blur(28px) saturate(1.4);
  transform: scale(1.04);
  transition: opacity 400ms ease;
}

.showroom-stage--fallback .scene-mount {
  display: none;
}

:deep(.showroom-canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}

.stage-grid {
  z-index: -1;
  opacity: 0.21;
  background-image:
    linear-gradient(rgba(179, 231, 220, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(179, 231, 220, 0.11) 1px, transparent 1px);
  background-position: center center;
  background-size: 46px 46px;
  transform: perspective(350px) rotateX(68deg) scale(1.65) translateY(28%);
  transform-origin: center bottom;
}

.stage-vignette {
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(3, 21, 24, 0.45), transparent 24%, transparent 76%, rgba(3, 21, 24, 0.78)),
    radial-gradient(ellipse, transparent 35%, rgba(3, 21, 24, 0.4) 100%);
}

.stage-fallback-image {
  z-index: 0;
  object-fit: cover;
  opacity: 0.56;
}

.stage-fallback-empty {
  z-index: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.75rem;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(35, 122, 117, 0.66), transparent 42%),
    #08292e;
  color: rgba(235, 250, 245, 0.82);
  font-size: 0.8rem;
}

.stage-topline,
.stage-bottomline,
.stage-index,
.stage-status,
.stage-asset-error {
  position: absolute;
  z-index: 3;
}

.stage-topline {
  top: 1.2rem;
  right: 1.3rem;
  left: 1.3rem;
  display: flex;
  justify-content: space-between;
  color: rgba(235, 250, 245, 0.78);
  font-size: 0.59rem;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.stage-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.stage-coordinate {
  opacity: 0.75;
}

.stage-index {
  top: 50%;
  right: 1.25rem;
  display: grid;
  justify-items: end;
  color: rgba(235, 250, 245, 0.72);
  transform: translateY(-50%);
}

.stage-index span,
.stage-index i {
  font-size: 0.53rem;
  font-style: normal;
  letter-spacing: 0.14em;
}

.stage-index strong {
  color: var(--color-blanco);
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 500;
  letter-spacing: -0.08em;
  line-height: 1;
}

.stage-bottomline {
  right: 1.3rem;
  bottom: 1.15rem;
  left: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: rgba(235, 250, 245, 0.76);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage-live-dot,
.legend-mark {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #91d6c6;
  box-shadow: 0 0 13px rgba(145, 214, 198, 0.65);
}

.stage-bottomline__rule {
  width: clamp(20px, 5vw, 65px);
  height: 1px;
  background: rgba(235, 250, 245, 0.44);
}

.stage-status,
.stage-asset-error {
  right: 1.3rem;
  bottom: 3rem;
  left: 1.3rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.7rem;
  text-align: center;
}

.stage-asset-error {
  bottom: 4.25rem;
  color: #ffd2be;
}

.showroom-legend {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.9rem;
  color: #52615e;
  font-size: 0.66rem;
}

.legend-mark {
  width: 6px;
  height: 6px;
  background: var(--color-turquesa-cactours);
  box-shadow: none;
}

.legend-hint {
  margin-left: auto;
  color: #7a8581;
}

.showroom-detail {
  padding: 1rem 0;
}

.detail-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 1.7rem;
}

.detail-category {
  border: 1px solid rgba(2, 99, 116, 0.27);
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  background: rgba(2, 99, 116, 0.07);
  color: #436965;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.detail-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.6rem;
  color: #58716c;
  font-size: 0.76rem;
}

.showroom-detail h3 {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(2.3rem, 4vw, 3.9rem);
  font-weight: 600;
  letter-spacing: -0.08em;
  line-height: 0.98;
}

.detail-description {
  min-height: 5.4em;
  margin: 1rem 0 1.4rem;
  color: #52615e;
  font-size: 0.88rem;
  line-height: 1.75;
}

.detail-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem 2rem;
  border-top: 1px solid rgba(17, 17, 17, 0.13);
  border-bottom: 1px solid rgba(17, 17, 17, 0.13);
  padding: 1rem 0;
}

.detail-facts div {
  display: grid;
  gap: 0.25rem;
}

.detail-facts span {
  color: #76827e;
  font-size: 0.61rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.detail-facts strong {
  color: var(--color-carbon);
  font-size: 0.79rem;
  font-weight: 700;
}

.photo-credit {
  margin-top: 0.8rem;
  color: #74817c;
  font-size: 0.58rem;
  line-height: 1.6;
}

.photo-credit a {
  color: var(--color-turquesa-cactours);
  text-underline-offset: 2px;
}

.showroom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
}

.showroom-controls {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.showroom-controls > button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(2, 99, 116, 0.3);
  border-radius: 50%;
  background: transparent;
  color: var(--color-turquesa-cactours);
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.showroom-controls > button:hover {
  transform: translateY(-2px);
  background: var(--color-turquesa-cactours);
  color: var(--color-blanco);
}

.showroom-pagination {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.showroom-pagination button {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 999px;
  padding: 0;
  background: rgba(2, 99, 116, 0.25);
  cursor: pointer;
  transition:
    width 200ms ease,
    background-color 200ms ease;
}

.showroom-pagination button.pagination-dot--active {
  width: 22px;
  background: var(--color-turquesa-cactours);
}

.detail-cta {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 0.9rem;
  background: var(--color-turquesa-cactours);
  color: var(--color-blanco);
  font-size: 0.7rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.detail-cta:hover {
  background: var(--color-azul-petroleo);
}

.media-disclaimer {
  margin: 0.8rem 0 0;
  color: #74817c;
  font-size: 0.66rem;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .showroom-layout {
    grid-template-columns: minmax(0, 1.15fr) minmax(250px, 0.85fr);
    gap: 2rem;
  }

  .showroom-stage {
    min-height: 480px;
  }
}

@media (max-width: 700px) {
  .showroom-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .showroom-intro {
    max-width: 450px;
  }

  .showroom-layout {
    grid-template-columns: 1fr;
    gap: 1.6rem;
  }

  .showroom-stage {
    min-height: clamp(370px, 115vw, 500px);
  }

  .showroom-detail {
    padding: 0;
  }

  .showroom-detail h3 {
    font-size: clamp(2.7rem, 10vw, 4rem);
  }

  .detail-description {
    min-height: 0;
  }

  .stage-coordinate {
    display: none;
  }
}

@media (max-width: 430px) {
  .showroom-legend {
    align-items: flex-start;
    flex-wrap: wrap;
    font-size: 0.59rem;
  }

  .legend-hint {
    width: 100%;
    margin-left: 1.1rem;
  }

  .showroom-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-cta {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .showroom-controls > button,
  .showroom-pagination button,
  .stage-ambient-image {
    transition: none;
  }
}
</style>
