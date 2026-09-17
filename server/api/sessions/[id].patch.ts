import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { prayerSessions } from '../../db/schema'

const schema = z.object({
  wordOrPhrase: z.string().trim().max(300).nullable().optional(),
  /** Sent once, when Rest is finished. */
  complete: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const session = await loadOwnedSession(userId, id)
  const body = await readBodyAs(event, schema)
  const db = useDb()

  const patch: Record<string, unknown> = {}

  if (body.wordOrPhrase !== undefined) {
    patch.wordOrPhrase = body.wordOrPhrase?.length ? body.wordOrPhrase : null
  }

  // Completing is idempotent — re-finishing an old session must not move the
  // date it belongs to, which would quietly rewrite the streak.
  if (body.complete && session.status !== 'completed') {
    const settings = await getOrCreateSettings(userId)
    patch.status = 'completed'
    patch.completedAt = new Date()
    patch.localDate = localDateIn(settings.timezone, session.startedAt)
  }

  if (!Object.keys(patch).length) {
    return { session }
  }

  const [updated] = await db
    .update(prayerSessions)
    .set(patch)
    .where(and(eq(prayerSessions.id, session.id), eq(prayerSessions.userId, userId)))
    .returning()

  return { session: updated }
})
