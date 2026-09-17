<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const router = useRouter()

useHead({ title: 'Create an account' })

const displayName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        displayName: displayName.value.trim() || undefined,
        email: email.value,
        password: password.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    })
    await refreshSession()
    await router.push('/')
  }
  catch (requestError) {
    const payload = requestError as { statusMessage?: string; data?: { statusMessage?: string } }
    error.value = payload.data?.statusMessage ?? payload.statusMessage ?? 'We could not create your account.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-sm px-5 py-20">
    <h1 class="font-serif text-3xl text-ink">
      Create an account
    </h1>
    <p class="mt-2 text-ink-soft">
      So your reflections are kept, and follow you between devices.
    </p>

    <form
      class="mt-10 space-y-4"
      @submit.prevent="submit"
    >
      <div>
        <label
          for="name"
          class="mb-1.5 block text-sm text-ink-soft"
        >Name <span class="text-ink-faint">(optional)</span></label>
        <input
          id="name"
          v-model="displayName"
          type="text"
          autocomplete="name"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none"
        >
      </div>

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
          minlength="8"
          autocomplete="new-password"
          class="w-full rounded-md border border-rule bg-paper-raised px-4 py-3 text-ink focus:border-accent focus:outline-none"
        >
        <p class="mt-1.5 text-xs text-ink-faint">
          At least 8 characters.
        </p>
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
        Create account
      </AppButton>
    </form>

    <p class="mt-8 text-sm text-ink-soft">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-accent underline underline-offset-4"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
