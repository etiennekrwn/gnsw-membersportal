<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import {
  getDrafts,
  getPublished,
  getArchived,
  duplicateDraft,
  deleteDraft,
  publishDraft,
  archiveDraft,
  restoreDraft,
  renameDraft,
} from '../data/writing.js'

const route = useRoute()
const router = useRouter()
const activeTab = ref('Drafts')
const tabs = ['Drafts', 'Published', 'Archived']
const openMenuId = ref(null)
const toast = ref('')

const drafts = ref([])
const published = ref([])
const archived = ref([])

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
  archived.value = getArchived()
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

function handleDuplicate(id, event) {
  event.stopPropagation()
  duplicateDraft(id)
  refreshLists()
  closeMenu()
  showToast('Draft duplicated')
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

function handleRename(id, event) {
  event.stopPropagation()
  const draft = drafts.value.find(d => d.id === id)
  const nextTitle = window.prompt('Rename draft', draft?.title ?? '')
  if (nextTitle?.trim()) {
    renameDraft(id, nextTitle)
    refreshLists()
    showToast('Draft renamed')
  }
  closeMenu()
}

function handlePublish(id, event) {
  event.stopPropagation()
  const result = publishDraft(id)
  if (!result.ok) {
    showToast(result.error)
  } else {
    refreshLists()
    activeTab.value = 'Published'
    showToast('Draft published')
  }
  closeMenu()
}

function handleArchive(id, event) {
  event.stopPropagation()
  archiveDraft(id)
  refreshLists()
  showToast('Draft archived')
  closeMenu()
}

function handleRestore(id, event) {
  event.stopPropagation()
  restoreDraft(id)
  refreshLists()
  showToast('Draft restored')
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
  <div class="max-w-5xl mx-auto px-6 py-8">
    <div class="mb-10 flex items-start justify-between gap-4">
      <div>
        <h1 class="font-['Playfair_Display'] text-3xl font-extrabold text-[#111418] mb-2">My Writing</h1>
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

    <!-- Drafts -->
    <div v-if="activeTab === 'Drafts'">
      <div class="flex justify-between items-center mb-6">
        <span class="text-sm font-semibold text-gray-700">{{ drafts.length }} Drafts</span>
        <button
          type="button"
          class="bg-[#111418] text-white px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 hover:bg-[#2a3038] transition"
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
          class="inline-flex items-center gap-2 bg-[#111418] text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-[#2a3038] transition"
          @click="goToNewDraft"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          Create your first draft
        </button>
      </EmptyState>

      <div v-else class="space-y-4">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="border border-[#eae8e4] rounded-lg p-5 hover:border-gray-300 transition group cursor-pointer bg-white relative"
          @click="goToDraft(draft.id)"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-['Playfair_Display'] text-xl font-bold text-[#111418] group-hover:text-[#8b1e21] transition">{{ draft.title }}</h3>
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
                class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#eae8e4] rounded-lg shadow-lg z-10 py-1"
                @click.stop
              >
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleEdit(draft.id, $event)">Edit</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleRename(draft.id, $event)">Rename</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleDuplicate(draft.id, $event)">Duplicate</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-[#8b1e21] hover:bg-[#faf9f5] font-medium" @click="handlePublish(draft.id, $event)">Publish</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5]" @click="handleArchive(draft.id, $event)">Archive</button>
                <button type="button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click="handleDelete(draft.id, $event)">Delete</button>
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500 line-clamp-1 mb-4">{{ draft.excerpt }}</p>
          <div class="flex items-center gap-4 text-xs text-gray-400 font-medium">
            <span class="flex items-center gap-1.5"><Icon icon="lucide:clock" class="w-3.5 h-3.5"/> Last edited: {{ draft.lastModified }}</span>
            <span>{{ draft.wordCount }} words</span>
            <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">{{ draft.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Published -->
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

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="post in published"
          :key="post.id"
          class="border border-[#eae8e4] rounded-lg overflow-hidden hover:border-gray-300 transition bg-white flex flex-col cursor-pointer group"
          @click="goToPublished(post)"
        >
          <div class="h-40 bg-gray-100 w-full relative">
            <img :src="post.thumbnail" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            <div class="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-[#8b1e21] shadow-sm uppercase tracking-wider">
              {{ post.status }}
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="font-['Playfair_Display'] text-lg font-bold text-[#111418] mb-2 leading-tight group-hover:text-[#8b1e21] transition line-clamp-2">
              {{ post.title }}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{{ post.excerpt }}</p>
            <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-[#eae8e4] mt-auto">
              <span>{{ post.datePublished }}</span>
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1"><Icon icon="lucide:eye" class="w-3.5 h-3.5"/> {{ post.views }}</span>
                <span class="flex items-center gap-1"><Icon icon="lucide:heart" class="w-3.5 h-3.5"/> {{ post.claps }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Archived -->
    <div v-if="activeTab === 'Archived'">
      <div class="mb-6">
        <span class="text-sm font-semibold text-gray-700">{{ archived.length }} Archived Drafts</span>
      </div>

      <EmptyState
        v-if="archived.length === 0"
        icon="lucide:archive"
        title="No archived drafts"
        description="Archived drafts are kept here until you restore or delete them."
      />

      <div v-else class="space-y-4">
        <div
          v-for="draft in archived"
          :key="draft.id"
          class="border border-[#eae8e4] rounded-lg p-5 bg-[#faf9f5] flex items-start justify-between gap-4"
        >
          <div>
            <h3 class="font-['Playfair_Display'] text-lg font-bold text-[#111418] mb-1">{{ draft.title }}</h3>
            <p class="text-sm text-gray-500 line-clamp-1 mb-2">{{ draft.excerpt }}</p>
            <span class="text-xs text-gray-400">Archived · {{ draft.lastModified }}</span>
          </div>
          <button
            type="button"
            class="shrink-0 text-xs font-semibold text-[#8b1e21] hover:underline"
            @click="handleRestore(draft.id, $event)"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
