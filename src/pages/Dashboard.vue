<script setup>
import { ref, computed, inject } from 'vue'
import FeedTabs from '../components/feed/FeedTabs.vue'
import ArticleCard from '../components/feed/ArticleCard.vue'
import RightSidebar from '../components/feed/RightSidebar.vue'
import { mockArticles } from '../data/mockArticles.js'
import { mockCourses } from '../data/mockCourses.js'

const currentUser = inject('currentUser')
const activeTab = ref('For You')

const filteredArticles = computed(() => {
  if (activeTab.value === 'For You') return mockArticles
  return mockArticles.filter(a => a.tag === activeTab.value)
})

const TIER_LEVELS = { ROLE_ASSOCIATE: 1, ROLE_MEMBER: 2, ROLE_FELLOW: 3 }
const recommendedCourses = computed(() =>
  mockCourses.filter(
    c => TIER_LEVELS[currentUser.value?.tier] >= TIER_LEVELS[c.tier]
  )
)

const levelColors = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-blue-50 text-blue-700',
  Advanced: 'bg-red-50 text-[#8b1e21]',
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex gap-8">

      <!-- Center: main feed -->
      <div class="flex-1 min-w-0">

        <!-- Feed tabs -->
        <FeedTabs v-model:activeTab="activeTab" />

        <!-- Article list -->
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

        <!-- Recommended Learning -->
        <div class="mt-10">
          <h3 class="font-['Playfair_Display'] text-xl font-bold text-[#111418] mb-5">
            Recommended Learning
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="course in recommendedCourses"
              :key="course.id"
              class="border border-[#eae8e4] rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors group"
            >
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="levelColors[course.level]">
                {{ course.level }}
              </span>
              <h4 class="text-sm font-semibold text-[#111418] mt-2 mb-1 group-hover:text-[#8b1e21] transition-colors leading-snug">
                {{ course.title }}
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed mb-3">{{ course.description }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span>{{ course.lessons }} lessons</span>
                <span>{{ course.duration }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right sidebar: upcoming events (hidden on small screens) -->
      <div class="hidden xl:block">
        <RightSidebar />
      </div>

    </div>
  </div>
</template>