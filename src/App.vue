<template>
  <RouterView />
</template>

<script setup>
import { ref, provide } from 'vue'

// Rehydrate from localStorage on page refresh
const stored = localStorage.getItem('gnsw_user')
const currentUser = ref(stored ? JSON.parse(stored) : null)

provide('currentUser', currentUser)

provide('setCurrentUser', (user) => {
  currentUser.value = user
  localStorage.setItem('gnsw_user', JSON.stringify(user))
})

provide('handleSignout', () => {
  currentUser.value = null
  localStorage.removeItem('gnsw_user')
})
</script>