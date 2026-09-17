import { and, eq } from 'drizzle-orm'
import type { CachedVerse } from '../db/schema'
import { passageCache } from '../db/schema'
import type { TranslationId } from '../../shared/utils/scripture'
import { isPlausibleReference, normalizeReference } from '../../shared/utils/scripture'

export interface Passage {
  reference: string
  translation: TranslationId
  text: string
  verses: CachedVerse[]
  /** True when served from passage_cache rather than the upstream API. */
  cached: boolean
}

interface BibleApiResponse {
  reference?: string
  verses?: CachedVerse[]
  text?: string
  error?: string
}

/** The API pads verse text with newlines; collapse to single spaces. */
function tidy(text: string): string {
  return text.replace(/\s*\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim()
}

/**
 * Resolves a passage, preferring our own cache.
 *
 * bible-api.com is rate limited to 15 requests per 30 seconds per IP, and every
 * user of this app shares our server's IP. Because Scripture text never
 * changes, one successful fetch per (translation, reference) is enough forever.
 */
export async function resolvePassage(rawReference: string, translation: TranslationId): Promise<Passage> {
  const referenceKey = normalizeReference(rawReference)

  if (!isPlausibleReference(referenceKey)) {
    throw createError({
      statusCode: 400,
      statusMessage: "That doesn't look like a Scripture reference. Try something like “John 3:16-21”.",
    })
  }

  const db = useDb()

  const [hit] = await db
    .select()
    .from(passageCache)
    .where(and(eq(passageCache.translation, translation), eq(passageCache.referenceKey, referenceKey)))
    .limit(1)

  if (hit) {
    return {
      reference: hit.referenceDisplay,
      translation,
      text: hit.text,
      verses: hit.verses,
      cached: true,
    }
  }

  const base = useRuntimeConfig().bibleApiBase
  const url = `${base}/${encodeURIComponent(referenceKey)}?translation=${translation}`

  let response: BibleApiResponse
  try {
    response = await $fetch<BibleApiResponse>(url, {
      timeout: 8000,
      retry: 0,
      headers: { accept: 'application/json' },
    })
  }
  catch (error) {
    const status = (error as { status?: number; statusCode?: number }).status
      ?? (error as { statusCode?: number }).statusCode

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: `We couldn't find “${rawReference}” in that translation. Check the spelling of the book, or try another translation.`,
      })
    }
    if (status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Scripture lookup is busy just now. Wait half a minute, or paste the passage in yourself below.',
      })
    }
    throw createError({
      statusCode: 502,
      statusMessage: "We couldn't reach the Scripture service. You can paste the passage in yourself below and pray as normal.",
    })
  }

  const verses = (response.verses ?? []).map(verse => ({ ...verse, text: tidy(verse.text) }))

  if (!verses.length || !response.reference) {
    throw createError({
      statusCode: 404,
      statusMessage: `We couldn't find “${rawReference}”. Check the spelling of the book, or try another translation.`,
    })
  }

  const text = verses.map(v => v.text).join(' ')

  // Concurrent first-time requests for the same passage can race here; the
  // unique index makes the loser a no-op rather than a duplicate row.
  await db
    .insert(passageCache)
    .values({
      translation,
      referenceKey,
      referenceDisplay: response.reference,
      text,
      verses,
    })
    .onConflictDoNothing({ target: [passageCache.translation, passageCache.referenceKey] })

  return { reference: response.reference, translation, text, verses, cached: false }
}
