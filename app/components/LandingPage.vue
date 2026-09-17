<script setup lang="ts">
import { STEP_LIST } from '~/data/steps'

const sections = [
  { id: 'what', label: 'What it is' },
  { id: 'history', label: 'History' },
  { id: 'how', label: 'How to pray it' },
]

const milestones = [
  {
    when: '3rd century',
    who: 'Origen of Alexandria',
    what: 'Origen writes of Scripture as a living voice rather than a closed text, and of reading it as an encounter with the One who speaks. The Greek phrase he uses for that reading is the ancestor of the Latin lectio divina.',
  },
  {
    when: 'c. 530',
    who: 'The Rule of St. Benedict',
    what: 'Benedict sets aside several hours of every monastic day for lectio divina, alongside work and the Divine Office. For the next thousand years this unhurried, prayerful reading is simply how monks live with the Bible.',
  },
  {
    when: 'c. 1150',
    who: 'Guigo II, The Ladder of Monks',
    what: 'A Carthusian prior names the four movements still used today — lectio, meditatio, oratio, contemplatio — and pictures them as rungs of a ladder set between earth and heaven. This is the first time the practice is written down as a method.',
  },
  {
    when: '1965',
    who: 'Dei Verbum, Second Vatican Council',
    what: 'After centuries in which the practice stayed largely behind monastery walls, the Council urges every believer to come to Scripture through prayer, so that the conversation between God and the reader begins again.',
  },
  {
    when: '2010',
    who: 'Verbum Domini, Benedict XVI',
    what: 'Lectio divina is commended to the whole Church, with the hope that it would bring "a new spiritual springtime" — one reason the practice is now as much at home on a commute as in a cloister.',
  },
]

const before = [
  'Find a quiet place and a length of time you can protect. Twenty minutes is plenty.',
  'Choose a short passage. A few verses are better than a chapter — the point is depth, not distance.',
  'Settle. Ask the Holy Spirit to open the words to you, then let the silence sit for a moment before you read.',
]

const offerings = [
  {
    title: 'The passage, ready',
    body: 'Enter a reference or take a curated one. The text returns at every movement, in a public-domain translation — or pasted in from your own missal.',
  },
  {
    title: 'Timers that never rush you',
    body: 'Optional, and they never advance a step by themselves. A chime marks the time; staying longer is always allowed.',
  },
  {
    title: 'A journal that stays yours',
    body: 'Every reflection is private to your account, saved as you write, and exportable as Markdown whenever you want it back.',
  },
]
</script>

