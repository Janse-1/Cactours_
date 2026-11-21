<template>
  <section
    class="feedback-state spotlight-card spotlight-card--flat"
    :class="`feedback-state--${variant}`"
    :role="variant === 'error' ? 'alert' : 'status'"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
    :aria-busy="variant === 'loading' ? 'true' : undefined"
  >
    <span class="feedback-state__icon" aria-hidden="true">
      <span v-if="variant === 'loading'" class="feedback-state__spinner"></span>
      <CircleAlert v-else-if="variant === 'error'" :size="24" />
      <Check v-else-if="variant === 'success'" :size="24" />
      <Compass v-else :size="24" />
    </span>

    <div class="feedback-state__content">
      <component :is="headingTag" v-if="title" class="feedback-state__title">
        {{ title }}
      </component>
      <p v-if="message" class="feedback-state__message">{{ message }}</p>
      <slot />
    </div>

    <div v-if="$slots.actions" class="feedback-state__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup>
import { CircleAlert, Check, Compass } from 'lucide-vue-next'

defineProps({
  variant: {
    type: String,
    default: 'empty',
    validator: (value) => ['loading', 'error', 'empty', 'success'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  headingTag: {
    type: String,
    default: 'h2',
    validator: (value) => ['h1', 'h2', 'h3', 'h4'].includes(value),
  },
})
</script>

<style scoped>
.feedback-state {
  display: flex;
  min-width: 0;
  min-height: 180px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 0.65rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: clamp(1.25rem, 3vw, 2rem);
  background: rgba(255, 255, 255, 0.76);
  color: var(--color-muted);
  text-align: center;
}

.feedback-state__icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: rgba(2, 99, 116, 0.08);
  color: var(--color-turquesa-cactours);
}

.feedback-state__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(2, 99, 116, 0.16);
  border-top-color: var(--color-turquesa-cactours);
  border-radius: 50%;
  animation: feedback-state-spin 0.8s linear infinite;
}

.feedback-state__content {
  min-width: 0;
  max-width: 560px;
}

.feedback-state__title {
  margin: 0;
  color: var(--color-carbon);
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  letter-spacing: -0.035em;
}

.feedback-state__message {
  margin: 0.55rem 0 0;
  font-size: 0.86rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.feedback-state__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.feedback-state--error {
  border-color: rgba(197, 34, 31, 0.2);
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.feedback-state--error .feedback-state__icon {
  background: rgba(197, 34, 31, 0.08);
  color: var(--color-error-text);
}

.feedback-state--error .feedback-state__title {
  color: var(--color-error-text);
}

.feedback-state--success {
  min-height: 0;
  align-items: flex-start;
  flex-direction: row;
  justify-content: flex-start;
  border-color: rgba(19, 115, 51, 0.2);
  background: var(--color-success-bg);
  text-align: left;
}

.feedback-state--success .feedback-state__icon {
  background: rgba(19, 115, 51, 0.1);
  color: var(--color-success-text);
}

.feedback-state--success .feedback-state__title {
  color: var(--color-success-text);
}

.feedback-state--success .feedback-state__actions {
  margin-left: auto;
}

@keyframes feedback-state-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .feedback-state--success {
    align-items: flex-start;
    flex-direction: column;
  }

  .feedback-state--success .feedback-state__actions {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feedback-state__spinner {
    animation: none;
  }
}
</style>
