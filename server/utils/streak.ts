const DAY_MS = 86_400_000

/**
 * The calendar date in a given IANA zone, as YYYY-MM-DD.
 * Streaks are counted in the user's own zone, so a session prayed at 11pm in
 * Manila belongs to that day and not to the UTC day after it.
 */
export function localDateIn(timezone: string, at: Date = new Date()): string {
  const format = (zone: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(at)

  try {
    return format(timezone)
  }
  catch {
    // An unknown zone string shouldn't lose someone's session.
    return format('UTC')
  }
}

function toMs(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year!, month! - 1, day!)
}

function fromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export interface StreakSummary {
  current: number
  longest: number
  total: number
  lastPrayedOn: string | null
  prayedToday: boolean
}

/**
 * @param dates  YYYY-MM-DD strings of days with a completed session (any order, may repeat)
 * @param today  YYYY-MM-DD in the user's zone
 */
export function computeStreak(dates: string[], today: string): StreakSummary {
  const unique = [...new Set(dates)].sort()
  const total = unique.length

  if (!total) {
    return { current: 0, longest: 0, total: 0, lastPrayedOn: null, prayedToday: false }
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    run = toMs(unique[i]!) - toMs(unique[i - 1]!) === DAY_MS ? run + 1 : 1
    if (run > longest) longest = run
  }

  const lastPrayedOn = unique[unique.length - 1]!
  const todayMs = toMs(today)
  const lastMs = toMs(lastPrayedOn)

  // A streak survives until the end of the following day — missing today does
  // not break it yet, so the app never nags you before the day is over.
  let current = 0
  if (lastMs === todayMs || lastMs === todayMs - DAY_MS) {
    current = 1
    for (let i = unique.length - 2; i >= 0; i--) {
      if (toMs(unique[i + 1]!) - toMs(unique[i]!) === DAY_MS) current++
      else break
    }
  }

  return { current, longest, total, lastPrayedOn, prayedToday: lastMs === todayMs }
}

export { fromMs as isoDate }
