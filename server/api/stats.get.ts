import { and, eq, isNotNull } from 'drizzle-orm'
import { prayerSessions } from '../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const settings = await getOrCreateSettings(userId)

  const rows = await useDb()
    .select({ localDate: prayerSessions.localDate })
    .from(prayerSessions)
    .where(
      and(
        eq(prayerSessions.userId, userId),
        eq(prayerSessions.status, 'completed'),
        isNotNull(prayerSessions.localDate),
      ),
    )

  return computeStreak(
    rows.map(r => r.localDate!),
    localDateIn(settings.timezone),
  )
})
