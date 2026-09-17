/**
 * Shared by the browser and the server, so the translation list and the
 * reference normaliser can never drift apart.
 *
 * All of these are public domain — modern Catholic translations (NABRE,
 * RSV-CE, the Jerusalem Bible) are copyrighted and cannot be served this way.
 */
export const TRANSLATIONS = [
  { id: 'web', name: 'World English Bible', note: 'Modern English' },
  { id: 'dra', name: 'Douay-Rheims', note: 'Catholic, 1899' },
  { id: 'kjv', name: 'King James Version', note: 'Classic English' },
  { id: 'asv', name: 'American Standard', note: 'Literal, 1901' },
  { id: 'bbe', name: 'Bible in Basic English', note: 'Plain words' },
  { id: 'clementine', name: 'Clementine Vulgate', note: 'Latin' },
] as const

export type TranslationId = (typeof TRANSLATIONS)[number]['id']

export const DEFAULT_TRANSLATION: TranslationId = 'web'

const TRANSLATION_IDS = new Set<string>(TRANSLATIONS.map(t => t.id))

export function isTranslationId(value: unknown): value is TranslationId {
  return typeof value === 'string' && TRANSLATION_IDS.has(value)
}

/** Label for a translation id, including the 'custom' marker for pasted text. */
export function translationName(id: string): string {
  if (id === 'custom') return 'Your own text'
  return TRANSLATIONS.find(t => t.id === id)?.name ?? id
}

/**
 * Collapses the many ways someone might type the same passage
 * ("John 3:16-17", "john 3 : 16 – 17", "John  3:16-17.") onto one cache key,
 * so we don't re-fetch a passage we already hold.
 */
export function normalizeReference(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[‐-―−]/g, '-') // unicode dashes -> hyphen
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ',')
    // Trailing punctuation and any space it leaves behind, together — stripping
    // the period alone would turn "Psalm 23 ." into the key "psalm 23 ".
    .replace(/[\s.]+$/, '')
}

/** A reference has to contain at least one letter and stay a sane length. */
export function isPlausibleReference(normalized: string): boolean {
  return normalized.length > 0 && normalized.length <= 100 && /[a-z]/.test(normalized)
}
