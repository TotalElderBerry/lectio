import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let cached: Db | undefined

/**
 * Neon over HTTP: no connection pool to manage, which is what we want on a
 * serverless host. Note there are no multi-statement transactions in HTTP
 * mode — nothing in this app needs them.
 */
export function useDb(): Db {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DATABASE_URL is not set. Copy .env.example to .env and fill it in.',
      })
    }
    cached = drizzle(neon(url), { schema })
  }
  return cached
}

export { schema }
