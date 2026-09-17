<script setup lang="ts">
interface SessionSummary {
  id: string
  referenceDisplay: string
  translation: string
  wordOrPhrase: string | null
  status: 'in_progress' | 'completed'
  startedAt: string
  completedAt: string | null
}

useHead({ title: 'History' })

const { data, pending } = await useFetch<{ sessions: SessionSummary[]; hasMore: boolean }>('/api/sessions', {
  query: { limit: 100 },
  default: () => ({ sessions: [], hasMore: false }),
})

const { data: stats } = await useFetch<{ current: number; longest: number; total: number }>('/api/stats')

const formatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

function formatDate(iso: string) {
  return formatter.format(new Date(iso))
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
    <header class="mb-10">
      <h1 class="font-serif text-3xl text-ink">
        History
      </h1>
      <p
        v-if="stats?.total"
        class="mt-2 text-sm text-ink-faint"
      >
        {{ stats.total }} {{ stats.total === 1 ? 'session' : 'sessions' }}<template v-if="stats.longest > 1">
          · longest run {{ stats.longest }} days
        </template>
      </p>
    </header>

    <p
      v-if="pending"
      class="text-sm text-ink-faint"
    >
      Loading…
    </p>

    <p
      v-else-if="!data?.sessions.length"
      class="text-ink-soft"
    >
      Nothing here yet.
      <NuxtLink
        to="/"
        class="text-accent underline underline-offset-4"
      >
        Pray with a passage
      </NuxtLink>
      and it will be kept for you.
    </p>

    <ol
      v-else
      class="space-y-px"
    >
      <li
        v-for="session in data.sessions"
        :key="session.id"
      >
        <NuxtLink
          :to="session.status === 'completed' ? `/history/${session.id}` : `/pray/${session.id}`"
          class="block border-b border-rule/60 py-5 transition-colors hover:bg-paper-raised"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="font-serif text-lg text-ink">{{ session.referenceDisplay }}</span>
            <span class="text-xs text-ink-faint">{{ formatDate(session.startedAt) }}</span>
          </div>

          <p
            v-if="session.wordOrPhrase"
            class="mt-1.5 scripture-sm text-ink-soft"
          >
            “{{ session.wordOrPhrase }}”
          </p>

          <p
            v-if="session.status === 'in_progress'"
            class="mt-1.5 text-xs text-accent"
          >
            Unfinished — continue
          </p>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>
