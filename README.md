# Lectio

A quiet place to pray Lectio Divina — **Read, Reflect, Respond, Rest** — with a private journal
that syncs across your devices.

## The four movements

Each movement shows the passage again, with its own guiding question:

| | |
| --- | --- |
| **Read** | What word or phrase captures your attention and grabs your heart? |
| **Reflect** | What is God saying to you? Offering you? Asking you? |
| **Respond** | Speak to God of your feelings and insights. Offer these to God. |
| **Rest** | Sit quietly, asking, "What are you saying to me?" |

Timers are optional and never advance a step by themselves. Read also captures the single word or
phrase that struck you — over months, that line is what makes the journal worth re-reading.

## Stack

Nuxt 4 · Vue 3 · TypeScript · Tailwind v4 · Pinia · Nitro server routes · Neon Postgres · Drizzle ORM ·
`nuxt-auth-utils` (sealed cookie sessions, scrypt passwords).

## Scripture

Passages are fetched from [bible-api.com](https://bible-api.com) and cached permanently in
`passage_cache`. That cache is not an optimisation — the upstream allows only **15 requests per 30
seconds per IP**, and every user shares this server's IP. Scripture text is immutable, so each
`(translation, reference)` is fetched exactly once.

Available translations are all public domain: World English Bible, **Douay-Rheims**, King James,
American Standard, Bible in Basic English, and the **Clementine Vulgate**. Modern Catholic
translations (NABRE, RSV-CE, the Jerusalem Bible) are copyrighted and cannot be served this way — the
app lets you paste those in from your own missal instead.

## Setup

```bash
pnpm install
cp .env.example .env     # then fill in DATABASE_URL
pnpm db:migrate          # create the tables
pnpm dev
```

`.env` needs two values:

- `DATABASE_URL` — from the Neon dashboard: your project → **Connect** → connection string.
- `NUXT_SESSION_PASSWORD` — 32+ characters, used to encrypt the session cookie.
  Generate with `node -e "console.log(crypto.randomBytes(32).toString('base64url'))"`.

## Scripts

| Command | |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (streak maths, reference normalising) |
| `pnpm typecheck` | Type check |
| `pnpm db:generate` | Generate migration SQL from the schema |
| `pnpm db:migrate` | Apply pending migrations (use this) |
| `pnpm db:push` | Drizzle's direct sync — needs an interactive terminal |
| `pnpm db:studio` | Browse the data |

Schema changes go `db:generate` → review the SQL in `server/db/migrations/` → `db:migrate`.
`db:push` prompts for confirmation on a TTY, so it can't run unattended.

## Layout

```
app/           pages, components, composables, Pinia stores, curated passages
server/api/    auth, passage lookup, sessions, steps, stats, settings, export
server/db/     Drizzle schema and migrations
server/utils/  db connection, bible client, streak maths (auto-imported by Nitro)
shared/        translation list and reference normalising, used by both sides
test/          unit tests
```

## Privacy

Reflections are personal. Every session route is scoped by user id, and asking for someone else's
session returns 404 rather than 403 — a 403 would confirm the id exists. There is no admin view.
Settings offers a full Markdown export and account deletion, which cascades to every session.
