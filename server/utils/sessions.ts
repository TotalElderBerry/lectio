import { and, asc, eq } from 'drizzle-orm'
import { prayerSessions, sessionSteps } from '../db/schema'

/**
 * Loads a session only if it belongs to this user.
 *
 * Returns 404 rather than 403 for someone else's session: a 403 would confirm
 * that the id exists, and these are private spiritual journals.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function loadOwnedSession(userId: string, sessionId: string) {
  // Postgres would raise a cast error on a malformed uuid; a bad id is simply
  // a session that doesn't exist.
  if (!UUID_RE.test(sessionId ?? '')) {
    throw createError({ statusCode: 404, statusMessage: 'That session could not be found.' })
  }

  const db = useDb()

  const [session] = await db
    .select()
    .from(prayerSessions)
    .where(and(eq(prayerSessions.id, sessionId), eq(prayerSessions.userId, userId)))
    .limit(1)

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'That session could not be found.' })
  }

  return session
}

export async function loadSteps(sessionId: string) {
  const db = useDb()
  return await db
    .select()
    .from(sessionSteps)
    .where(eq(sessionSteps.sessionId, sessionId))
    .orderBy(asc(sessionSteps.step))
}
