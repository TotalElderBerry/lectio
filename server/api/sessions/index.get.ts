import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { prayerSessions } from '../../db/schema'

const schema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { limit, offset } = await readQueryAs(event, schema)

  const rows = await useDb()
    .select({
      id: prayerSessions.id,
      referenceDisplay: prayerSessions.referenceDisplay,
      translation: prayerSessions.translation,
      wordOrPhrase: prayerSessions.wordOrPhrase,
      status: prayerSessions.status,
      startedAt: prayerSessions.startedAt,
      completedAt: prayerSessions.completedAt,
    })
    .from(prayerSessions)
    .where(eq(prayerSessions.userId, userId))
    .orderBy(desc(prayerSessions.startedAt))
    // One extra row tells us whether there is another page, without a count query.
    .limit(limit + 1)
    .offset(offset)

  return { sessions: rows.slice(0, limit), hasMore: rows.length > limit }
})
