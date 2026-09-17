<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const route = useRoute()
const router = useRouter()

useHead({ title: 'Sign in' })

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    })
    await refreshSession()
    await router.push((route.query.redirect as string) || '/')
  }
  catch (requestError) {
    const payload = requestError as { statusMessage?: string; data?: { statusMessage?: string } }
    error.value = payload.data?.statusMessage ?? payload.statusMessage ?? 'We could not sign you in.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-sm px-5 py-20">
    <h1 class="font-serif text-3xl text-ink">
      Lectio
    </h1>
    <p class="mt-2 text-ink-soft">
      A quiet place to read, reflect, respond and rest.
    </p>

    <form
      class="mt-10 space-y-4"
      @submit.prevent="submit"
    >
      <div>
        <label
          for="email"
          class="mb-1.5 block text-sm text-ink-soft"
        >Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none"
        >
      </div>

      <div>
        <label
          for="password"
          class="mb-1.5 block text-sm text-ink-soft"
        >Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none"
        >
      </div>

      <p
        v-if="error"
        class="text-sm text-danger"
        role="alert"
      >
        {{ error }}
      </p>

      <AppButton
        type="submit"
        :loading="busy"
        class="w-full"
      >
        Sign in
      </AppButton>
    </form>

    <p class="mt-8 text-sm text-ink-soft">
      New here?
      <NuxtLink
        to="/register"
        class="text-accent underline underline-offset-4"
      >
        Create an account
      </NuxtLink>
    </p>
  </div>
</template>
