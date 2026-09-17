import { defineStore } from 'pinia'
import type { Step } from '~/data/steps'
import { STEP_DEFINITIONS, STEPS } from '~/data/steps'

export type Theme = 'system' | 'light' | 'dark'

export interface Settings {
  defaultTranslation: string
  timersEnabled: boolean
  chimeEnabled: boolean
  stepSeconds: Record<Step, number>
  theme: Theme
  timezone: string
}

export const THEME_STORAGE_KEY = 'lectio-theme'

function defaults(): Settings {
  return {
    defaultTranslation: 'web',
    timersEnabled: false,
    chimeEnabled: true,
    stepSeconds: Object.fromEntries(
      STEPS.map(step => [step, STEP_DEFINITIONS[step].defaultSeconds]),
    ) as Record<Step, number>,
    theme: 'system',
    timezone: 'UTC',
  }
}

/** Mirrors the chosen theme onto <html> and remembers it for the next load. */
export function applyTheme(theme: Theme) {
  if (!import.meta.client) return
  const dark = theme === 'dark'
    || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
  catch {
    // Private browsing. The theme simply won't persist.
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(defaults())
  const loaded = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      const data = await $fetch<Settings>('/api/settings')
      settings.value = { ...defaults(), ...data }
      loaded.value = true
      applyTheme(settings.value.theme)
      await syncTimezone()
    }
    catch {
      // Signed out, or offline — the defaults are perfectly usable.
    }
  }

  async function update(patch: Partial<Settings>) {
    const previous = settings.value
    settings.value = { ...previous, ...patch }
    if (patch.theme) applyTheme(patch.theme)

    try {
      const data = await $fetch<Settings>('/api/settings', { method: 'PATCH', body: patch })
      settings.value = { ...defaults(), ...data }
    }
    catch (error) {
      settings.value = previous
      if (previous.theme) applyTheme(previous.theme)
      throw error
    }
  }

  /** Streaks are counted in the user's zone, so keep it current as they travel. */
  async function syncTimezone() {
    if (!import.meta.client) return
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!zone || zone === settings.value.timezone) return
    try {
      await update({ timezone: zone })
    }
    catch {
      // Not worth surfacing; the stored zone stays as it was.
    }
  }

  function reset() {
    settings.value = defaults()
    loaded.value = false
  }

  return { settings, loaded, load, update, reset }
})
