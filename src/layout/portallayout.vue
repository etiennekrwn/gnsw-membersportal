<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/header/Header.vue'
import Sidebar from '../components/sidebar/Sidebar.vue'

const currentUser = inject('currentUser')
const handleSignout = inject('handleSignout')
const router = useRouter()

const sidebarOpen = ref(window.matchMedia('(min-width: 1024px)').matches)

function signout() {
  handleSignout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <Header
      :user="currentUser"
      :notification-count="5"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @signout="signout"
    />

    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Below header, offset right of sidebar on desktop -->
    <main
      class="pt-14 transition-[padding] duration-300"
      :class="{ 'lg:pl-64': sidebarOpen }"
    >
      <RouterView />
    </main>

  </div>
</template>
