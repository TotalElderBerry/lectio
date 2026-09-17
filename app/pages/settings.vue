<script setup lang="ts">
import { STEP_LIST } from '~/data/steps'
import { TRANSLATIONS } from '~~/shared/utils/scripture'
import type { Theme } from '~/stores/settings'

const settingsStore = useSettingsStore()
const { user, clear } = useUserSession()
const router = useRouter()
const { ring } = useChime()

useHead({ title: 'Settings' })

onMounted(() => settingsStore.load())

const settings = computed(() => settingsStore.settings)
const themes: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function minutesOf(seconds: number) {
  return Math.round(seconds / 60)
}

async function setMinutes(step: string, minutes: number) {
  const next = { ...settings.value.stepSeconds, [step]: Math.max(1, Math.min(60, minutes)) * 60 }
  await settingsStore.update({ stepSeconds: next })
}

// Deleting an account takes the journal with it, so it asks for the password.
const deleting = ref(false)
const showDelete = ref(false)
const deletePassword = ref('')
const deleteError = ref('')

async function deleteAccount() {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch('/api/account', { method: 'DELETE', body: { password: deletePassword.value } })
    await clear()
    settingsStore.reset()
    await router.push('/login')
  }
  catch (error) {
    const payload = error as { statusMessage?: string; data?: { statusMessage?: string } }
    deleteError.value = payload.data?.statusMessage ?? payload.statusMessage ?? 'We could not delete the account.'
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-5 py-12 sm:py-16">
    <h1 class="font-serif text-3xl text-ink">
      Settings
    </h1>
    <p class="mt-2 text-sm text-ink-faint">
      Signed in as {{ user?.email }}
    </p>

    <div class="mt-12 space-y-12">
      <section>
        <h2 class="font-serif text-xl text-ink">
          Scripture
        </h2>
        <label
          for="translation"
          class="mt-4 mb-2 block text-sm text-ink-soft"
        >
          Preferred translation
        </label>
        <select
          id="translation"
          :value="settings.defaultTranslation"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none sm:w-auto"
          @change="settingsStore.update({ defaultTranslation: ($event.target as HTMLSelectElement).value })"
        >
          <option
            v-for="option in TRANSLATIONS"
            :key="option.id"
            :value="option.id"
          >
            {{ option.name }} — {{ option.note }}
          </option>
        </select>
        <p class="mt-2 text-xs text-ink-faint">
          All public domain. Modern Catholic translations are copyrighted and cannot be served here — paste
          those in from your own missal when you want them.
        </p>
      </section>

      <section>
        <h2 class="font-serif text-xl text-ink">
          Timers
        </h2>
        <p class="mt-1 text-sm text-ink-faint">
          A gentle marker, never a deadline. The timer never moves you on by itself.
        </p>

        <label class="mt-4 flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            :checked="settings.timersEnabled"
            class="size-4 accent-[var(--accent)]"
            @change="settingsStore.update({ timersEnabled: ($event.target as HTMLInputElement).checked })"
          >
          Show a timer in each movement
        </label>

        <label class="mt-3 flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            :checked="settings.chimeEnabled"
            class="size-4 accent-[var(--accent)]"
            @change="settingsStore.update({ chimeEnabled: ($event.target as HTMLInputElement).checked })"
          >
          Sound a soft chime when the time is up
          <button
            type="button"
            class="text-xs text-ink-faint underline underline-offset-4 hover:text-ink"
            @click.prevent="ring()"
          >
            hear it
          </button>
        </label>

        <div
          v-if="settings.timersEnabled"
          class="mt-6 space-y-3"
        >
          <div
            v-for="item in STEP_LIST"
            :key="item.key"
            class="flex items-center gap-4"
          >
            <span class="w-20 text-sm text-ink-soft">{{ item.title }}</span>
            <input
              type="range"
              min="1"
              max="30"
              :value="minutesOf(settings.stepSeconds[item.key])"
              class="flex-1 accent-[var(--accent)]"
              @change="setMinutes(item.key, Number(($event.target as HTMLInputElement).value))"
            >
            <span class="w-16 text-right text-sm tabular-nums text-ink-faint">
              {{ minutesOf(settings.stepSeconds[item.key]) }} min
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="font-serif text-xl text-ink">
          Appearance
        </h2>
        <div class="mt-4 flex gap-2">
          <button
            v-for="option in themes"
            :key="option.value"
            type="button"
            class="rounded-full border px-4 py-2 text-sm transition-colors"
            :class="settings.theme === option.value
              ? 'border-accent bg-accent-soft text-ink'
              : 'border-rule text-ink-soft hover:text-ink'"
            @click="settingsStore.update({ theme: option.value })"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section>
        <h2 class="font-serif text-xl text-ink">
          Your journal
        </h2>
        <p class="mt-1 text-sm text-ink-faint">
          Everything you have written, as a Markdown file. It is yours.
        </p>
        <a
          href="/api/export"
          class="mt-4 inline-flex rounded-full border border-rule px-5 py-2.5 text-sm text-ink transition-colors hover:bg-paper-sunk"
        >
          Download my journal
        </a>
      </section>

      <section class="border-t border-rule/60 pt-8">
        <button
          v-if="!showDelete"
          type="button"
          class="text-sm text-ink-faint transition-colors hover:text-danger"
          @click="showDelete = true"
        >
          Delete my account
        </button>

        <div
          v-else
          class="space-y-3"
        >
          <p class="text-sm text-ink-soft">
            This deletes your account and every session you have written. It cannot be undone.
            Consider downloading your journal first.
          </p>
          <input
            v-model="deletePassword"
            type="password"
            placeholder="Your password"
            autocomplete="current-password"
            class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none sm:w-72"
          >
          <p
            v-if="deleteError"
            class="text-sm text-danger"
          >
            {{ deleteError }}
          </p>
          <div class="flex gap-3">
            <AppButton
              variant="quiet"
              :loading="deleting"
              :disabled="!deletePassword"
              @click="deleteAccount"
            >
              Delete everything
            </AppButton>
            <AppButton
              variant="ghost"
              @click="showDelete = false"
            >
              Cancel
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
