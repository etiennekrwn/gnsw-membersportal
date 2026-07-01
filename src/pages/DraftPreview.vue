<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getDraftById, updateDraft, publishDraft } from '../data/writing.js'

const route = useRoute()
const router = useRouter()

const draft = ref(null)
const publishing = ref(false)
const publishError = ref('')

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

function handlePublish() {
  publishing.value = true
  publishError.value = ''

  // Sync any pending body content from the editor (already saved via auto-save)
  const result = publishDraft(route.params.id)
  if (!result.ok) {
    publishError.value = result.error
    publishing.value = false
    return
  }

  router.push({ name: 'MyWriting', query: { tab: 'Published', published: result.published.id } })
}
</script>

<template>
  <!-- Top bar -->
  <div class="max-w-7xl m-auto fixed top-0 inset-x-0 z-30 bg-white flex items-center justify-between px-6 h-14 border-b border-gray-200">
    <span class="font-['Playfair_Display'] font-extrabold text-[#111418] tracking-tight text-3xl select-none">GNSW.</span>

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

      <!-- Cover image -->
      <div v-if="draft.coverImage" class="mb-8">
        <img :src="draft.coverImage" alt="Cover" class="w-full aspect-video object-cover border border-gray-300" />
      </div>

      <!-- Categories -->
      <div v-if="draft.categories?.length" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="cat in draft.categories"
          :key="cat"
          class="inline-flex items-center bg-[#8b1e21]/10 text-[#8b1e21] text-[11px] font-medium px-2 py-0.5"
        >{{ cat }}</span>
      </div>

      <!-- Title -->
      <h1 class="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#111418] leading-tight mb-4">
        {{ draft.title }}
      </h1>

      <!-- Excerpt -->
      <p v-if="draft.excerpt" class="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
        {{ draft.excerpt }}
      </p>

      <!-- Tags -->
      <div v-if="draft.tags?.length" class="flex flex-wrap gap-1.5 mb-8">
        <span
          v-for="tag in draft.tags"
          :key="tag"
          class="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5"
        >#{{ tag }}</span>
      </div>

      <!-- Body -->
      <div class="prose prose-lg max-w-none" v-html="draft.body" />

      <!-- Draft info footer -->
      <div class="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
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

<style scoped>
.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: #111418;
}
.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111418;
}
.prose :deep(p) { margin-bottom: 1rem; }
.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.prose :deep(li) { margin-bottom: 0.25rem; }
.prose :deep(blockquote) {
  border-left: 4px solid #8b1e21;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin: 1rem 0;
}
.prose :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
  color: #8b1e21;
}
.prose :deep(pre) {
  background: #111827;
  color: #f3f4f6;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
.prose :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.prose :deep(a) {
  color: #8b1e21;
  text-decoration: underline;
}
.prose :deep(hr) {
  border: none;
  border-top: 1px solid #eae8e4;
  margin: 2rem 0;
}
.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.prose :deep(td),
.prose :deep(th) {
  border: 1px solid #eae8e4;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.prose :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  text-align: left;
}
.prose :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}
.prose :deep(mark) {
  background: #fef9c3;
  padding: 0 0.125rem;
}
</style>