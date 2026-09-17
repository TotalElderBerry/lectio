<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
const settingsStore = useSettingsStore()
const router = useRouter()

const links = [
  { to: '/', label: 'Today' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  settingsStore.reset()
  await router.push('/login')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-paper">
    <!-- Sticky on desktop so the movements stay one click away while writing. -->
    <header
      v-if="loggedIn"
      class="sticky top-0 z-20 border-b border-rule/70 bg-paper/85 backdrop-blur-sm"
    >
      <div class="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-4 lg:px-8">
        <NuxtLink
          to="/"
          class="font-serif text-xl tracking-tight text-ink"
        >
          Lectio
        </NuxtLink>

        <nav class="flex items-center gap-5 text-sm lg:gap-7">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-ink-soft transition-colors hover:text-ink"
            :active-class="link.to === '/' ? '' : 'text-ink'"
            exact-active-class="text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <button
          type="button"
          class="ml-auto text-sm text-ink-faint transition-colors hover:text-ink"
          @click="signOut"
        >
          Sign out
        </button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
