<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import type { Step } from '~/data/steps'
import { STEPS, STEP_DEFINITIONS, STEP_LIST } from '~/data/steps'
import { formatClock } from '~/composables/useStepClock'
import { translationName } from '~~/shared/utils/scripture'

const route = useRoute()
const router = useRouter()
const prayer = usePrayerStore()
const settingsStore = useSettingsStore()
const { ring } = useChime()

const { elapsed, remaining, target, running, reachedTarget, start, pause, reset } = useStepClock()

const sessionId = route.params.id as string
const loading = ref(true)
const loadError = ref('')
const finished = ref(false)
const finishing = ref(false)

const settings = computed(() => settingsStore.settings)
const step = computed(() => prayer.currentStep)
const definition = computed(() => STEP_DEFINITIONS[step.value])
const stepIndex = computed(() => STEPS.indexOf(step.value))
const isLastStep = computed(() => stepIndex.value === STEPS.length - 1)
const nextStepTitle = computed(() => {
  const next = STEPS[stepIndex.value + 1]
  return next ? STEP_DEFINITIONS[next].title : ''
})

useHead({ title: () => prayer.session?.referenceDisplay ?? 'Prayer' })

const body = computed({
  get: () => prayer.bodies[step.value],
  set: (value: string) => prayer.setBody(step.value, value),
})

const wordOrPhrase = computed({
  get: () => prayer.wordOrPhrase,
  set: (value: string) => prayer.setWordOrPhrase(value),
})

const saveLabel = computed(() => {
  switch (prayer.status) {
    case 'saving': return 'Saving…'
    case 'saved': return 'Saved'
    case 'error': return 'Not saved — we will keep trying'
    default: return ''
  }
})

/** The movement being announced by the veil, or null once the page is in view. */
const introStep = ref<Step | null>(null)
const introDefinition = computed(() => (introStep.value ? STEP_DEFINITIONS[introStep.value] : null))

/**
 * Re-arm the clock whenever the movement changes. It waits for the veil to
 * lift: the seconds spent preparing are not seconds spent in the movement.
 */
function armClock() {
  const seconds = settings.value.timersEnabled ? (settings.value.stepSeconds[step.value] ?? 0) : 0
  reset(prayer.durations[step.value] ?? 0, seconds)
  if (settings.value.timersEnabled && !introStep.value) start()
}

/** A breath between movements: the name and how to approach it, then the page. */
function announce() {
  introStep.value = step.value
  armClock()
}

function onIntroDone() {
  introStep.value = null
  if (settings.value.timersEnabled) start()
}

async function goTo(next: Step) {
  pause()
  prayer.setDuration(step.value, elapsed.value)
  prayer.setStep(next)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function back() {
  const previous = STEPS[stepIndex.value - 1]
  if (previous) void goTo(previous)
}

function forward() {
  const next = STEPS[stepIndex.value + 1]
  if (next) void goTo(next)
}

async function finish() {
  if (finishing.value) return
  finishing.value = true
  pause()
  prayer.setDuration(step.value, elapsed.value)

  try {
    await prayer.complete()
    if (settings.value.chimeEnabled) ring(264)
    finished.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch {
    loadError.value = 'We could not save the end of this session. Check your connection and try again.'
  }
  finally {
    finishing.value = false
  }
}

// Nothing written should be lost to a closed tab or a stray navigation.
function onBeforeUnload(event: BeforeUnloadEvent) {
  void prayer.flush()
  if (prayer.hasUnsaved) event.preventDefault()
}

// Loaded on the client rather than during SSR: this is private, per-user
// content behind a session cookie, and it keeps setup free of a top-level
// await (which would register the hooks below after a suspension point).
onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnload)

  await settingsStore.load()

  try {
    const session = await prayer.open(sessionId)
    finished.value = session.status === 'completed'
    if (finished.value) armClock()
    else announce()
  }
  catch {
    loadError.value = 'That session could not be found.'
  }
  finally {
    loading.value = false
  }
})

watch(step, announce)
watch(() => settings.value.timersEnabled, armClock)

// Banked seconds live in the store; they ride along with the next save.
watch(elapsed, value => prayer.setDuration(step.value, value))

watch(reachedTarget, (reached) => {
  if (reached && settings.value.chimeEnabled) ring()
})

onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
onBeforeRouteLeave(async () => {
  await prayer.flush()
})
onUnmounted(() => prayer.close())
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14 lg:max-w-6xl lg:px-8">
    <p
      v-if="loading"
      class="py-20 text-center text-sm text-ink-faint"
    >
      Opening…
    </p>

    <p
      v-else-if="loadError"
      class="py-20 text-center text-ink-soft"
    >
      {{ loadError }}
      <NuxtLink
        to="/"
        class="text-accent underline underline-offset-4"
      >
        Begin a new session
      </NuxtLink>
    </p>

    <!-- The quiet close. No celebration, no score. -->
    <div
      v-else-if="finished"
      class="rise py-10 text-center"
    >
      <p class="font-serif text-2xl text-ink">
        Amen.
      </p>
      <p
        v-if="prayer.wordOrPhrase"
        class="mx-auto mt-6 max-w-md scripture text-ink-soft"
      >
        “{{ prayer.wordOrPhrase }}”
      </p>
      <p class="mt-8 text-sm text-ink-faint">
        {{ prayer.session?.referenceDisplay }}
      </p>

      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <AppButton
          variant="quiet"
          @click="router.push('/')"
        >
          Return home
        </AppButton>
        <AppButton
          variant="ghost"
          @click="router.push(`/history/${sessionId}`)"
        >
          Read it back
        </AppButton>
      </div>
    </div>

    <!--
      Desktop holds the passage beside the writing rather than above it, so
      Scripture stays in view through all four movements — the practice asks you
      to re-read it each time. Below lg it stacks, as before.
    -->
    <div
      v-else-if="prayer.session"
      class="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
    >
      <nav
        class="mb-8 flex items-center gap-1.5 lg:col-start-2 lg:row-start-1 lg:mb-0"
        aria-label="Movements"
      >
        <button
          v-for="(item, index) in STEP_LIST"
          :key="item.key"
          type="button"
          class="flex-1 border-t-2 pt-2 text-left text-xs transition-colors"
          :class="index <= stepIndex ? 'border-accent text-ink' : 'border-rule text-ink-faint hover:border-ink-faint'"
          :aria-current="item.key === step ? 'step' : undefined"
          @click="goTo(item.key)"
        >
          {{ item.title }}
        </button>
      </nav>

      <!--
        The movement and how to approach it come before the passage: on a phone
        that is the order you act in, and it keeps what the veil just said in
        view while you read.
      -->
      <header
        :key="`head-${step}`"
        class="rise mb-6 lg:col-start-2 lg:row-start-2 lg:mt-8 lg:mb-0"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 class="font-serif text-2xl text-ink">
            {{ definition.title }}
            <span class="ml-1.5 text-base italic text-ink-faint">{{ definition.latin }}</span>
          </h1>

          <StepTimer
            v-if="settings.timersEnabled"
            :remaining="remaining"
            :target="target"
            :running="running"
            :reached="reachedTarget"
            @toggle="running ? pause() : start()"
          />
        </div>

        <p class="mt-3 text-sm text-ink-faint">
          {{ definition.instruction }}
        </p>
      </header>

      <!-- Spans every row and stretches, giving the sticky figure room to travel. -->
      <div class="lg:col-start-1 lg:row-span-3 lg:row-start-1">
        <PassageText
          sticky
          :reference="prayer.session.referenceDisplay"
          :text="prayer.session.passageText"
          :translation="translationName(prayer.session.translation)"
        />
      </div>

      <section
        :key="step"
        class="rise mt-10 lg:col-start-2 lg:row-start-3 lg:mt-7"
      >
        <p class="scripture-sm text-ink-soft">
          {{ definition.prompt }}
        </p>

        <!-- Captured once, in Read: the line that makes the journal worth re-reading. -->
        <div
          v-if="step === 'read'"
          class="mt-7"
        >
          <label
            for="word"
            class="mb-2 block text-sm text-ink-soft"
          >
            The word or phrase
          </label>
          <input
            id="word"
            v-model="wordOrPhrase"
            type="text"
            maxlength="300"
            class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 font-serif text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          >
        </div>

        <div class="mt-7">
          <label
            for="reflection"
            class="mb-2 block text-sm text-ink-soft"
          >
            {{ step === 'rest' ? 'Anything you wish to keep' : 'Your reflection' }}
          </label>
          <textarea
            id="reflection"
            v-model="body"
            rows="9"
            :placeholder="definition.placeholder"
            class="w-full resize-y rounded-md border border-rule bg-paper-raised px-4 py-3.5 scripture-sm text-ink placeholder:font-sans placeholder:text-base placeholder:text-ink-faint focus:border-accent focus:outline-none lg:min-h-[22rem]"
          />
          <p
            class="mt-2 h-4 text-xs"
            :class="prayer.status === 'error' ? 'text-danger' : 'text-ink-faint'"
          >
            {{ saveLabel }}
          </p>
        </div>

        <div class="mt-8 flex items-center justify-between gap-4">
          <AppButton
            v-if="stepIndex > 0"
            variant="ghost"
            @click="back"
          >
            Back
          </AppButton>
          <span v-else />

          <AppButton
            v-if="!isLastStep"
            @click="forward"
          >
            {{ nextStepTitle }}
          </AppButton>
          <AppButton
            v-else
            :loading="finishing"
            @click="finish"
          >
            Finish
          </AppButton>
        </div>

        <p
          v-if="settings.timersEnabled && target"
          class="mt-5 text-center text-xs text-ink-faint"
        >
          {{ formatClock(elapsed) }} in this movement. The timer never moves you on.
        </p>
      </section>
    </div>

    <StepIntro
      :step="introDefinition"
      @done="onIntroDone"
    />
  </div>
</template>
