<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { Icon } from '@iconify/vue'
import FeedTabs from '../components/feed/FeedTabs.vue'
import ArticleCard from '../components/feed/ArticleCard.vue'
import RightSidebar from '../components/feed/RightSidebar.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageLoading from '../components/ui/PageLoading.vue'
import { getFeedArticles } from '../api/client.js'
import {
  getSavedArticles,
  getFollowedAuthors,
  filterFeedArticles,
  engagementScore,
} from '../data/feedActions.js'

const currentUser = inject('currentUser')
const isGuest = computed(() => !currentUser?.value)

const mainSiteUrl = (import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

// Guest prompt (dismissible) shown after a short browse
const guestPromptDismissed = ref(localStorage.getItem('gnsw_guest_prompt_dismissed') === 'true')
const showPrompt = ref(false)

function dismissGuestPrompt() {
  showPrompt.value = false
  guestPromptDismissed.value = true
  localStorage.setItem('gnsw_guest_prompt_dismissed', 'true')
}

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
    // "Following" tab needs all published articles to cross-reference authors.
    const tagParam =
      activeTab.value === 'For You' ||
      activeTab.value === 'Latest' ||
      activeTab.value === 'Trending' ||
      activeTab.value === 'Following'
        ? undefined
        : activeTab.value
    const res = await getFeedArticles({ tag: tagParam })
    articles.value = res.data?.data || []
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
  setTimeout(() => {
    if (isGuest.value && !guestPromptDismissed.value) showPrompt.value = true
  }, 1200)
})

const tabbedArticles = computed(() => {
  const all = articles.value

  // Muted authors are hidden across every feed tab.
  const base = filterFeedArticles(all)

  if (activeTab.value === 'Saved') {
    return getSavedArticles(all)
  }
  if (activeTab.value === 'Following') {
    const followed = getFollowedAuthors()
    return base.filter(a => followed.has(a.author.name))
  }
  if (activeTab.value === 'Trending') {
    return [...base].sort((a, b) => engagementScore(b) - engagementScore(a))
  }
  if (activeTab.value === 'For You') {
    // Simple v1 "for you": engagement-ranked with saved/muted respected.
    return [...base].sort((a, b) => engagementScore(b) - engagementScore(a))
  }
  if (activeTab.value === 'Latest') {
    return base
  }
  if (activeTab.value === 'Featured') {
    return base.filter(a => a.tag === 'Featured')
  }
  return base
})

const filteredArticles = computed(() => tabbedArticles.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < tabbedArticles.value.length)

const emptyStateTitle = computed(() => {
  if (activeTab.value === 'Saved') return 'No saved articles yet'
  if (activeTab.value === 'Following') return 'No articles from followed authors'
  if (activeTab.value === 'Trending') return 'Nothing trending right now'
  return 'No articles in this feed'
})

const emptyStateDescription = computed(() => {
  if (activeTab.value === 'Saved') return 'Save articles from the feed to read them here later.'
  if (activeTab.value === 'Following') return 'Follow writers from the feed to build your personalised stream.'
  if (activeTab.value === 'Trending') return 'Check back soon for new high-engagement writing from Guild members.'
  return 'Check back soon for new writing from Guild members, or explore another tab.'
})

function loadMore() {
  visibleCount.value += PAGE_SIZE
}

watch(activeTab, () => {
  visibleCount.value = PAGE_SIZE
  if (activeTab.value !== 'Saved') loadArticles()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex gap-8">

      <div class="flex-1 min-w-0">
        <!-- Compact "your tier" strip linking to the Membership page -->
        <RouterLink
          v-if="!isGuest"
          to="/membership"
          class="mb-6 flex items-center justify-between gap-3 rounded-md border border-[#eae8e4] bg-white px-4 py-3 no-underline group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-7 h-7 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
              <Icon icon="lucide:badge-check" class="w-4 h-4 text-[#d86d70]" />
            </span>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-[#111418]">Your membership</p>
              <p class="text-[11px] text-gray-500 truncate">Manage tier, billing, and benefits</p>
            </div>
          </div>
          <span class="shrink-0 text-xs font-semibold text-[#8b1e21] group-hover:underline">Manage →</span>
        </RouterLink>
        <FeedTabs v-model:activeTab="activeTab" />

        <!-- Guest prompt banner (dismissible) -->
        <div
          v-if="isGuest && showPrompt"
          class="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-md border border-[#8b1e21]/20 bg-[#8b1e21]/5 p-4"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#111418]">You're browsing The Guild</p>
            <p class="text-xs text-[#555555] mt-0.5">
              Join to read full articles, clap, comment, and publish your own speechwriting.
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              :href="`${mainSiteUrl}/membership`"
              target="_blank"
              rel="noopener"
              class="px-4 py-2 bg-[#8b1e21] text-white text-xs font-bold uppercase tracking-[1.5px] hover:bg-[#631214] transition-colors no-underline"
            >
              Join the Guild
            </a>
            <RouterLink
              to="/login"
              class="px-4 py-2 text-xs font-bold uppercase tracking-[1.5px] border border-[#8b1e21] text-[#8b1e21] hover:bg-[#8b1e21] hover:text-white transition-colors no-underline"
            >
              Log in
            </RouterLink>
            <button
              type="button"
              class="p-1 text-[#999999] hover:text-[#111418] transition-colors cursor-pointer bg-transparent border-0"
              aria-label="Dismiss"
              @click="dismissGuestPrompt"
            >
              &times;
            </button>
          </div>
        </div>

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
            :title="emptyStateTitle"
            :description="emptyStateDescription"
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

      <div class="hidden lg:block">
        <RightSidebar :user-tier="currentUser?.tier" />
      </div>

    </div>
  </div>
</template>
