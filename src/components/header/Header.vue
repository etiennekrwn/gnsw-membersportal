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
        <button class="relative p-2 text-gray-500 hover:text-[#111418] transition-colors cursor-pointer" aria-label="Notifications">
          <Icon icon="lucide:bell" width="20" height="20" />
          <span
            v-if="notificationCount > 0"
            class="absolute top-1 right-1 min-w-[14px] h-[14px] bg-[#8b1e21] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <!-- Profile Avatar + Dropdown -->
        <ProfileMenu :user="user" @signout="emit('signout')" />

      </div>
    </div>
  </header>
</template>

<script setup>
import SearchBar from './SearchBar.vue'
import ProfileMenu from './ProfileMenu.vue'
import { Icon } from '@iconify/vue'

defineProps({
  user: { type: Object, default: null },
  notificationCount: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle-sidebar', 'signout'])
</script>
