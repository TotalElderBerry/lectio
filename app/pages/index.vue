<script setup lang="ts">
// '/' is the one route that serves two audiences: the landing page explains the
// practice to a visitor, the dashboard opens today's prayer for a member.
const { loggedIn } = useUserSession()

useHead(() => (loggedIn.value
  ? { title: 'Today' }
  : { title: 'Pray Lectio Divina' }))
</script>

<template>
  <TodayDashboard v-if="loggedIn" />
  <LandingPage v-else />
</template>
