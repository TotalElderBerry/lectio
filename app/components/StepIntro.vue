<script setup lang="ts">
import type { StepDefinition } from '~/data/steps'
import { STEPS } from '~/data/steps'

const props = defineProps<{
  /** The movement being announced, or null when the page is in view. */
  step: StepDefinition | null
}>()

const emit = defineEmits<{ done: [] }>()

/** Long enough to read the line and take a breath. A tap moves on sooner. */
const DWELL_MS = 2800

const veil = useTemplateRef<HTMLButtonElement>('veil')
const filled = ref(false)

let handle: ReturnType<typeof setTimeout> | undefined

const ordinal = computed(() => (props.step ? STEPS.indexOf(props.step.key) + 1 : 0))

function clearDwell() {
  if (handle !== undefined) {
    clearTimeout(handle)
    handle = undefined
  }
}

function done() {
  clearDwell()
  emit('done')
}

watch(() => props.step, async (step) => {
  clearDwell()
  filled.value = false
  if (!step || !import.meta.client) return

  handle = setTimeout(done, DWELL_MS)

  await nextTick()
  // Focus so a keyboard can move on too; the button is the whole veil.
  veil.value?.focus()
  // Next frame, so the hairline grows from empty rather than starting full.
  requestAnimationFrame(() => {
    filled.value = true
  })
}, { immediate: true })

onBeforeUnmount(clearDwell)
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <button
      v-if="step"
      ref="veil"
      type="button"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-0 bg-paper px-8 text-center"
      @click="done"
    >
      <span class="text-xs uppercase tracking-[0.2em] text-ink-faint">
        Movement {{ ordinal }} of {{ STEPS.length }}
      </span>

      <span class="rise mt-6 font-serif text-4xl text-ink sm:text-5xl">
        {{ step.title }}
      </span>
      <span class="rise mt-1 font-serif text-lg italic text-ink-faint">
        {{ step.latin }}
      </span>

      <span class="rise mt-7 max-w-sm scripture-sm text-ink-soft">
        {{ step.instruction }}
      </span>

      <!-- Shows that the veil will lift on its own; no one has to tap. -->
      <span
        class="mt-12 h-px w-32 overflow-hidden bg-rule"
        aria-hidden="true"
      >
        <span
          class="block h-px bg-accent transition-[width] ease-linear"
          :class="filled ? 'w-32' : 'w-0'"
          :style="{ transitionDuration: `${DWELL_MS}ms` }"
        />
      </span>
    </button>
  </Transition>
</template>
