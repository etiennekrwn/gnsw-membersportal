<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getDraftById, publishDraft } from '../data/writing.js'
import ArticleBody from '../components/article/ArticleBody.vue'

const route = useRoute()
const router = useRouter()

const draft = ref(null)
const publishing = ref(false)
const publishError = ref('')
const isLiked = ref(false)
const likeCount = ref(0)
const shareMessage = ref('')

onMounted(() => {
  const d = getDraftById(route.params.id)
  if (!d) {
    router.replace({ name: 'MyWriting' })
    return
  }
  draft.value = d
})

function goBack() {
  router.push({ name: 'DraftEdit', params: { id: route.params.id } })
}

async function handlePublish() {
  publishing.value = true
  publishError.value = ''

  try {
    const result = await publishDraft(route.params.id)
    if (!result.ok) {
      publishError.value = result.error
      return
    }
    router.push({ name: 'MyWriting', query: { tab: 'Published', published: result.published.id } })
  } catch (err) {
    publishError.value = 'Could not publish due to network issues. Please try again.'
  } finally {
    publishing.value = false
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const handleShare = async () => {
  if (!draft.value) return
  const shareUrl = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: draft.value.title, url: shareUrl })
      return
    }
    await navigator.clipboard.writeText(shareUrl)
    shareMessage.value = 'Link copied'
    setTimeout(() => { shareMessage.value = '' }, 2000)
  } catch (error) {
    if (error.name === 'AbortError') return
    shareMessage.value = 'Could not share link'
    setTimeout(() => { shareMessage.value = '' }, 2000)
  }
}
</script>

<template>
  <!-- Top bar -->
  <div class="max-w-7xl m-auto fixed top-0 inset-x-0 z-30 bg-white flex items-center justify-between px-6 h-14 border-b border-gray-200">
    <span class="font-['Playfair_Display'] font-extrabold text-[#111418] tracking-tight text-3xl select-none">The Guild.</span>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="border border-gray-300 text-[#111418] px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-semibold hover:bg-gray-50 transition flex items-center gap-1"
        @click="goBack"
      >
        <Icon icon="lucide:arrow-left" class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Back to edit</span>
        <span class="sm:hidden">Back</span>
      </button>

      <button
        type="button"
        class="bg-[#8b1e21] text-white px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-semibold hover:bg-[#6d1819] transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="publishing"
        @click="handlePublish"
      >
        <Icon icon="lucide:send" class="w-3.5 h-3.5" />
        <span>{{ publishing ? 'Publishing…' : 'Publish' }}</span>
      </button>
    </div>
  </div>

  <!-- Publish error banner -->
  <div
    v-if="publishError"
    class="fixed top-14 inset-x-0 z-20 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium px-6 py-2 flex items-center gap-2"
  >
    <Icon icon="lucide:alert-circle" class="w-3.5 h-3.5 shrink-0" />
    {{ publishError }}
    <button class="ml-auto text-red-400 hover:text-red-600" @click="publishError = ''">
      <Icon icon="lucide:x" class="w-3.5 h-3.5" />
    </button>
  </div>

  <!-- Preview content -->
  <div class="max-w-7xl m-auto px-6 pt-20 pb-16">
    <article v-if="draft" class="max-w-3xl mx-auto">

      <!-- Categories -->
      <div v-if="draft.categories?.length" class="flex flex-wrap items-center gap-4 mb-6">
        <span
          v-for="cat in draft.categories"
          :key="cat"
          class="px-2.5 py-1 text-[9px] uppercase tracking-[2px] font-bold bg-[#8b1e21]/10 text-[#8b1e21] border border-[#8b1e21]/20"
        >{{ cat }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-4xl font-extrabold text-[#111418] leading-tight mb-6">
        {{ draft.title }}
      </h1>

      <!-- Engagement bar: top -->
      <div class="flex items-center justify-between border-y border-[#eae8e4] py-3 mb-10">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            :class="isLiked ? 'text-[#8b1e21]' : 'text-slate-400 hover:text-[#111418]'"
            @click="toggleLike"
          >
            <Icon :icon="isLiked ? 'lucide:heart' : 'lucide:heart'" :fill="isLiked ? 'currentColor' : 'none'" class="w-4 h-4" />
            {{ likeCount }}
          </button>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:eye" class="w-4 h-4" />
            0
          </div>
        </div>
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] font-semibold text-slate-400 hover:text-[#111418] transition-colors"
            @click="handleShare"
          >
            <Icon icon="lucide:share-2" class="w-3.5 h-3.5" />
            Share
          </button>
          <span
            v-if="shareMessage"
            class="absolute right-0 top-full mt-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-[#8b1e21] whitespace-nowrap"
          >
            {{ shareMessage }}
          </span>
        </div>
      </div>

      <!-- Cover image -->
      <div v-if="draft.coverImage" class="aspect-[16/9] overflow-hidden bg-[#eae8e4] rounded-lg mb-10">
        <img :src="draft.coverImage" :alt="draft.title" class="h-full w-full object-cover" />
      </div>

      <!-- Body -->
      <ArticleBody :html="draft.body" />

      <!-- Tags -->
      <div v-if="draft.tags?.length" class="mt-12 pt-8 border-t border-[#eae8e4] flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-slate-400 mr-2">
          <Icon icon="lucide:tag" class="w-3 h-3" />
          Tags
        </div>
        <span
          v-for="tag in draft.tags"
          :key="tag"
          class="px-3 py-1 text-[10px] uppercase tracking-[1.5px] font-semibold border border-[#eae8e4] text-slate-500 hover:border-[#111418]/30 hover:text-[#111418] transition-colors cursor-pointer rounded-full"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Engagement bar: bottom -->
      <div class="mt-8 flex items-center justify-between border-y border-[#eae8e4] py-3">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            :class="isLiked ? 'text-[#8b1e21]' : 'text-slate-400 hover:text-[#111418]'"
            @click="toggleLike"
          >
            <Icon icon="lucide:heart" :fill="isLiked ? 'currentColor' : 'none'" class="w-4 h-4" />
            {{ isLiked ? 'Liked' : 'Like' }} · {{ likeCount }}
          </button>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:eye" class="w-4 h-4" />
            0 views
          </div>
        </div>
        <button
          type="button"
          class="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] font-semibold text-slate-400 hover:text-[#111418] transition-colors"
          @click="handleShare"
        >
          <Icon icon="lucide:share-2" class="w-3.5 h-3.5" />
          Share
        </button>
      </div>

      <!-- Draft info footer -->
      <div class="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span>{{ draft.wordCount }} words</span>
        <span>Last modified {{ draft.lastModified }}</span>
      </div>
    </article>

    <!-- Loading state -->
    <div v-else class="max-w-3xl mx-auto py-20 text-center text-gray-400 text-sm">
      Loading draft…
    </div>
  </div>
</template>