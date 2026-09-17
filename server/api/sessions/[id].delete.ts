import { and, eq } from 'drizzle-orm'
import { prayerSessions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const session = await loadOwnedSession(userId, id)

  // session_steps rows go with it via ON DELETE CASCADE.
  await useDb()
    .delete(prayerSessions)
    .where(and(eq(prayerSessions.id, session.id), eq(prayerSessions.userId, userId)))

  return { ok: true }
})
