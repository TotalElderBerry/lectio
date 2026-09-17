import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { userSettings, users } from '../../db/schema'

const schema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.').max(200),
  timezone: z.string().max(64).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBodyAs(event, schema)
  const db = useDb()

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(body.email)))
    .limit(1)

  // Same message and roughly the same work either way, so the response does
  // not reveal whether an account with that email exists.
  const valid = user
    ? await verifyPassword(user.passwordHash, body.password)
    : await verifyPassword('$scrypt$n=16384,r=8,p=1$notarealsalt$notarealhash', body.password).catch(() => false)

  if (!user || !valid) {
    throw createError({ statusCode: 401, statusMessage: 'That email and password do not match.' })
  }

  // Keep the streak zone in step with wherever they are signing in from.
  if (body.timezone) {
    await db
      .insert(userSettings)
      .values({ userId: user.id, timezone: body.timezone })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { timezone: body.timezone, updatedAt: new Date() },
      })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, displayName: user.displayName },
    loggedInAt: new Date().toISOString(),
  })

  return { user: { id: user.id, email: user.email, displayName: user.displayName } }
})
