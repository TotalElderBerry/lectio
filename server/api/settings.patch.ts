import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { userSettings } from '../db/schema'
import { TRANSLATIONS } from '../../shared/utils/scripture'

const translationIds = TRANSLATIONS.map(t => t.id) as unknown as [string, ...string[]]

const stepSeconds = z.object({
  read: z.number().int().min(30).max(3600),
  reflect: z.number().int().min(30).max(3600),
  respond: z.number().int().min(30).max(3600),
  rest: z.number().int().min(30).max(3600),
})

const schema = z.object({
  defaultTranslation: z.enum(translationIds).optional(),
  timersEnabled: z.boolean().optional(),
  chimeEnabled: z.boolean().optional(),
  stepSeconds: stepSeconds.optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  timezone: z.string().max(64).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBodyAs(event, schema)

  await getOrCreateSettings(userId)

  const patch = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined))
  if (!Object.keys(patch).length) {
    return await getOrCreateSettings(userId)
  }

  const [updated] = await useDb()
    .update(userSettings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userSettings.userId, userId))
    .returning()

  return updated
})
