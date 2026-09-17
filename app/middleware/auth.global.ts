const PUBLIC_ROUTES = new Set(['/login', '/register'])

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const isPublic = PUBLIC_ROUTES.has(to.path)

  if (!loggedIn.value && !isPublic) {
    return navigateTo({ path: '/login', query: to.fullPath === '/' ? undefined : { redirect: to.fullPath } })
  }

  if (loggedIn.value && isPublic) {
    return navigateTo('/')
  }
})
