<script setup lang="ts">
withDefaults(defineProps<{
  reference: string
  text: string
  translation?: string
  size?: 'normal' | 'small'
  /** On wide screens, hold the passage in view and let it scroll within itself. */
  sticky?: boolean
}>(), {
  translation: undefined,
  size: 'normal',
  sticky: false,
})
</script>

<template>
  <figure
    class="rounded-lg bg-paper-raised px-6 py-6 ring-1 ring-rule/60 sm:px-8 sm:py-7"
    :class="sticky ? 'lg:sticky lg:top-24 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto' : ''"
  >
    <blockquote
      class="text-ink"
      :class="size === 'small' ? 'scripture-sm' : 'scripture'"
    >
      {{ text }}
    </blockquote>

    <figcaption class="mt-5 flex flex-wrap items-baseline gap-x-3 border-t border-rule/60 pt-4 text-sm text-ink-faint">
      <cite class="not-italic text-ink-soft">{{ reference }}</cite>
      <span v-if="translation">{{ translation }}</span>
    </figcaption>
  </figure>
</template>
