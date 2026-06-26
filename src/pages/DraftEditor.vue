<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Icon } from '@iconify/vue'
import {
  getDraftById,
  createDraft,
  updateDraft,
  publishDraft,
} from '../data/writing.js'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.name === 'DraftNew')
const title = ref('')
const body = ref('')
const saved = ref(true)
const saveMessage = ref('')
const publishError = ref('')

let saveTimer = null
let lastSavedTitle = ''
let lastSavedBody = ''

const isDirty = computed(() =>
  title.value !== lastSavedTitle || body.value !== lastSavedBody
)

function syncSavedSnapshot() {
  lastSavedTitle = title.value
  lastSavedBody = body.value
  saved.value = true
}

function loadDraft() {
  publishError.value = ''
  if (isNew.value) {
    title.value = ''
    body.value = ''
    syncSavedSnapshot()
    return
  }
  const draft = getDraftById(route.params.id)
  if (!draft) {
    router.replace({ name: 'MyWriting' })
    return
  }
  title.value = draft.title
  body.value = draft.body ?? ''
  syncSavedSnapshot()
}

function scheduleSave() {
  if (isNew.value) {
    saved.value = false
    return
  }
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 800)
}

function saveNow() {
  publishError.value = ''
  if (isNew.value) {
    if (!title.value.trim() && !body.value.trim()) return
    const draft = createDraft({ title: title.value || 'Untitled Draft', body: body.value })
    syncSavedSnapshot()
    saveMessage.value = 'Draft created'
    router.replace({ name: 'DraftEdit', params: { id: draft.id } })
    setTimeout(() => { saveMessage.value = '' }, 2000)
    return
  }

  updateDraft(route.params.id, { title: title.value, body: body.value })
  syncSavedSnapshot()
  saveMessage.value = 'Saved'
  setTimeout(() => { saveMessage.value = '' }, 2000)
}

function handlePublish() {
  publishError.value = ''
  if (isNew.value) {
    publishError.value = 'Save the draft before publishing.'
    return
  }
  if (isDirty.value) {
    updateDraft(route.params.id, { title: title.value, body: body.value })
    syncSavedSnapshot()
  }

  const result = publishDraft(route.params.id)
  if (!result.ok) {
    publishError.value = result.error
    return
  }

  router.push({ name: 'MyWriting', query: { tab: 'Published', published: result.published.id } })
}

onBeforeRouteLeave((_to, _from, next) => {
  if (!isDirty.value || saved.value) {
    next()
    return
  }
  if (window.confirm('You have unsaved changes. Leave without saving?')) {
    next()
  } else {
    next(false)
  }
})

onMounted(loadDraft)
watch(() => route.params.id, loadDraft)
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <div class="mb-8 flex items-center justify-between gap-4 flex-wrap">
      <RouterLink
        to="/my-writing"
        class="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-slate-400 hover:text-[#111418] transition-colors no-underline"
      >
        <Icon icon="lucide:arrow-left" class="w-3 h-3" />
        My Writing
      </RouterLink>
      <div class="flex items-center gap-3 flex-wrap justify-end">
        <span class="text-xs text-gray-400">
          {{ isNew ? 'Press Save to create draft' : saved ? 'All changes saved' : 'Saving…' }}
        </span>
        <span v-if="saveMessage" class="text-xs font-semibold text-[#8b1e21]">{{ saveMessage }}</span>
        <span v-if="publishError" class="text-xs font-semibold text-red-600">{{ publishError }}</span>
        <button
          type="button"
          class="border border-[#eae8e4] text-[#111418] px-4 py-2 rounded-md text-xs font-semibold hover:bg-gray-50 transition"
          @click="saveNow"
        >
          Save
        </button>
        <button
          v-if="!isNew"
          type="button"
          class="bg-[#8b1e21] text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-[#6d1819] transition flex items-center gap-1.5"
          @click="handlePublish"
        >
          <Icon icon="lucide:send" class="w-3.5 h-3.5" />
          Publish
        </button>
      </div>
    </div>

    <input
      v-model="title"
      type="text"
      placeholder="Draft title"
      class="w-full font-['Playfair_Display'] text-3xl md:text-4xl font-extrabold text-[#111418] placeholder-gray-300 border-none outline-none mb-6 bg-transparent"
      @input="scheduleSave"
    />

    <textarea
      v-model="body"
      placeholder="Start writing your draft…"
      rows="18"
      class="w-full text-[16px] text-gray-700 leading-relaxed border border-[#eae8e4] rounded-lg p-5 focus:outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] resize-y bg-white"
      @input="scheduleSave"
    />
  </div>
</template>
