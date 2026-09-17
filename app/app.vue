<script setup lang="ts">
const { loggedIn } = useUserSession()
const settingsStore = useSettingsStore()

useHead({
  titleTemplate: title => (title ? `${title} · Lectio` : 'Lectio'),
})

watch(loggedIn, (isLoggedIn) => {
  if (isLoggedIn) void settingsStore.load(true)
  else settingsStore.reset()
}, { immediate: true })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
