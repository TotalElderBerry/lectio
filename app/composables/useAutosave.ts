export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Debounced save with a guarantee that the last value wins: while a request is
 * in flight, newer values queue rather than race it, so a fast typist can't end
 * up with an older draft overwriting a newer one.
 */
export function useAutosave<T>(save: (value: T) => Promise<unknown>, delay = 1500) {
  const status = ref<SaveStatus>('idle')

  let timer: ReturnType<typeof setTimeout> | undefined
  let queued: { value: T } | undefined
  let inFlight = false

  async function flush(): Promise<void> {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (!queued || inFlight) return

    const { value } = queued
    queued = undefined
    inFlight = true
    status.value = 'saving'

    try {
      await save(value)
      status.value = queued ? 'pending' : 'saved'
    }
    catch {
      status.value = 'error'
      // Put it back so the next flush retries rather than losing the writing.
      queued ??= { value }
    }
    finally {
      inFlight = false
    }

    if (queued) await flush()
  }

  function schedule(value: T): void {
    queued = { value }
    status.value = 'pending'
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => void flush(), delay)
  }

  onScopeDispose(() => {
    if (timer !== undefined) clearTimeout(timer)
  })

  return { status, schedule, flush }
}
