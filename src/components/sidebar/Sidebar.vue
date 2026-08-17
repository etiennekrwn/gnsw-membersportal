<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function closeOnSmallScreen() {
  if (!window.matchMedia('(min-width: 1024px)').matches) {
    emit('close')
  }
}

const navItems = [
  { label: 'Home',       to: '/',           icon: 'lucide:house' },
  { label: 'My Writing', to: '/my-writing', icon: 'lucide:pen-line' },
  { label: 'Learning',   to: '/learning',   icon: 'lucide:book-open' },
  { label: 'Events',     to: '/events',     icon: 'lucide:calendar' },
  { label: 'Profile',    to: '/profile',    icon: 'lucide:user' },
  { label: 'Settings',   to: '/settings',   icon: 'lucide:settings' },
]
</script>

<template>
  <!-- Mobile overlay backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/30 z-[60] lg:hidden"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sidebar panel -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full w-64 bg-white z-[70] flex flex-col overflow-y-auto',
      'transition-transform duration-300 ease-in-out',
      'lg:top-[57px] lg:shadow-none lg:border-r lg:border-[#eae8e4] lg:z-30',
      isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
    ]"
  >
    <!-- Mobile header inside drawer -->
    <div class="flex items-center gap-4 px-5 h-14 border-b border-[#eae8e4] lg:hidden">
      <button
        @click="emit('close')"
        class="text-gray-400 hover:text-[#111418] transition-colors cursor-pointer"
      >
        <Icon icon="lucide:menu" width="22" height="22" />
      </button>
      <span class="font-['Playfair_Display'] text-3xl font-extrabold text-[#111418]">
        The Guild<span class="text-4xl">.</span>
      </span>
    </div>

    <!-- Nav links -->
    <nav class="flex flex-col gap-1 px-3 py-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        @click="closeOnSmallScreen"
        class="flex items-center gap-3.5 px-3 py-2.5 rounded-md text-sm text-gray-600 hover:text-[#111418] hover:bg-[#faf9f5] transition-colors no-underline group"
        active-class="text-[#111418] font-medium bg-[#faf9f5]"
      >
        <Icon
          :icon="item.icon"
          width="20"
          height="20"
          class="text-gray-400 group-hover:text-[#111418] transition-colors"
        />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>