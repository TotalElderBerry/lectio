import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { STEPS, sessionSteps } from '../../../../db/schema'

const schema = z.object({
  body: z.string().max(20_000),
  durationSeconds: z.number().int().min(0).max(86_400).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const step = getRouterParam(event, 'step')

  if (!STEPS.includes(step as never)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown step.' })
  }

  const session = await loadOwnedSession(userId, id)
  const payload = await readBodyAs(event, schema)

  const [updated] = await useDb()
    .update(sessionSteps)
    .set({
      body: payload.body,
      // The client sends the running total for this step, not a delta.
      ...(payload.durationSeconds === undefined ? {} : { durationSeconds: payload.durationSeconds }),
      updatedAt: new Date(),
    })
    .where(and(eq(sessionSteps.sessionId, session.id), eq(sessionSteps.step, step as never)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'That step could not be found.' })
  }

  return { step: updated }
})
