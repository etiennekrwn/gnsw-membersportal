<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import {
  getDrafts,
  getPublished,
  deleteDraft,
  publishDraft,
  unpublishPost,
  deletePublished,
} from '../data/writing.js'

const route = useRoute()
const router = useRouter()
const activeTab = ref('Drafts')
const tabs = ['Drafts', 'Published']
const openMenuId = ref(null)
const toast = ref('')
const fallbackThumbnail = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900'

const drafts = ref([])
const published = ref([])

watch(
  () => route.query.tab,
  (tab) => {
    if (tab && tabs.includes(String(tab))) activeTab.value = String(tab)
  },
  { immediate: true }
)

function refreshLists() {
  drafts.value = getDrafts()
  published.value = getPublished()
}

function showToast(message) {
  toast.value = message
  setTimeout(() => { toast.value = '' }, 2500)
}

function goToNewDraft() {
  router.push({ name: 'DraftNew' })
}

function goToDraft(id) {
  router.push({ name: 'DraftEdit', params: { id } })
}

function goToPublished(post) {
  if (post.articleId) {
    router.push(`/article/${post.articleId}`)
  } else {
    router.push({ name: 'PublishedPost', params: { id: post.id } })
  }
}

function toggleMenu(id, event) {
  event.stopPropagation()
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeMenu() {
  openMenuId.value = null
}

function handleDelete(id, event) {
  event.stopPropagation()
  if (confirm('Delete this draft? This cannot be undone.')) {
    deleteDraft(id)
    refreshLists()
    showToast('Draft deleted')
  }
  closeMenu()
}

function handleEdit(id, event) {
  event.stopPropagation()
  closeMenu()
  goToDraft(id)
}

async function handlePublish(id, event) {
  event.stopPropagation()
  try {
    const result = await publishDraft(id)
    if (!result.ok) {
      showToast(result.error)
    } else {
      refreshLists()
      activeTab.value = 'Published'
      showToast('Draft published')
    }
  } catch (err) {
    showToast('Could not publish due to network issues. Please try again.')
  }
  closeMenu()
}

function handleCopyLink(post, event) {
  event.stopPropagation()
  const url = post.articleId
    ? `${window.location.origin}/article/${post.articleId}`
    : `${window.location.origin}/published/${post.id}`
  navigator.clipboard.writeText(url)
  showToast('Link copied')
  closeMenu()
}

function handleShare(post, event) {
  event.stopPropagation()
  const url = post.articleId
    ? `${window.location.origin}/article/${post.articleId}`
    : `${window.location.origin}/published/${post.id}`
  if (navigator.share) {
    navigator.share({ title: post.title, url })
  } else {
    navigator.clipboard.writeText(url)
    showToast('Link copied')
  }
  closeMenu()
}

function handleEditPublished(post, event) {
  event.stopPropagation()
  closeMenu()
  if (post.draftId) {
    router.push({ name: 'DraftEdit', params: { id: post.draftId } })
  } else {
    goToPublished(post)
  }
}

function handleUnpublish(id, event) {
  event.stopPropagation()
  const result = unpublishPost(id)
  if (result.ok) {
    refreshLists()
    showToast('Post unpublished')
  } else {
    showToast(result.error)
  }
  closeMenu()
}

function handleDeletePublished(id, event) {
  event.stopPropagation()
  if (confirm('Delete this published post? This cannot be undone.')) {
    deletePublished(id)
    refreshLists()
    showToast('Published post deleted')
  }
  closeMenu()
}

onMounted(() => {
  refreshLists()
  document.addEventListener('click', closeMenu)
  if (route.query.published) activeTab.value = 'Published'
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="mb-10 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-[#111418] mb-2">My Writing</h1>
        <p class="text-gray-500 text-sm">Manage your drafts and published articles.</p>
      </div>
      <p v-if="toast" class="text-xs font-semibold text-[#8b1e21] shrink-0">{{ toast }}</p>
    </div>

    <div class="flex gap-6 border-b border-[#eae8e4] mb-8">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="pb-3 text-sm font-medium transition-colors relative"
        :class="activeTab === tab ? 'text-[#8b1e21]' : 'text-gray-500 hover:text-gray-800'"
        @click="activeTab = tab"
      >
        {{ tab }}
        <div v-if="activeTab === tab" class="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8b1e21]"></div>
      </button>
    </div>

    <div v-if="activeTab === 'Drafts'">
      <div class="flex justify-between items-center mb-6">
        <span class="text-sm font-semibold text-gray-700">{{ drafts.length }} Drafts</span>
        <button
          type="button"
          class="bg-[#111418] text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-[#2a3038] transition"
          @click="goToNewDraft"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          New Draft
        </button>
      </div>

      <EmptyState
        v-if="drafts.length === 0"
        icon="lucide:pen-line"
        title="No drafts yet"
        description="Start a new draft to capture speeches, briefings, and remarks before you're ready to publish."
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 bg-[#111418] text-white px-4 py-2 text-xs font-semibold hover:bg-[#2a3038] transition"
          @click="goToNewDraft"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          Create your first draft
        </button>
      </EmptyState>

      <div v-else class="space-y-4">
        <article
          v-for="draft in drafts"
          :key="draft.id"
          class="flex items-start justify-between gap-6 py-8 border-b border-[#eae8e4] group cursor-pointer"
          @click="goToDraft(draft.id)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-400">{{ draft.lastModified }}</span>
            </div>
            <h3 class="text-xl font-bold text-[#111418] group-hover:text-[#8b1e21] transition line-clamp-2 mb-2">{{ draft.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{{ draft.excerpt }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span class="flex items-center gap-1.5"><Icon icon="lucide:clock" class="w-3.5 h-3.5" /> Last edited: {{ draft.lastModified }}</span>
              <span>{{ draft.wordCount }} words</span>
              <span class="bg-gray-100 px-2 py-0.5 text-gray-600 border border-gray-200">{{ draft.status }}</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-3 shrink-0">
            <div class="relative">
              <button
                type="button"
                class="text-gray-400 hover:text-[#111418] p-1"
                aria-label="Draft actions"
                @click="toggleMenu(draft.id, $event)"
              >
                <Icon icon="lucide:more-vertical" class="w-5 h-5" />
              </button>
              <div
                v-if="openMenuId === draft.id"
                class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#eae8e4] shadow-lg z-10 py-1"
                @click.stop
              >
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleEdit(draft.id, $event)">Edit</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-[#8b1e21] hover:bg-[#faf9f5] font-medium" @click="handlePublish(draft.id, $event)">Publish</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click="handleDelete(draft.id, $event)">Delete</button>
              </div>
            </div>

            <div class="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden bg-gray-100">
              <img :src="draft.coverImage || draft.thumbnail || fallbackThumbnail" :alt="draft.title" class="w-full h-full object-cover" />
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-if="activeTab === 'Published'">
      <div class="mb-6">
        <span class="text-sm font-semibold text-gray-700">{{ published.length }} Published Articles</span>
      </div>

      <EmptyState
        v-if="published.length === 0"
        icon="lucide:newspaper"
        title="No published articles yet"
        description="When you publish a draft, it will appear here with views and engagement stats."
      />

      <div v-else class="space-y-4">
        <article
          v-for="post in published"
          :key="post.id"
          class="flex items-start justify-between gap-6 py-8 border-b border-[#eae8e4] group cursor-pointer"
          @click="goToPublished(post)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-3">
              
              <span class="text-xs text-gray-600">Published</span>
              <span class="text-xs text-gray-400">{{ post.datePublished }}</span>
            </div>
            <h3 class="text-lg font-bold text-[#111418] mb-2 leading-tight group-hover:text-[#8b1e21] transition line-clamp-2">
              {{ post.title }}
            </h3>
            <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{{ post.excerpt }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span>{{ post.readTime }} min read</span>
              <span class="flex items-center gap-1"><Icon icon="lucide:eye" class="w-3.5 h-3.5" /> {{ post.views }}</span>
              <span class="flex items-center gap-1"><Icon icon="mdi:thumb-up" class="w-3.5 h-3.5" /> {{ post.claps }}</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-3 shrink-0">
            <div class="relative">
              <button
                type="button"
                class="text-gray-400 hover:text-[#111418] p-1"
                aria-label="Published actions"
                @click="toggleMenu(post.id, $event)"
              >
                <Icon icon="lucide:more-vertical" class="w-5 h-5" />
              </button>
              <div
                v-if="openMenuId === post.id"
                class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#eae8e4] shadow-lg z-10 py-1"
                @click.stop
              >
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleCopyLink(post, $event)">Copy link</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleShare(post, $event)">Share</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleEditPublished(post, $event)">Edit</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleUnpublish(post.id, $event)">Unpublish</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click="handleDeletePublished(post.id, $event)">Delete</button>
              </div>
            </div>

            <div class="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden bg-gray-100">
              <img :src="post.coverImage || post.thumbnail || fallbackThumbnail" :alt="post.title" class="w-full h-full object-cover" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>