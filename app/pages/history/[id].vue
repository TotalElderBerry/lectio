<script setup lang="ts">
import type { Step } from '~/data/steps'
import { STEP_DEFINITIONS } from '~/data/steps'
import { translationName } from '~~/shared/utils/scripture'

interface SessionDetail {
  id: string
  referenceDisplay: string
  translation: string
  passageText: string
  wordOrPhrase: string | null
  status: 'in_progress' | 'completed'
  startedAt: string
}

interface StepRow {
  step: Step
  body: string
  durationSeconds: number
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const { data, error } = await useFetch<{ session: SessionDetail; steps: StepRow[] }>(`/api/sessions/${id}`)

useHead({ title: () => data.value?.session.referenceDisplay ?? 'Session' })

const written = computed(() =>
  (data.value?.steps ?? [])
    .filter(row => row.body.trim())
    .map(row => ({ ...row, definition: STEP_DEFINITIONS[row.step] })),
)

const formatted = computed(() => {
  if (!data.value) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date(data.value.session.startedAt))
})

const removing = ref(false)
const confirming = ref(false)

async function remove() {
  if (removing.value) return
  removing.value = true
  try {
    await $fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    await router.push('/history')
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-5 py-12 sm:py-16">
    <p
      v-if="error"
      class="text-ink-soft"
    >
      That session could not be found.
      <NuxtLink
        to="/history"
        class="text-accent underline underline-offset-4"
      >
        Back to history
      </NuxtLink>
    </p>

    <template v-else-if="data">
      <header class="mb-8">
        <NuxtLink
          to="/history"
          class="text-sm text-ink-faint transition-colors hover:text-ink"
        >
          ← History
        </NuxtLink>
        <h1 class="mt-4 font-serif text-3xl text-ink">
          {{ data.session.referenceDisplay }}
        </h1>
        <p class="mt-1.5 text-sm text-ink-faint">
          {{ formatted }}
        </p>
      </header>

      <PassageText
        :reference="data.session.referenceDisplay"
        :text="data.session.passageText"
        :translation="translationName(data.session.translation)"
      />

      <div
        v-if="data.session.wordOrPhrase"
        class="mt-10 border-l-2 border-accent pl-5"
      >
        <p class="text-xs tracking-wide text-ink-faint uppercase">
          The word or phrase
        </p>
        <p class="mt-2 scripture text-ink">
          “{{ data.session.wordOrPhrase }}”
        </p>
      </div>

      <div
        v-if="written.length"
        class="mt-10 space-y-9"
      >
        <section
          v-for="row in written"
          :key="row.step"
        >
          <h2 class="font-serif text-xl text-ink">
            {{ row.definition.title }}
          </h2>
          <p class="mt-1 text-xs text-ink-faint">
            {{ row.definition.prompt }}
          </p>
          <p class="mt-3 whitespace-pre-wrap scripture-sm text-ink">
            {{ row.body }}
          </p>
        </section>
      </div>

      <p
        v-else
        class="mt-10 text-sm text-ink-faint"
      >
        Nothing was written in this session — it was prayed in silence.
      </p>

      <footer class="mt-14 border-t border-rule/60 pt-6">
        <button
          v-if="!confirming"
          type="button"
          class="text-sm text-ink-faint transition-colors hover:text-danger"
          @click="confirming = true"
        >
          Delete this session
        </button>

        <div
          v-else
          class="flex flex-wrap items-center gap-3"
        >
          <span class="text-sm text-ink-soft">Delete this permanently?</span>
          <AppButton
            variant="quiet"
            :loading="removing"
            @click="remove"
          >
            Delete
          </AppButton>
          <AppButton
            variant="ghost"
            @click="confirming = false"
          >
            Keep
          </AppButton>
        </div>
      </footer>
    </template>
  </div>
</template>