<template>
  <div class="bg-paper">
    <header class="border-b border-rule/70">
      <div class="mx-auto flex w-full max-w-5xl items-center gap-6 px-5 py-5 lg:px-8">
        <NuxtLink
          to="/"
          class="font-serif text-xl tracking-tight text-ink"
        >
          Lectio
        </NuxtLink>

        <nav class="ml-auto hidden items-center gap-7 text-sm sm:flex">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="'#' + section.id"
            class="text-ink-soft transition-colors hover:text-ink"
          >
            {{ section.label }}
          </a>
        </nav>

        <NuxtLink
          to="/login"
          class="ml-auto text-sm text-ink-soft transition-colors hover:text-ink sm:ml-0"
        >
          Sign in
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="mx-auto w-full max-w-5xl px-5 pt-16 pb-14 sm:pt-24 sm:pb-20 lg:px-8">
      <p class="text-sm uppercase tracking-[0.18em] text-ink-faint">
        Lectio Divina
      </p>
      <h1 class="mt-5 max-w-2xl font-serif text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-6xl">
        An ancient way of reading Scripture slowly enough to hear it.
      </h1>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
        Four movements — read, reflect, respond, rest — and one short passage you return to four
        times. Lectio gives you the text, the questions and a private journal, then stays out of the
        way.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-5">
        <NuxtLink to="/register">
          <AppButton>Begin praying</AppButton>
        </NuxtLink>
        <a
          href="#how"
          class="text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
        >
          Or read how it is done
        </a>
      </div>

      <ol class="mt-14 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-4">
        <li
          v-for="(step, index) in STEP_LIST"
          :key="step.key"
          class="bg-paper-raised px-5 py-5"
        >
          <span class="text-xs tabular-nums text-ink-faint">0{{ index + 1 }}</span>
          <p class="mt-1 font-serif text-xl text-ink">
            {{ step.title }}
          </p>
          <p class="mt-0.5 font-serif text-sm italic text-ink-faint">
            {{ step.latin }}
          </p>
        </li>
      </ol>
    </section>

    <!-- What is Lectio Divina? -->
    <section
      id="what"
      class="scroll-mt-4 border-t border-rule/70 bg-paper-sunk"
    >
      <div class="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 class="font-serif text-3xl text-ink sm:text-4xl">
              What is Lectio Divina?
            </h2>
            <p class="mt-3 text-sm text-ink-faint">
              Latin for <span class="font-serif italic">divine reading</span>.
            </p>
          </div>

          <div class="max-w-2xl space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Lectio Divina is a way of praying <em>with</em> Scripture rather than only reading it.
              You take a short passage — a few verses — and read it slowly, several times over, with
              silence in between. Each reading asks a different posture of you: first you notice,
              then you ponder, then you answer, then you simply stay.
            </p>
            <p>
              It is not Bible study. Study asks what a text meant, and asks it of the whole text.
              Lectio asks what God is saying through it now, to you, today, and is content to receive
              a single line. The tradition puts it plainly: in study you read the text; in lectio the
              text reads you.
            </p>
            <p class="text-ink">
              There is nothing to finish and no insight you are required to reach. A session in which
              one phrase held you for twenty minutes is a session that went well.
            </p>
          </div>
        </div>

        <div class="mt-14 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
          <div class="bg-paper-raised px-6 py-7">
            <p class="text-xs uppercase tracking-[0.14em] text-ink-faint">
              Bible study asks
            </p>
            <p class="mt-3 font-serif text-xl leading-relaxed text-ink">
              What does this passage mean?
            </p>
            <p class="mt-3 text-sm leading-relaxed text-ink-soft">
              Context, language, history. Good and necessary work — a different work.
            </p>
          </div>
          <div class="bg-paper-raised px-6 py-7">
            <p class="text-xs uppercase tracking-[0.14em] text-ink-faint">
              Lectio Divina asks
            </p>
            <p class="mt-3 font-serif text-xl leading-relaxed text-ink">
              What is God saying to me here?
            </p>
            <p class="mt-3 text-sm leading-relaxed text-ink-soft">
              One word may be the whole of it. You are listening, not solving.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- A brief history -->
    <section
      id="history"
      class="scroll-mt-4 border-t border-rule/70"
    >
      <div class="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24 lg:px-8">
        <h2 class="font-serif text-3xl text-ink sm:text-4xl">
          A brief history
        </h2>
        <p class="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The practice is older than the method. Long before anyone counted four movements, Jewish
          prayer already meant murmuring the Scriptures over and over until they were known by heart
          — and the early Church read them the same way.
        </p>

        <ol class="mt-12 border-l border-rule">
          <li
            v-for="milestone in milestones"
            :key="milestone.when"
            class="relative pb-10 pl-6 last:pb-0 sm:pl-10"
          >
            <span
              class="absolute -left-[4.5px] top-2 size-2 rounded-full bg-accent"
              aria-hidden="true"
            />
            <p class="text-sm tabular-nums text-ink-faint">
              {{ milestone.when }}
            </p>
            <h3 class="mt-1 font-serif text-2xl text-ink">
              {{ milestone.who }}
            </h3>
            <p class="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              {{ milestone.what }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- How to pray it -->
    <section
      id="how"
      class="scroll-mt-4 border-t border-rule/70 bg-paper-sunk"
    >
      <div class="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24 lg:px-8">
        <h2 class="font-serif text-3xl text-ink sm:text-4xl">
          How to pray Lectio Divina
        </h2>
        <p class="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The same passage, read four times, with a different question each time.
        </p>

        <div class="mt-12 rounded-lg border border-rule bg-paper-raised px-6 py-7 sm:px-8">
          <h3 class="font-serif text-xl text-ink">
            Before you begin
          </h3>
          <ul class="mt-4 space-y-3">
            <li
              v-for="item in before"
              :key="item"
              class="flex gap-3 leading-relaxed text-ink-soft"
            >
              <span
                class="mt-2.5 size-1 shrink-0 rounded-full bg-ink-faint"
                aria-hidden="true"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <ol class="mt-6 space-y-4">
          <li
            v-for="(step, index) in STEP_LIST"
            :key="step.key"
            class="rounded-lg border border-rule bg-paper-raised px-6 py-7 sm:px-8"
          >
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span class="font-serif text-2xl tabular-nums text-accent">{{ index + 1 }}</span>
              <h3 class="font-serif text-2xl text-ink">
                {{ step.title }}
              </h3>
              <span class="font-serif text-lg italic text-ink-faint">
                {{ step.latin }}
              </span>
            </div>

            <p class="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              {{ step.instruction }}
            </p>
            <p class="scripture-sm mt-4 max-w-2xl border-l-2 border-accent/40 pl-4 text-ink">
              {{ step.prompt }}
            </p>
          </li>
        </ol>

        <p class="mt-6 max-w-2xl leading-relaxed text-ink-soft">
          Close however you wish — the Our Father, or a word of thanks. Then carry the phrase that
          stayed with you into the day. Some name that fifth movement
          <span class="font-serif italic">actio</span>: the reading becomes the living.
        </p>
      </div>
    </section>

    <!-- What the app adds -->
    <section class="border-t border-rule/70">
      <div class="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20 lg:px-8">
        <h2 class="font-serif text-3xl text-ink sm:text-4xl">
          What Lectio does for you
        </h2>

        <div class="mt-10 grid gap-8 sm:grid-cols-3">
          <div
            v-for="offering in offerings"
            :key="offering.title"
          >
            <h3 class="font-serif text-xl text-ink">
              {{ offering.title }}
            </h3>
            <p class="mt-2 leading-relaxed text-ink-soft">
              {{ offering.body }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Close -->
    <section class="border-t border-rule/70 bg-accent-soft">
      <div class="mx-auto w-full max-w-5xl px-5 py-16 text-center sm:py-20 lg:px-8">
        <p class="scripture mx-auto max-w-lg text-ink">
          Speak, Lord, for your servant is listening.
        </p>
        <p class="mt-3 text-sm text-ink-faint">
          1 Samuel 3:9
        </p>

        <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink to="/register">
            <AppButton>Create an account</AppButton>
          </NuxtLink>
          <NuxtLink to="/login">
            <AppButton variant="quiet">
              Sign in
            </AppButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <footer class="border-t border-rule/70">
      <div class="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-8 text-sm text-ink-faint lg:px-8">
        <span class="font-serif text-base text-ink-soft">Lectio</span>
        <span>Read · Reflect · Respond · Rest</span>
        <span class="sm:ml-auto">Scripture from public-domain translations.</span>
      </div>
    </footer>
  </div>
</template>
