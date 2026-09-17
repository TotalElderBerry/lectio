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
const translationMenuOpen = ref(false)
const translationMenu = useTemplateRef<HTMLDivElement>('translationMenu')
const translationTrigger = useTemplateRef<HTMLButtonElement>('translationTrigger')

const selectedTranslation = computed(() => TRANSLATIONS.find(option => option.id === settings.value.defaultTranslation) ?? TRANSLATIONS[0])

function selectTranslation(id: string) {
  translationMenuOpen.value = false
  void settingsStore.update({ defaultTranslation: id })
  translationTrigger.value?.focus()
}

function closeTranslationMenu(event: MouseEvent) {
  if (translationMenu.value && !translationMenu.value.contains(event.target as Node)) {
    translationMenuOpen.value = false
  }
}

function closeTranslationMenuOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    translationMenuOpen.value = false
    translationTrigger.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', closeTranslationMenu)
  document.addEventListener('keydown', closeTranslationMenuOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeTranslationMenu)
  document.removeEventListener('keydown', closeTranslationMenuOnEscape)
})

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
        <div
          ref="translationMenu"
          class="relative w-full sm:w-96"
        >
          <button
            ref="translationTrigger"
            id="translation"
            type="button"
            aria-label="Preferred translation"
            aria-haspopup="listbox"
            :aria-expanded="translationMenuOpen"
            class="flex w-full items-center justify-between gap-3 rounded-md border border-rule bg-paper-raised px-4 py-3 text-left text-ink transition-[border-color,box-shadow] hover:border-ink-faint focus:border-accent focus:outline-none"
            :class="translationMenuOpen ? 'border-accent shadow-[0_0_0_3px_var(--accent-soft)]' : ''"
            @click.stop="translationMenuOpen = !translationMenuOpen"
          >
            <span class="min-w-0 truncate">{{ selectedTranslation.name }} — {{ selectedTranslation.note }}</span>
            <svg
              aria-hidden="true"
              class="h-4 w-4 shrink-0 text-ink-faint transition-transform"
              :class="translationMenuOpen ? 'rotate-180' : ''"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="m5 7.5 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div
            v-if="translationMenuOpen"
            class="rise absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full overflow-hidden rounded-lg border border-rule bg-paper-raised py-1.5 shadow-[0_12px_30px_rgb(44_39_36/0.12)]"
            role="listbox"
            aria-label="Preferred Bible translation"
          >
            <button
              v-for="option in TRANSLATIONS"
              :key="option.id"
              type="button"
              role="option"
              :aria-selected="settings.defaultTranslation === option.id"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent-soft"
              :class="settings.defaultTranslation === option.id ? 'text-ink' : 'text-ink-soft'"
              @click="selectTranslation(option.id)"
            >
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm">{{ option.name }}</span>
                <span class="text-xs text-ink-faint">{{ option.note }}</span>
              </span>
              <svg
                v-if="settings.defaultTranslation === option.id"
                aria-hidden="true"
                class="h-4 w-4 shrink-0 text-accent"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path d="m4 10.5 3.5 3.5L16 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
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
