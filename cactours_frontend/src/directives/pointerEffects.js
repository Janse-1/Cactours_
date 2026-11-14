const pointerMediaQuery = '(hover: hover) and (pointer: fine)'
const reducedMotionMediaQuery = '(prefers-reduced-motion: reduce)'
const cardSelector = '.spotlight-card'
const magneticSelector = '.magnetic-button, .btn-primary, .btn-accent'
const cleanupByRoot = new WeakMap()

function isElement(value) {
  return value instanceof Element
}

function findTargets(target, selector, root) {
  if (!isElement(target)) return []

  const targets = []
  let element = target.closest(selector)

  while (element && root.contains(element)) {
    targets.push(element)
    element = element.parentElement?.closest(selector) || null
  }

  return targets
}

function resetTarget(element, activeTargets) {
  element.classList.remove('is-pointer-active')
  element.style.removeProperty('--spotlight-x')
  element.style.removeProperty('--spotlight-y')
  element.style.removeProperty('--tilt-axis-x')
  element.style.removeProperty('--tilt-axis-y')
  element.style.removeProperty('--tilt-angle')
  element.style.removeProperty('--magnetic-x')
  element.style.removeProperty('--magnetic-y')
  activeTargets.delete(element)
}

function applySpotlight(element, event) {
  const bounds = element.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top
  element.classList.add('is-pointer-active')
  element.style.setProperty('--spotlight-x', `${x}px`)
  element.style.setProperty('--spotlight-y', `${y}px`)

  if (element.classList.contains('spotlight-card--flat')) {
    element.style.setProperty('--tilt-angle', '0deg')
    return
  }

  const horizontal = (x / bounds.width) * 2 - 1
  const vertical = (y / bounds.height) * 2 - 1
  const magnitude = Math.min(1, Math.hypot(horizontal, vertical))
  const axisLength = Math.hypot(horizontal, vertical) || 1

  element.style.setProperty('--tilt-axis-x', `${-vertical / axisLength}`)
  element.style.setProperty('--tilt-axis-y', `${horizontal / axisLength}`)
  element.style.setProperty('--tilt-angle', `${magnitude * 6}deg`)
}

function applyMagnetic(element, event) {
  if (element.matches(':disabled, [aria-disabled="true"]')) return

  const bounds = element.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const x = Math.max(-8, Math.min(8, (event.clientX - bounds.left - bounds.width / 2) * 0.16))
  const y = Math.max(-6, Math.min(6, (event.clientY - bounds.top - bounds.height / 2) * 0.18))

  element.classList.add('is-pointer-active')
  element.style.setProperty('--magnetic-x', `${x}px`)
  element.style.setProperty('--magnetic-y', `${y}px`)
}

export const pointerEffectsDirective = {
  mounted(root) {
    const pointerQuery = window.matchMedia(pointerMediaQuery)
    const motionQuery = window.matchMedia(reducedMotionMediaQuery)
    const activeTargets = new Set()
    const effectsEnabled = () => pointerQuery.matches && !motionQuery.matches

    const clearActiveTargets = () => {
      activeTargets.forEach((element) => resetTarget(element, activeTargets))
    }

    const handlePointerMove = (event) => {
      if (!effectsEnabled() || event.pointerType === 'touch') return

      const cards = findTargets(event.target, cardSelector, root)
      const magneticTargets = findTargets(event.target, magneticSelector, root)

      cards.forEach((card) => {
        activeTargets.add(card)
        applySpotlight(card, event)
      })

      magneticTargets.forEach((magnetic) => {
        if (magnetic.matches(':disabled, [aria-disabled="true"]')) {
          resetTarget(magnetic, activeTargets)
          return
        }

        activeTargets.add(magnetic)
        applyMagnetic(magnetic, event)
      })
    }

    const handlePointerOut = (event) => {
      const nextTarget = isElement(event.relatedTarget) ? event.relatedTarget : null
      const cards = findTargets(event.target, cardSelector, root)
      const magneticTargets = findTargets(event.target, magneticSelector, root)

      cards.forEach((card) => {
        if (!nextTarget || !card.contains(nextTarget)) resetTarget(card, activeTargets)
      })

      magneticTargets.forEach((magnetic) => {
        if (!nextTarget || !magnetic.contains(nextTarget)) resetTarget(magnetic, activeTargets)
      })
    }

    const handlePreferenceChange = () => {
      if (!effectsEnabled()) clearActiveTargets()
    }

    root.addEventListener('pointermove', handlePointerMove, { passive: true })
    root.addEventListener('pointerout', handlePointerOut, { passive: true })
    pointerQuery.addEventListener('change', handlePreferenceChange)
    motionQuery.addEventListener('change', handlePreferenceChange)

    cleanupByRoot.set(root, () => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerout', handlePointerOut)
      pointerQuery.removeEventListener('change', handlePreferenceChange)
      motionQuery.removeEventListener('change', handlePreferenceChange)
      clearActiveTargets()
    })
  },

  beforeUnmount(root) {
    cleanupByRoot.get(root)?.()
    cleanupByRoot.delete(root)
  },
}
