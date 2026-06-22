<script setup>
import { ref, computed } from 'vue'
import FeedTabs from '../components/feed/FeedTabs.vue'
import ArticleCard from '../components/feed/ArticleCard.vue'
import RightSidebar from '../components/feed/RightSidebar.vue'
import { mockArticles } from '../data/mockArticles.js'

const activeTab = ref('For You')

const filteredArticles = computed(() => {
  if (activeTab.value === 'For You') return mockArticles
  return mockArticles.filter(a => a.tag === activeTab.value)
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex gap-8">

      <!-- Center: main feed -->
      <div class="flex-1 min-w-0">
        <FeedTabs v-model:activeTab="activeTab" />
        <div>
          <ArticleCard
            v-for="article in filteredArticles"
            :key="article.id"
            :article="article"
          />
          <p v-if="filteredArticles.length === 0" class="text-sm text-gray-400 py-10 text-center">
            No articles here yet.
          </p>
        </div>
      </div>

      <!-- Right sidebar (hidden below xl) -->
      <div class="hidden xl:block">
        <RightSidebar />
      </div>

    </div>
  </div>
</template>