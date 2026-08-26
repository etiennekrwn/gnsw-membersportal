<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#eae8e4]">
    <div class="flex items-center justify-between h-14 px-4 sm:px-6">

      <!-- Left: Hamburger + Logo -->
      <div class="flex items-center gap-4">

        <button
          @click="emit('toggle-sidebar')"
          class="p-1 text-[#111418] hover:text-gray-400 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Icon icon="lucide:menu" width="22" height="22" />
        </button>

        <!-- Logo -->
        <RouterLink to="/" class="font-['Playfair_Display'] text-3xl font-extrabold text-[#111418] no-underline select-none tracking-tight">
          The Guild<span class="text-4xl">.</span>
        </RouterLink>

      </div>

      <div class="ml-auto mr-2 sm:mx-4">
        <SearchBar />
      </div>

      <!-- Right: Write + Bell + Avatar -->
      <div class="flex items-center gap-1">
        <template v-if="user">

        <!-- Write button — only Partners and Fellows can write -->
        <RouterLink
          v-if="user?.tier === 'ROLE_MEMBER' || user?.tier === 'ROLE_FELLOW'"
          to="/my-writing"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#111418] transition-colors px-2 py-1.5 rounded no-underline"
        >
          <Icon icon="lucide:pen-line" width="16" height="16" />
          <span>Write</span>
        </RouterLink>

        <!-- Notification Bell -->
        <NotificationsMenu />

        <!-- Profile Avatar + Dropdown -->
        <ProfileMenu :user="user" @signout="emit('signout')" />
        </template>

        <!-- Guest state -->
        <template v-else>
          <RouterLink
            to="/login"
            class="px-3 py-1.5 text-sm font-medium text-[#111418] hover:text-[#8b1e21] transition-colors no-underline"
          >
            Log in
          </RouterLink>
          <a
            :href="`${mainSiteUrl}/membership`"
            target="_blank"
            rel="noopener"
            class="bg-[#8b1e21] px-3 py-2 text-xs font-bold uppercase tracking-[1.5px] text-white hover:bg-[#631214] transition-colors"
          >
            Join the Guild
          </a>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import SearchBar from './SearchBar.vue'
import ProfileMenu from './ProfileMenu.vue'
import NotificationsMenu from './NotificationsMenu.vue'
import { Icon } from '@iconify/vue'

defineProps({
  user: { type: Object, default: null },
})

const emit = defineEmits(['toggle-sidebar', 'signout'])

const mainSiteUrl = (import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
</script>
