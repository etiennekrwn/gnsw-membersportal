<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-[#111418] mb-2">Following</h1>
      <p class="text-gray-500 text-sm">People you follow across the Guild.</p>
    </div>

    <div class="mb-6">
      <span class="text-sm font-semibold text-gray-700">{{ followedNames.length }} Following</span>
    </div>

    <EmptyState
      v-if="followedNames.length === 0"
      icon="lucide:user-plus"
      title="You're not following anyone yet"
      description="Follow writers from their articles to build your personalised stream."
    />

    <div v-else class="space-y-3">
      <RouterLink
        v-for="name in followedNames"
        :key="name"
        :to="`/author/${authorId(name)}`"
        class="flex items-center gap-4 border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
      >
        <div class="w-11 h-11 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
          <span class="text-white text-sm font-bold">{{ initials(name) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-[#111418]">{{ name }}</p>
          <p class="text-xs text-gray-400">View profile</p>
        </div>
        <Icon icon="lucide:chevron-right" class="w-4 h-4 text-gray-300" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { getFollowedAuthors } from '../data/feedActions.js'

const followedNames = computed(() => [...getFollowedAuthors()])

function authorId(name) {
  return `author-${name.toLowerCase().replace(/\s+/g, '-')}`
}

function initials(name) {
  return name
    .split(/\s+/)
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>
