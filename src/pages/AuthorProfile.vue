<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getFeedArticles } from '../api/client.js'
import { findAuthor, getArticlesByAuthor, getAuthorStats } from '../data/authors.js'
import { isAuthorFollowed, toggleFollowAuthor } from '../data/feedActions.js'

const route = useRoute()
const currentUser = inject('currentUser')
const openWall = inject('openWall')

// Author data is derived live from the community feed.
const feedArticles = ref([])
onMounted(async () => {
  try {
    const res = await getFeedArticles()
    feedArticles.value = res.data?.data || []
  } catch {
    feedArticles.value = []
  }
})

function idToName(id) {
  return String(id || '').replace(/^author-/, '').replace(/-/g, ' ')
}
const authorName = computed(() => idToName(route.params.id))
const author = computed(() => findAuthor(feedArticles.value, authorName.value))
const articles = computed(() => (authorName.value ? getArticlesByAuthor(feedArticles.value, authorName.value) : []))
const stats = computed(() => (authorName.value ? getAuthorStats(feedArticles.value, authorName.value) : { articleCount: 0, totalClaps: 0 }))
const isGuest = computed(() => !currentUser?.value)
const followed = computed(() => (author.value ? isAuthorFollowed(author.value.name) : false))

function onFollow() {
  if (isGuest.value) return openWall({ kind: 'follow' })
  if (author.value) toggleFollowAuthor(author.value.name)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <div v-if="!author" class="text-center py-24">
      <p class="text-3xl font-bold text-[#111418] mb-4">Profile not found</p>
      <RouterLink to="/" class="text-[#8b1e21] font-semibold hover:underline">Back to Home</RouterLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="rounded-xl border border-[#eae8e4] bg-white p-6 md:p-8 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
            <span class="text-white text-lg font-bold">{{ author.initials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-extrabold text-[#111418]">{{ author.name }}</h1>
            <p class="text-sm" :class="author.tier ? 'text-gray-600' : 'text-gray-400'">
              {{ author.role }}{{ author.credential ? ` · ${author.credential}` : '' }}
            </p>
            <p v-if="author.bio" class="text-sm text-gray-500 mt-2">{{ author.bio }}</p>
          </div>
          <button
            type="button"
            @click="onFollow"
            class="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors"
            :class="followed
              ? 'border border-[#8b1e21] text-[#8b1e21] bg-white hover:bg-[#8b1e21]/5'
              : 'bg-[#111418] text-white hover:bg-[#8b1e21]'"
          >
            <Icon :icon="followed ? 'lucide:user-check' : 'lucide:user-plus'" class="w-3.5 h-3.5" />
            {{ followed ? 'Following' : 'Follow' }}
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mb-8 grid grid-cols-3 divide-x divide-[#eae8e4] border border-[#eae8e4] bg-white rounded-xl">
        <div class="p-5 text-center">
          <p class="text-xl font-extrabold text-[#111418]">{{ stats.articleCount }}</p>
          <p class="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Articles</p>
        </div>
        <div class="p-5 text-center">
          <p class="text-xl font-extrabold text-[#111418]">{{ stats.totalClaps }}</p>
          <p class="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Claps</p>
        </div>
        <div class="p-5 text-center">
          <p class="text-xl font-extrabold text-[#111418]">{{ stats.totalViews }}</p>
          <p class="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Views</p>
        </div>
      </div>

      <!-- Articles -->
      <div>
        <h2 class="text-sm font-bold text-[#111418] mb-4">Published by {{ author.name }}</h2>
        <div v-if="articles.length" class="space-y-4">
          <RouterLink
            v-for="a in articles"
            :key="a.id"
            :to="`/article/${a.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white group"
          >
            <h3 class="text-base font-bold text-[#111418] group-hover:text-[#8b1e21] transition-colors line-clamp-2">{{ a.title }}</h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ a.excerpt }}</p>
            <div class="flex items-center gap-4 text-[11px] text-gray-400 mt-3">
              <span>{{ a.readTime }} min read</span>
              <span class="flex items-center gap-1"><Icon icon="mdi:thumb-up" class="w-3 h-3" /> {{ a.claps }}</span>
              <span class="flex items-center gap-1"><Icon icon="lucide:eye" class="w-3 h-3" /> {{ a.views }}</span>
            </div>
          </RouterLink>
        </div>
        <p v-else class="text-sm text-gray-400">No published articles yet.</p>
      </div>
    </template>
  </div>
</template>