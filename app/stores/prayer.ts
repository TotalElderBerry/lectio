import { defineStore } from 'pinia'
import type { Step } from '~/data/steps'
import { STEPS } from '~/data/steps'
import type { SaveStatus } from '~/composables/useAutosave'

export interface PrayerSession {
  id: string
  referenceDisplay: string
  translation: string
  passageText: string
  wordOrPhrase: string | null
  status: 'in_progress' | 'completed'
  startedAt: string
  completedAt: string | null
}

export interface PrayerStep {
  step: Step
  body: string
  durationSeconds: number
  updatedAt: string
}

interface LocalMirror {
  savedAt: number
  currentStep: Step
  wordOrPhrase: string
  bodies: Partial<Record<Step, { body: string; savedAt: number }>>
}

const emptyBodies = () => Object.fromEntries(STEPS.map(s => [s, ''])) as Record<Step, string>
const emptyDurations = () => Object.fromEntries(STEPS.map(s => [s, 0])) as Record<Step, number>

const mirrorKey = (id: string) => `lectio-draft-${id}`

export const usePrayerStore = defineStore('prayer', () => {
  const session = ref<PrayerSession | null>(null)
  const bodies = ref<Record<Step, string>>(emptyBodies())
  const durations = ref<Record<Step, number>>(emptyDurations())
  const serverUpdatedAt = ref<Record<Step, number>>(emptyDurations())
  const wordOrPhrase = ref('')
  const currentStep = ref<Step>('read')
  const status = ref<SaveStatus>('idle')

  const dirtySteps = new Set<Step>()
  let dirtyWord = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let inFlight = false

  const hasUnsaved = computed(() => status.value === 'pending' || status.value === 'saving')

  function readMirror(id: string): LocalMirror | null {
    try {
      const raw = localStorage.getItem(mirrorKey(id))
      return raw ? (JSON.parse(raw) as LocalMirror) : null
    }
    catch {
      return null
    }
  }

  function writeMirror() {
    if (!import.meta.client || !session.value) return
    const now = Date.now()
    try {
      localStorage.setItem(mirrorKey(session.value.id), JSON.stringify({
        savedAt: now,
        currentStep: currentStep.value,
        wordOrPhrase: wordOrPhrase.value,
        bodies: Object.fromEntries(STEPS.map(s => [s, { body: bodies.value[s], savedAt: now }])),
      } satisfies LocalMirror))
    }
    catch {
      // Storage full or blocked; the server copy is still authoritative.
    }
  }

  function clearMirror(id: string) {
    try {
      localStorage.removeItem(mirrorKey(id))
    }
    catch { /* nothing to do */ }
  }

  async function open(id: string) {
    const data = await $fetch<{ session: PrayerSession; steps: PrayerStep[] }>(`/api/sessions/${id}`)

    session.value = data.session
    wordOrPhrase.value = data.session.wordOrPhrase ?? ''
    bodies.value = emptyBodies()
    durations.value = emptyDurations()
    serverUpdatedAt.value = emptyDurations()

    for (const step of data.steps) {
      bodies.value[step.step] = step.body
      durations.value[step.step] = step.durationSeconds
      serverUpdatedAt.value[step.step] = new Date(step.updatedAt).getTime()
    }

    // A tab closed mid-sentence, or a save that never reached the server:
    // prefer whichever copy of each step is newer.
    const mirror = import.meta.client ? readMirror(id) : null
    if (mirror) {
      let recovered = false
      for (const step of STEPS) {
        const local = mirror.bodies?.[step]
        if (local && local.savedAt > serverUpdatedAt.value[step] && local.body !== bodies.value[step]) {
          bodies.value[step] = local.body
          dirtySteps.add(step)
          recovered = true
        }
      }
      if (mirror.wordOrPhrase && mirror.savedAt > new Date(data.session.startedAt).getTime() && mirror.wordOrPhrase !== wordOrPhrase.value) {
        wordOrPhrase.value = mirror.wordOrPhrase
        dirtyWord = true
        recovered = true
      }
      currentStep.value = mirror.currentStep ?? firstUnfinishedStep()
      if (recovered) schedule(0)
    }
    else {
      currentStep.value = firstUnfinishedStep()
    }

    status.value = 'idle'
    return data.session
  }

  /** Resume where the writing stopped rather than always at Read. */
  function firstUnfinishedStep(): Step {
    return STEPS.find(step => !bodies.value[step].trim()) ?? 'rest'
  }

  function setBody(step: Step, text: string) {
    bodies.value[step] = text
    dirtySteps.add(step)
    writeMirror()
    schedule()
  }

  function setDuration(step: Step, seconds: number) {
    durations.value[step] = seconds
    dirtySteps.add(step)
  }

  function setWordOrPhrase(text: string) {
    wordOrPhrase.value = text
    dirtyWord = true
    writeMirror()
    schedule()
  }

  function setStep(step: Step) {
    currentStep.value = step
    writeMirror()
    void flush()
  }

  function schedule(delay = 1500) {
    status.value = 'pending'
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => void flush(), delay)
  }

  async function flush(): Promise<void> {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (!session.value || inFlight) return
    if (!dirtySteps.size && !dirtyWord) {
      if (status.value === 'pending') status.value = 'saved'
      return
    }

    const id = session.value.id
    const steps = [...dirtySteps]
    const word = dirtyWord
    dirtySteps.clear()
    dirtyWord = false

    inFlight = true
    status.value = 'saving'

    try {
      await Promise.all([
        ...steps.map(step => $fetch(`/api/sessions/${id}/steps/${step}`, {
          method: 'PUT',
          body: { body: bodies.value[step], durationSeconds: durations.value[step] },
        })),
        ...(word
          ? [$fetch(`/api/sessions/${id}`, {
              method: 'PATCH',
              body: { wordOrPhrase: wordOrPhrase.value },
            })]
          : []),
      ])

      const now = Date.now()
      for (const step of steps) serverUpdatedAt.value[step] = now
      status.value = dirtySteps.size || dirtyWord ? 'pending' : 'saved'
    }
    catch {
      // Keep the work marked dirty so the next flush retries it.
      for (const step of steps) dirtySteps.add(step)
      if (word) dirtyWord = true
      status.value = 'error'
    }
    finally {
      inFlight = false
    }
  }

  async function complete() {
    if (!session.value) return
    await flush()
    const { session: updated } = await $fetch<{ session: PrayerSession }>(`/api/sessions/${session.value.id}`, {
      method: 'PATCH',
      body: { complete: true },
    })
    session.value = updated
    clearMirror(updated.id)
  }

  function close() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    dirtySteps.clear()
    dirtyWord = false
    session.value = null
    bodies.value = emptyBodies()
    durations.value = emptyDurations()
    wordOrPhrase.value = ''
    currentStep.value = 'read'
    status.value = 'idle'
  }

  return {
    session,
    bodies,
    durations,
    wordOrPhrase,
    currentStep,
    status,
    hasUnsaved,
    open,
    setBody,
    setDuration,
    setWordOrPhrase,
    setStep,
    flush,
    complete,
    close,
  }
})
