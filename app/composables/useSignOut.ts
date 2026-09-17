/**
 * Ends the session everywhere it is held: the sealed cookie on the server, the
 * session state in the app, and the settings mirrored in the store. Offered
 * from the header on wide screens and from Settings everywhere.
 */
export function useSignOut() {
  const { clear } = useUserSession()
  const settingsStore = useSettingsStore()
  const router = useRouter()

  return async function signOut() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    settingsStore.reset()
    await router.push('/login')
  }
}
