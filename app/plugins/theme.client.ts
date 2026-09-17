import { THEME_STORAGE_KEY, applyTheme } from '~/stores/settings'
import type { Theme } from '~/stores/settings'

/**
 * Keeps the page in step with the OS when the theme is left on 'system', and
 * restores the remembered choice before the settings request comes back.
 */
export default defineNuxtPlugin(() => {
  let stored: Theme = 'system'
  try {
    stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system'
  }
  catch {
    // Blocked storage; 'system' is a fine default.
  }

  applyTheme(stored)

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', () => {
    const settings = useSettingsStore()
    if (settings.settings.theme === 'system') applyTheme('system')
  })
})
