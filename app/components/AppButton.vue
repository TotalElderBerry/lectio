<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'quiet' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false,
})

const styles = {
  primary: 'bg-accent text-accent-ink hover:opacity-90',
  quiet: 'border border-rule text-ink hover:bg-paper-sunk',
  ghost: 'text-ink-soft hover:text-ink',
} as const
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
    :class="styles[variant]"
  >
    <span
      v-if="loading"
      class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
