<script setup lang="ts">
const { loggedIn } = useUserSession()
const signOut = useSignOut()

const links = [
  { to: '/', label: 'Today' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-paper">
    <!-- Sticky on desktop so the movements stay one click away while writing. -->
    <header
      v-if="loggedIn"
      class="sticky top-0 z-20 border-b border-rule/70 bg-paper/85 backdrop-blur-sm"
    >
      <div class="mx-auto flex w-full max-w-6xl items-center gap-5 px-5 py-3.5 sm:gap-6 sm:py-4 lg:px-8">
        <NuxtLink
          to="/"
          class="font-serif text-xl tracking-tight text-ink"
        >
          Lectio
        </NuxtLink>

        <!-- Right-aligned on a phone, where it is the only thing beside the name. -->
        <nav class="ml-auto flex items-center gap-5 text-sm sm:ml-0 lg:gap-7">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="whitespace-nowrap text-ink-soft transition-colors hover:text-ink"
            :active-class="link.to === '/' ? '' : 'text-ink'"
            exact-active-class="text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- A phone has no room for a fifth item; Settings carries it instead. -->
        <button
          type="button"
          class="ml-auto hidden text-sm text-ink-faint transition-colors hover:text-ink sm:block"
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
