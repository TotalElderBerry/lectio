import { z } from 'zod'
import { DEFAULT_TRANSLATION, isTranslationId } from '../../shared/utils/scripture'

const schema = z.object({
  reference: z.string().trim().min(1, 'Enter a passage to pray with.').max(100),
  translation: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  // Sign-in required so our cached proxy can't be used as a public Bible API.
  await requireUserId(event)

  const query = await readQueryAs(event, schema)
  const translation = isTranslationId(query.translation) ? query.translation : DEFAULT_TRANSLATION

  return await resolvePassage(query.reference, translation)
})
