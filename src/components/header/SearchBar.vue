<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const query = ref('')

function submitSearch() {
  const q = query.value.trim()
  if (!q) return
  router.push({ name: 'Search', query: { q } })
}

function onKeydown(event) {
  if (event.key === 'Enter') submitSearch()
}
</script>

<template>
  <button
    type="button"
    class="keep-rounded flex sm:hidden items-center justify-center size-9 rounded-full text-gray-500 hover:text-[#111418] hover:bg-gray-100 transition-colors cursor-pointer"
    aria-label="Search"
    @click="router.push({ name: 'Search' })"
  >
    <Icon icon="lucide:search" width="20" height="20" />
  </button>

  <div class="keep-rounded hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 w-60">
    <Icon icon="lucide:search" width="16" height="16" class="text-gray-400 shrink-0" />
    <input
      v-model="query"
      type="search"
      aria-label="Search articles, courses, and events"
      class="bg-transparent outline-none text-sm text-[#111418] w-full"
      @keydown="onKeydown"
    />
  </div>
</template>
