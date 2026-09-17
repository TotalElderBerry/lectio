<script setup lang="ts">
import { formatClock } from '~/composables/useStepClock'

const props = defineProps<{
  remaining: number
  target: number
  running: boolean
  reached: boolean
}>()

defineEmits<{ toggle: [] }>()

const progress = computed(() => {
  if (!props.target) return 0
  return Math.min(1, (props.target - props.remaining) / props.target)
})

const circumference = 2 * Math.PI * 9
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full border border-rule px-3 py-1.5 text-sm tabular-nums text-ink-soft transition-colors hover:border-accent hover:text-ink"
    :aria-label="running ? 'Pause the timer' : 'Start the timer'"
    @click="$emit('toggle')"
  >
    <svg
      class="size-5 -rotate-90"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="text-rule"
      />
      <circle
        cx="10"
        cy="10"
        r="9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        class="text-accent transition-[stroke-dashoffset] duration-1000 ease-linear"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference * (1 - progress)"
      />
    </svg>

    <span>{{ reached ? 'Stay as long as you like' : formatClock(remaining) }}</span>
  </button>
</template>
