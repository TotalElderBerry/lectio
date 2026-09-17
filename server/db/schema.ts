import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const STEPS = ['read', 'reflect', 'respond', 'rest'] as const
export type Step = (typeof STEPS)[number]

export type StepSeconds = Record<Step, number>

export interface CachedVerse {
  book_id: string
  book_name: string
  chapter: number
  verse: number
  text: string
}

export const sessionStatusEnum = pgEnum('session_status', ['in_progress', 'completed'])
export const stepEnum = pgEnum('step_name', STEPS)

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** Always stored lowercased and trimmed — see normalizeEmail(). */
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [uniqueIndex('users_email_unique').on(t.email)],
)

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultTranslation: text('default_translation').notNull().default('web'),
  timersEnabled: boolean('timers_enabled').notNull().default(false),
  chimeEnabled: boolean('chime_enabled').notNull().default(true),
  stepSeconds: jsonb('step_seconds')
    .$type<StepSeconds>()
    .notNull()
    .default({ read: 180, reflect: 240, respond: 240, rest: 300 }),
  /** 'system' | 'light' | 'dark' */
  theme: text('theme').notNull().default('system'),
  /** IANA zone, e.g. 'Asia/Manila'. Streaks are counted in this zone. */
  timezone: text('timezone').notNull().default('UTC'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const prayerSessions = pgTable(
  'prayer_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    referenceDisplay: text('reference_display').notNull(),
    referenceKey: text('reference_key').notNull(),
    translation: text('translation').notNull(),
    /**
     * Snapshot of the text as it was prayed. Deliberately duplicated from
     * passage_cache so an entry read back years later still shows the exact
     * words, regardless of cache eviction or a translation switch.
     */
    passageText: text('passage_text').notNull(),
    /** The word or phrase that captured the heart during Read. */
    wordOrPhrase: text('word_or_phrase'),
    status: sessionStatusEnum('status').notNull().default('in_progress'),
    /** YYYY-MM-DD in the user's timezone. Set on completion; drives streaks. */
    localDate: text('local_date'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  t => [
    index('prayer_sessions_user_started_idx').on(t.userId, t.startedAt.desc()),
    index('prayer_sessions_user_local_date_idx').on(t.userId, t.localDate),
  ],
)

export const sessionSteps = pgTable(
  'session_steps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => prayerSessions.id, { onDelete: 'cascade' }),
    step: stepEnum('step').notNull(),
    body: text('body').notNull().default(''),
    durationSeconds: integer('duration_seconds').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [uniqueIndex('session_steps_session_step_unique').on(t.sessionId, t.step)],
)

/**
 * bible-api.com allows only 15 requests per 30s per IP, and our server proxies
 * for every user from one IP. Scripture text is immutable, so each passage is
 * fetched exactly once and served from here forever after.
 */
export const passageCache = pgTable(
  'passage_cache',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    translation: text('translation').notNull(),
    referenceKey: text('reference_key').notNull(),
    referenceDisplay: text('reference_display').notNull(),
    text: text('text').notNull(),
    verses: jsonb('verses').$type<CachedVerse[]>().notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [uniqueIndex('passage_cache_translation_ref_unique').on(t.translation, t.referenceKey)],
)
