import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../db/schema'

const schema = z.object({
  password: z.string().min(1, 'Enter your password to confirm.'),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBodyAs(event, schema)
  const db = useDb()

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
    throw createError({ statusCode: 401, statusMessage: 'That password is not correct.' })
  }

  // Settings, sessions and steps all cascade from the user row.
  await db.delete(users).where(eq(users.id, userId))
  await clearUserSession(event)

  return { ok: true }
})
