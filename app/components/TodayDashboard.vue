<script setup lang="ts">
interface Streak {
  current: number
  longest: number
  total: number
  prayedToday: boolean
}

interface SessionSummary {
  id: string
  referenceDisplay: string
  status: 'in_progress' | 'completed'
  startedAt: string
}

const { user } = useUserSession()

const { data: stats } = await useFetch<Streak>('/api/stats')
const { data: recent } = await useFetch<{ sessions: SessionSummary[] }>('/api/sessions', {
  query: { limit: 5 },
})

const unfinished = computed(() => recent.value?.sessions.find(s => s.status === 'in_progress') ?? null)

const greeting = computed(() => {
  const name = user.value?.displayName?.split(' ')[0]
  const hour = new Date().getHours()
  const time = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${time}, ${name}` : time
})

const streakNote = computed(() => {
  const s = stats.value
  if (!s || !s.total) return null
  if (s.prayedToday) return 'You have prayed today.'
  if (s.current > 1) return `${s.current} days in a row.`
  if (s.current === 1) return 'You prayed yesterday.'
  return `${s.total} ${s.total === 1 ? 'session' : 'sessions'} so far.`
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16 lg:max-w-6xl lg:px-8 lg:py-20">
    <header class="mb-10 lg:mb-14">
      <h1 class="font-serif text-3xl text-ink sm:text-4xl lg:text-5xl">
        {{ greeting }}
      </h1>
      <p
        v-if="streakNote"
        class="mt-2 text-sm text-ink-faint lg:mt-3"
      >
        {{ streakNote }}
      </p>
    </header>

    <NuxtLink
      v-if="unfinished"
      :to="`/pray/${unfinished.id}`"
      class="mb-10 flex items-center justify-between gap-4 rounded-lg border border-accent/40 bg-accent-soft px-5 py-4 transition-colors hover:border-accent lg:mb-12 lg:max-w-md"
    >
      <span class="text-sm text-ink">
        Continue with
        <span class="font-serif text-base">{{ unfinished.referenceDisplay }}</span>
      </span>
      <span
        class="text-ink-soft"
        aria-hidden="true"
      >→</span>
    </NuxtLink>

    <PassagePicker />
  </div>
</template>
