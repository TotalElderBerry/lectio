import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { userSettings, users } from '../../db/schema'

const schema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(8, 'Please choose a password of at least 8 characters.').max(200),
  displayName: z.string().trim().max(80).optional(),
  timezone: z.string().max(64).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBodyAs(event, schema)
  const email = normalizeEmail(body.email)
  const db = useDb()

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'There is already an account with that email. Try signing in instead.',
    })
  }

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: await hashPassword(body.password),
      displayName: body.displayName?.length ? body.displayName : null,
    })
    .returning({ id: users.id, email: users.email, displayName: users.displayName })

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'We could not create your account. Please try again.' })
  }

  await db
    .insert(userSettings)
    .values({ userId: user.id, timezone: body.timezone || 'UTC' })
    .onConflictDoNothing()

  await setUserSession(event, {
    user: { id: user.id, email: user.email, displayName: user.displayName },
    loggedInAt: new Date().toISOString(),
  })

  return { user }
})
