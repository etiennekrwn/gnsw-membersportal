<template>
  <button
    type="button"
    class="flex sm:hidden items-center justify-center size-9 rounded-full text-gray-500 hover:text-[#111418] hover:bg-gray-100 transition-colors cursor-pointer"
    aria-label="Search"
  >
    <Icon icon="lucide:search" width="20" height="20" />
  </button>

  <div class="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 w-60">
    <Icon icon="lucide:search" width="16" height="16" class="text-gray-400 shrink-0" />
    <input
      v-model="query"
      type="text"
      placeholder="Search"
      class="bg-transparent outline-none text-sm text-[#111418] placeholder-gray-400 w-full"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
const query = ref('')
</script>
