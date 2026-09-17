<script setup lang="ts">
import { CURATED_PASSAGES } from '~/data/curatedPassages'
import { TRANSLATIONS } from '~~/shared/utils/scripture'

const settingsStore = useSettingsStore()
const router = useRouter()

const reference = ref('')
const translation = ref(settingsStore.settings.defaultTranslation)
const manualText = ref('')
const showManual = ref(false)
const error = ref('')
const starting = ref(false)
const referenceField = useTemplateRef<HTMLInputElement>('referenceField')

watch(() => settingsStore.settings.defaultTranslation, (value) => {
  translation.value = value
})

function choose(passage: string) {
  reference.value = passage
  error.value = ''
  referenceField.value?.focus()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function begin() {
  if (!reference.value.trim() || starting.value) return

  starting.value = true
  error.value = ''

  try {
    const { session } = await $fetch<{ session: { id: string } }>('/api/sessions', {
      method: 'POST',
      body: {
        reference: reference.value.trim(),
        translation: translation.value,
        passageText: showManual.value && manualText.value.trim() ? manualText.value.trim() : undefined,
      },
    })
    await router.push(`/pray/${session.id}`)
  }
  catch (requestError) {
    const message = (requestError as { statusMessage?: string; data?: { statusMessage?: string; message?: string } })
    error.value = message.data?.statusMessage ?? message.statusMessage ?? message.data?.message
      ?? 'Something went wrong. Please try again.'
    // An outage or a reference we can't resolve shouldn't stop the prayer.
    showManual.value = true
  }
  finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
    <!-- align-self:start + sticky keeps the form in place while the suggestions scroll. -->
    <form
      class="space-y-4 lg:sticky lg:top-24 lg:self-start"
      @submit.prevent="begin"
    >
      <div>
        <label
          for="reference"
          class="mb-2 block text-sm text-ink-soft"
        >
          Passage
        </label>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            id="reference"
            ref="referenceField"
            v-model="reference"
            type="text"
            placeholder="John 3:16-21"
            autocomplete="off"
            class="flex-1 rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          >
          <select
            v-model="translation"
            aria-label="Translation"
            class="rounded-md border border-rule bg-paper-raised px-3 py-3 text-sm text-ink-soft focus:border-accent focus:outline-none"
          >
            <option
              v-for="option in TRANSLATIONS"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="showManual"
        class="rise"
      >
        <label
          for="manual"
          class="mb-2 block text-sm text-ink-soft"
        >
          Or paste the passage yourself
        </label>
        <textarea
          id="manual"
          v-model="manualText"
          rows="5"
          placeholder="Paste from your own Bible or missal…"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 scripture-sm text-ink placeholder:font-sans placeholder:text-base placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
      </div>

      <p
        v-if="error"
        class="text-sm text-danger"
        role="alert"
      >
        {{ error }}
      </p>

      <div class="flex items-center gap-4">
        <AppButton
          type="submit"
          :loading="starting"
          :disabled="!reference.trim()"
        >
          Begin
        </AppButton>

        <button
          v-if="!showManual"
          type="button"
          class="text-sm text-ink-faint transition-colors hover:text-ink"
          @click="showManual = true"
        >
          Paste your own text
        </button>
      </div>
    </form>

    <div class="mt-14 border-t border-rule/60 pt-10 lg:mt-0 lg:border-t-0 lg:pt-0">
      <h2 class="font-serif text-lg text-ink">
        If you don't know where to begin
      </h2>

      <div class="mt-6 space-y-7 lg:mt-7 lg:space-y-8">
        <section
          v-for="group in CURATED_PASSAGES"
          :key="group.theme"
        >
          <h3 class="text-sm text-ink-faint">
            {{ group.theme }}
          </h3>
          <ul class="mt-2.5 flex flex-wrap gap-2">
            <li
              v-for="passage in group.passages"
              :key="passage.reference"
            >
              <button
                type="button"
                class="rounded-full border border-rule px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-ink"
                :class="reference === passage.reference ? 'border-accent bg-accent-soft text-ink' : ''"
                :title="passage.title"
                @click="choose(passage.reference)"
              >
                {{ passage.reference }}
                <span class="text-ink-faint">— {{ passage.title }}</span>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
