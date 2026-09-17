import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

/**
 * Applies everything in server/db/migrations that hasn't run yet, and records
 * it. Preferred over `drizzle-kit push`, which needs an interactive terminal
 * to confirm and leaves no history.
 */
const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const db = drizzle(neon(url))

await migrate(db, { migrationsFolder: './server/db/migrations' })

const [{ current_database: name }] = await neon(url)`select current_database()`
console.log(`Migrations applied to "${name}".`)
