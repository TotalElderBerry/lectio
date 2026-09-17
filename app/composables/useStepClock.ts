/**
 * Counts the seconds spent in the current step, and — when a target is set —
 * how many remain. The clock never advances the step by itself; reaching the
 * target only sounds the chime. You move on when you are ready.
 */
export function useStepClock() {
  const elapsed = ref(0)
  const target = ref(0)
  const running = ref(false)
  const reachedTarget = ref(false)

  let handle: ReturnType<typeof setInterval> | undefined

  const remaining = computed(() => (target.value ? Math.max(0, target.value - elapsed.value) : 0))

  function stopInterval() {
    if (handle !== undefined) {
      clearInterval(handle)
      handle = undefined
    }
  }

  function start() {
    if (running.value || !import.meta.client) return
    running.value = true
    stopInterval()
    handle = setInterval(() => {
      elapsed.value += 1
      if (target.value && elapsed.value >= target.value) reachedTarget.value = true
    }, 1000)
  }

  function pause() {
    running.value = false
    stopInterval()
  }

  /** Begin a new step: seconds already banked from an earlier visit, plus its target. */
  function reset(startAt = 0, seconds = 0) {
    pause()
    elapsed.value = startAt
    target.value = seconds
    reachedTarget.value = seconds > 0 && startAt >= seconds
  }

  // Sitting in prayer with the tab in the background still counts; a laptop
  // lid closed for an hour should not.
  function onVisibility() {
    if (document.visibilityState === 'hidden') pause()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisibility))
  onScopeDispose(() => {
    if (import.meta.client) document.removeEventListener('visibilitychange', onVisibility)
    stopInterval()
  })

  return { elapsed, remaining, target, running, reachedTarget, start, pause, reset }
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
