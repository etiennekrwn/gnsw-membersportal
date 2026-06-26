<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import FeedTabs from '../components/feed/FeedTabs.vue'
import ArticleCard from '../components/feed/ArticleCard.vue'
import RightSidebar from '../components/feed/RightSidebar.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageLoading from '../components/ui/PageLoading.vue'
import { mockArticles } from '../data/mockArticles.js'
import { filterFeedArticles, getSavedArticles } from '../data/feedActions.js'

const currentUser = inject('currentUser')
const activeTab = ref('For You')
const loading = ref(true)
const loadError = ref(false)
const articles = ref([])
const visibleCount = ref(6)

const PAGE_SIZE = 6

async function loadArticles() {
  loading.value = true
  loadError.value = false
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    articles.value = mockArticles
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadArticles)

const tabbedArticles = computed(() => {
  const visible = filterFeedArticles(articles.value)
  if (activeTab.value === 'Saved') return getSavedArticles(visible)
  if (activeTab.value === 'For You') return visible
  if (activeTab.value === 'Latest') return [...visible].reverse()
  return visible.filter(a => a.tag === activeTab.value)
})

const filteredArticles = computed(() => tabbedArticles.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < tabbedArticles.value.length)

function loadMore() {
  visibleCount.value += PAGE_SIZE
}

watch(activeTab, () => {
  visibleCount.value = PAGE_SIZE
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex gap-8">

      <div class="flex-1 min-w-0">
        <FeedTabs v-model:activeTab="activeTab" />

        <PageLoading v-if="loading" />

        <EmptyState
          v-else-if="loadError"
          icon="lucide:wifi-off"
          title="Could not load your feed"
          description="Check your connection and try again."
        >
          <button
            type="button"
            class="text-sm font-semibold text-[#8b1e21] hover:underline"
            @click="loadArticles"
          >
            Retry
          </button>
        </EmptyState>

        <div v-else>
          <ArticleCard
            v-for="article in filteredArticles"
            :key="article.id"
            :article="article"
          />

          <EmptyState
            v-if="tabbedArticles.length === 0"
            icon="lucide:newspaper"
            :title="activeTab === 'Saved' ? 'No saved articles yet' : 'No articles in this feed'"
            :description="activeTab === 'Saved'
              ? 'Save articles from the feed to read them here later.'
              : 'Check back soon for new writing from Guild members, or explore another tab.'"
          >
            <button
              v-if="activeTab !== 'For You'"
              type="button"
              class="text-sm font-semibold text-[#8b1e21] hover:underline"
              @click="activeTab = 'For You'"
            >
              View For You feed
            </button>
          </EmptyState>

          <div v-if="hasMore && tabbedArticles.length > 0" class="py-8 text-center">
            <button
              type="button"
              class="text-sm font-semibold text-[#8b1e21] border border-[#eae8e4] px-6 py-2.5 rounded-md hover:bg-[#faf9f5] transition"
              @click="loadMore"
            >
              Load more
            </button>
          </div>
        </div>
      </div>

      <div class="hidden xl:block">
        <RightSidebar :user-tier="currentUser?.tier" />
      </div>

    </div>
  </div>
</template>
