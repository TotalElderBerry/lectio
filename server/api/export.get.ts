import { asc, eq } from 'drizzle-orm'
import { STEPS, prayerSessions, sessionSteps } from '../db/schema'

const HEADINGS: Record<string, string> = {
  read: 'Read',
  reflect: 'Reflect',
  respond: 'Respond',
  rest: 'Rest',
}

/** The whole journal as Markdown — your writing should never be locked in here. */
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()

  const sessions = await db
    .select()
    .from(prayerSessions)
    .where(eq(prayerSessions.userId, userId))
    .orderBy(asc(prayerSessions.startedAt))

  const steps = await db
    .select()
    .from(sessionSteps)
    .innerJoin(prayerSessions, eq(sessionSteps.sessionId, prayerSessions.id))
    .where(eq(prayerSessions.userId, userId))

  const bySession = new Map<string, Record<string, string>>()
  for (const row of steps) {
    const bucket = bySession.get(row.session_steps.sessionId) ?? {}
    bucket[row.session_steps.step] = row.session_steps.body
    bySession.set(row.session_steps.sessionId, bucket)
  }

  const lines: string[] = ['# Lectio Divina journal', '']

  for (const session of sessions) {
    const date = session.startedAt.toISOString().slice(0, 10)
    lines.push(`## ${date} — ${session.referenceDisplay}`, '')

    if (session.wordOrPhrase) {
      lines.push(`**Word or phrase:** ${session.wordOrPhrase}`, '')
    }

    lines.push('> ' + session.passageText.replace(/\n+/g, '\n> '), '')

    const bodies = bySession.get(session.id) ?? {}
    for (const step of STEPS) {
      const body = bodies[step]?.trim()
      if (body) lines.push(`### ${HEADINGS[step]}`, '', body, '')
    }
  }

  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  setHeader(event, 'content-disposition', 'attachment; filename="lectio-journal.md"')
  return lines.join('\n')
})
