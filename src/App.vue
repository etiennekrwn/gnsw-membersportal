<template>
  <RouterView />
</template>

<script setup>
import { ref, provide } from 'vue'

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
</script>
