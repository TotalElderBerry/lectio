import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { userSettings } from '../db/schema'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** The signed-in user's id, or a 401. */
export async function requireUserId(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event)
  return user.id
}

/** Settings row for a user, created with defaults on first access. */
export async function getOrCreateSettings(userId: string) {
  const db = useDb()

  const [existing] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
  if (existing) return existing

  const [created] = await db.insert(userSettings).values({ userId }).onConflictDoNothing().returning()
  if (created) return created

  // Lost an insert race — the row exists now.
  const [row] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
  return row!
}
