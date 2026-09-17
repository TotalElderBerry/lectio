export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const session = await loadOwnedSession(userId, id)

  return { session, steps: await loadSteps(session.id) }
})
