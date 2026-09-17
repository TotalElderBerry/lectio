/** Reachable signed out. '/' serves the landing page to visitors, the dashboard to members. */
const PUBLIC_ROUTES = new Set(['/', '/login', '/register'])

/** Public routes that mean nothing once you are signed in. */
const GUEST_ONLY_ROUTES = new Set(['/login', '/register'])

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value && !PUBLIC_ROUTES.has(to.path)) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (loggedIn.value && GUEST_ONLY_ROUTES.has(to.path)) {
    return navigateTo('/')
  }
})
