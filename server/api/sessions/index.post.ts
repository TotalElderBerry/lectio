import { z } from 'zod'
import { STEPS, prayerSessions, sessionSteps } from '../../db/schema'
import { DEFAULT_TRANSLATION, isTranslationId, normalizeReference } from '../../../shared/utils/scripture'

const schema = z.object({
  reference: z.string().trim().min(1, 'Enter a passage to pray with.').max(100),
  translation: z.string().optional(),
  /** Set when the reader pasted the text themselves (their own translation, or an API outage). */
  passageText: z.string().trim().max(20_000).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBodyAs(event, schema)
  const db = useDb()

  const translation = isTranslationId(body.translation) ? body.translation : DEFAULT_TRANSLATION

  let referenceDisplay = body.reference.trim()
  let passageText = body.passageText ?? ''

  if (!passageText) {
    const passage = await resolvePassage(body.reference, translation)
    referenceDisplay = passage.reference
    passageText = passage.text
  }

  const [session] = await db
    .insert(prayerSessions)
    .values({
      userId,
      referenceDisplay,
      referenceKey: normalizeReference(body.reference),
      translation: body.passageText ? 'custom' : translation,
      passageText,
    })
    .returning()

  if (!session) {
    throw createError({ statusCode: 500, statusMessage: 'We could not begin that session. Please try again.' })
  }

  await db.insert(sessionSteps).values(STEPS.map(step => ({ sessionId: session.id, step })))

  return { session, steps: await loadSteps(session.id) }
})
