<template>
  <RouterView />
  <LoginWall />
</template>

<script setup>
import { ref, provide } from 'vue'
import LoginWall from './components/LoginWall.vue'
import { initTheme } from './utils/theme.js'

initTheme()

// Rehydrate from localStorage on page refresh
const stored = localStorage.getItem('portal_user')
const currentUser = ref(stored ? JSON.parse(stored) : null)

provide('currentUser', currentUser)

provide('setCurrentUser', (user) => {
  currentUser.value = user
  localStorage.setItem('portal_user', JSON.stringify(user))
})

provide('handleSignout', () => {
  currentUser.value = null
  localStorage.removeItem('portal_user')
  localStorage.removeItem('portal_token')
  localStorage.removeItem('portal_onboarding_completed')
})

// Guest login-wall state -- visitors browse the feed first,
// then member-only actions are gated behind this wall.
const wallOpen = ref(false)
const wallIntent = ref(null)

provide('wallOpen', wallOpen)
provide('wallIntent', wallIntent)
provide('openWall', (intent) => {
  wallIntent.value = intent || {}
  wallOpen.value = true
})
provide('closeWall', () => {
  wallOpen.value = false
  wallIntent.value = null
})
</script>