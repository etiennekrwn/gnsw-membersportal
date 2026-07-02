<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import {
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
} from '../data/writing.js'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.name === 'DraftNew')

// --- Fields ---
const title = ref('')
const excerpt = ref('')
const tags = ref([])
const categories = ref([])
const coverImage = ref(null) // base64 or null
const coverImagePreview = ref(null)
const saved = ref(true)
const saveMessage = ref('')
const showCloseModal = ref(false)
const isDraggingOver = ref(false)

// --- Publish validation ---
const fieldErrors = ref({ title: false, tags: false, coverImage: false, category: false, wordCount: false })
const toastMessage = ref('')
const showToast = ref(false)
let toastTimer = null

function clearFieldError(field) {
  fieldErrors.value[field] = false
}

function showToastMessage(msg) {
  toastMessage.value = msg
  showToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { showToast.value = false }, 4000)
}

const bodyWordCount = computed(() => {
  const text = (editor.value?.getText() ?? '').trim()
  return text ? text.split(/\s+/).length : 0
})

// Category options
const CATEGORY_OPTIONS = [
  'Speech Writing', 'Rhetoric', 'Public Speaking', 'Politics',
  'Leadership', 'Communication', 'Culture', 'Opinion', 'Analysis',
]
const categoryMenuOpen = ref(false)

// Tags input
const tagInput = ref('')
const TAGS_MAX = 5

function addTag() {
  const val = tagInput.value.trim().toLowerCase().replace(/\s+/g, '-')
  if (!val) return
  if (tags.value.includes(val)) { tagInput.value = ''; return }
  if (tags.value.length >= TAGS_MAX) return
  tags.value.push(val)
  tagInput.value = ''
  clearFieldError('tags')
  scheduleSave()
}

function removeTag(tag) {
  tags.value = tags.value.filter(t => t !== tag)
  clearFieldError('tags')
  scheduleSave()
}

let saveTimer = null
let lastSavedTitle = ''
let lastSavedBody = ''
let lastSavedExcerpt = ''
let lastSavedTags = ''
let lastSavedCategories = ''
let lastSavedCoverImage = null
let draftId = ref(null) // the actual saved draft id (may differ from route param for new drafts)

const isDirty = computed(() => {
  return (
    title.value !== lastSavedTitle ||
    (editor.value?.getHTML() ?? '') !== lastSavedBody ||
    excerpt.value !== lastSavedExcerpt ||
    JSON.stringify(tags.value) !== lastSavedTags ||
    JSON.stringify(categories.value) !== lastSavedCategories ||
    coverImage.value !== lastSavedCoverImage
  )
})

const hasContent = computed(() => {
  return title.value.trim().length > 0 ||
    (editor.value?.getText() ?? '').trim().length > 0
})

function syncSavedSnapshot() {
  lastSavedTitle = title.value
  lastSavedBody = editor.value?.getHTML() ?? ''
  lastSavedExcerpt = excerpt.value
  lastSavedTags = JSON.stringify(tags.value)
  lastSavedCategories = JSON.stringify(categories.value)
  lastSavedCoverImage = coverImage.value
  saved.value = true
}

// --- Tiptap editor ---
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Highlight,
    Link.configure({ openOnClick: false }),
    Image,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Placeholder.configure({ placeholder: 'Tell your story…' }),
  ],
  content: '',
  onUpdate() {
    scheduleSave()
  },
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none focus:outline-none min-h-[320px] text-[#111418]',
    },
  },
})

// --- Load draft ---
function loadDraft() {
  if (isNew.value) {
    title.value = ''
    excerpt.value = ''
    tags.value = []
    categories.value = []
    coverImage.value = null
    coverImagePreview.value = null
    draftId.value = null
    editor.value?.commands.setContent('')
    syncSavedSnapshot()
    return
  }
  const draft = getDraftById(route.params.id)
  if (!draft) {
    router.replace({ name: 'MyWriting' })
    return
  }
  title.value = draft.title
  excerpt.value = draft.excerpt ?? ''
  tags.value = draft.tags ?? []
  categories.value = draft.categories ?? []
  coverImage.value = draft.coverImage ?? null
  coverImagePreview.value = draft.coverImage ?? null
  draftId.value = draft.id
  editor.value?.commands.setContent(draft.body ?? '')
  syncSavedSnapshot()
}

// --- Save logic ---
function scheduleSave() {
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 800)
}

function saveNow() {
  const body = editor.value?.getHTML() ?? ''

  // If this is a new draft and no content yet, don't save
  if (!draftId.value && !hasContent.value) {
    saved.value = true
    return
  }

  // If no draft exists yet, create one first
  if (!draftId.value) {
    const draft = createDraft({
      title: title.value || 'Untitled Draft',
      body,
      excerpt: excerpt.value,
      tags: tags.value,
      categories: categories.value,
      coverImage: coverImage.value,
    })
    draftId.value = draft.id
    syncSavedSnapshot()
    saveMessage.value = 'Draft saved'
    // Replace the route so future autosaves hit the correct id
    router.replace({ name: 'DraftEdit', params: { id: draft.id } })
    setTimeout(() => { saveMessage.value = '' }, 2000)
    return
  }

  // If all content was erased, delete the draft entirely
  if (!hasContent.value) {
    deleteDraft(draftId.value)
    draftId.value = null
    syncSavedSnapshot()
    // Replace back to the new-draft route so the editor resets
    router.replace({ name: 'DraftNew' })
    return
  }

  updateDraft(draftId.value, {
    title: title.value,
    body,
    excerpt: excerpt.value,
    tags: tags.value,
    categories: categories.value,
    coverImage: coverImage.value,
  })
  syncSavedSnapshot()
  saveMessage.value = 'Saved'
  setTimeout(() => { saveMessage.value = '' }, 2000)
}

/**
 * Extract the first image src from HTML body content.
 * Returns null if no image is found.
 */
function extractFirstImageSrc(html) {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

function handlePublish() {
  // Reset all field errors
  fieldErrors.value = { title: false, tags: false, coverImage: false, category: false, wordCount: false }

  // Validation checks in priority order (stops at first missing)
  if (!title.value.trim()) {
    fieldErrors.value.title = true
    showToastMessage('Add a title before publishing')
    return
  }
  if (!tags.value.length) {
    fieldErrors.value.tags = true
    showToastMessage('Add at least one tag')
    return
  }

  // Smart cover image: auto-extract from body content if not manually set
  const bodyHtml = editor.value?.getHTML() ?? ''
  const hasBodyImage = !!extractFirstImageSrc(bodyHtml)
  if (!coverImage.value && hasBodyImage) {
    coverImage.value = extractFirstImageSrc(bodyHtml)
    coverImagePreview.value = coverImage.value
    clearFieldError('coverImage')
  }
  if (!coverImage.value && !hasBodyImage) {
    fieldErrors.value.coverImage = true
    showToastMessage('Add a cover image')
    return
  }

  if (!categories.value.length) {
    fieldErrors.value.category = true
    showToastMessage('Select a category')
    return
  }
  if (bodyWordCount.value < 100) {
    fieldErrors.value.wordCount = true
    showToastMessage(`Content must be at least 100 words (${bodyWordCount.value} words)`)
    return
  }

  // Force-save everything immediately to persist all changes
  // (including auto-extracted cover image and any pending body content)
  if (!draftId.value) {
    // No draft exists yet — create one first, then navigate
    saveNow()
    setTimeout(() => {
      if (draftId.value) {
        router.push({ name: 'DraftPreview', params: { id: draftId.value } })
      }
    }, 100)
    return
  }

  // Save now (synchronous call to updateDraft + syncSavedSnapshot)
  saveNow()

  router.push({ name: 'DraftPreview', params: { id: draftId.value } })
}

// --- Close modal ---
function handleClose() {
  if (isDirty.value) {
    showCloseModal.value = true
  } else {
    router.push({ name: 'MyWriting' })
  }
}

function confirmClose() {
  showCloseModal.value = false
  router.push({ name: 'MyWriting' })
}

function saveAndClose() {
  saveNow()
  showCloseModal.value = false
  router.push({ name: 'MyWriting' })
}

// --- Image processing ---
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_IMAGE_WIDTH = 1200

function processImageFile(file) {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      reject('Only JPEG, PNG, WebP, and GIF images are supported')
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      reject('Image must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        // Resize if wider than max width
        if (img.width > MAX_IMAGE_WIDTH) {
          const ratio = MAX_IMAGE_WIDTH / img.width
          const canvas = document.createElement('canvas')
          canvas.width = MAX_IMAGE_WIDTH
          canvas.height = Math.round(img.height * ratio)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        } else {
          resolve(e.target.result)
        }
      }
      img.onerror = () => reject('Failed to process image')
      img.src = e.target.result
    }
    reader.onerror = () => reject('Failed to read file')
    reader.readAsDataURL(file)
  })
}

// --- Cover image ---
function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) handleCoverImage(file)
}

function handleDrop(e) {
  isDraggingOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) handleCoverImage(file)
}

async function handleCoverImage(file) {
  try {
    const base64 = await processImageFile(file)
    coverImage.value = base64
    coverImagePreview.value = base64
    clearFieldError('coverImage')
    scheduleSave()
  } catch (err) {
    showToastMessage(err)
  }
}

function removeCoverImage() {
  coverImage.value = null
  coverImagePreview.value = null
  scheduleSave()
}

// --- Categories ---
function toggleCategory(cat) {
  if (categories.value.includes(cat)) {
    categories.value = categories.value.filter(c => c !== cat)
  } else {
    categories.value = [...categories.value, cat]
  }
  clearFieldError('category')
  scheduleSave()
}

// --- Toolbar helpers ---
function setLink() {
  const prev = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('Enter URL', prev)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const imageInput = ref(null)

function insertImage() {
  imageInput.value?.click()
}

async function handleImageInsert(e) {
  const file = e.target.files?.[0]
  if (file) {
    try {
      const base64 = await processImageFile(file)
      editor.value?.chain().focus().setImage({ src: base64 }).run()
    } catch (err) {
      showToastMessage(err)
    }
  }
  e.target.value = ''
}

// --- Lifecycle ---
onMounted(() => {
  loadDraft()
})

watch(() => route.params.id, loadDraft)

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  editor.value?.destroy()
})

onBeforeRouteLeave((_to, _from, next) => {
  if (!isDirty.value) { next(); return }
  showCloseModal.value = true
  next(false)
})
</script>

<template>
  <!-- Top bar -->
  <div class="max-w-7xl m-auto fixed top-0 inset-x-0 z-30 bg-white flex items-center justify-between px-6 h-14">
    <span class="font-['Playfair_Display'] font-extrabold text-[#111418] tracking-tight text-3xl select-none">GNSW.</span>

    <div class="flex items-center gap-2">
      <!-- Save status -->
      <span v-if="!saveMessage" class="text-xs text-gray-400 hidden sm:block">
        {{ saved ? 'All changes saved' : 'Saving…' }}
      </span>
      <span v-if="saveMessage" class="text-xs font-semibold text-[#8b1e21]">{{ saveMessage }}</span>

      <!-- Publish (navigates to preview) -->
      <button
        type="button"
        class="bg-[#8b1e21] text-white px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-semibold hover:bg-[#6d1819] transition flex items-center gap-1.5"
        @click="handlePublish"
      >
        <Icon icon="lucide:send" class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Publish</span>
      </button>

      <!-- Close -->
      <button
        type="button"
        class="ml-1 p-2 sm:p-1.5 text-gray-400 hover:text-[#111418] transition"
        @click="handleClose"
        title="Close editor"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Toast notification -->
  <Teleport to="body">
    <div
      v-if="showToast"
      class="fixed top-16 inset-x-0 z-40 flex justify-center pointer-events-none"
    >
      <div class="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-5 py-2.5 shadow-md flex items-center gap-2 pointer-events-auto max-w-md mx-4">
        <Icon icon="lucide:alert-triangle" class="w-3.5 h-3.5 shrink-0 text-amber-500" />
        {{ toastMessage }}
        <button class="ml-auto text-amber-400 hover:text-amber-600 shrink-0" @click="showToast = false">
          <Icon icon="lucide:x" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </Teleport>

  <!-- Main layout -->
  <div class="max-w-7xl m-auto px-6 py-8 pt-14 min-h-screen gap-4 bg-white flex flex-col lg:flex-row">

    <!-- Editor column -->
    <div class="flex-1 min-w-0 py-10 lg:py-14">

      <!-- Title label -->
      <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2">Title</p>

      <!-- Title input -->
      <input
        v-model="title"
        type="text"
        placeholder="Name your blog"
        :class="[
          'draft-title-input w-full text-[1rem] font-normal text-[#111418] placeholder-gray-300 border outline-none mb-1 bg-transparent leading-tight px-3 py-2 focus:ring-1 transition',
          fieldErrors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#8b1e21] focus:ring-[#8b1e21]'
        ]"
        @input="scheduleSave(); clearFieldError('title')"
      />
      <p v-if="fieldErrors.title" class="text-[10px] text-red-500 mb-4">Title is required</p>
      <div v-else class="mb-4" />

      <!-- Content label -->
      <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2">Content</p>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-0.5 border border-gray-300 border-b-0 bg-[#fafaf9] px-2 py-1.5 sticky top-14 z-10 -mx-6 sm:-mx-0">

        <!-- Text style -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('bold') }"
          title="Bold"
          @click="editor?.chain().focus().toggleBold().run()"
        ><Icon icon="lucide:bold" class="w-3.5 h-3.5" /></button>

        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('italic') }"
          title="Italic"
          @click="editor?.chain().focus().toggleItalic().run()"
        ><Icon icon="lucide:italic" class="w-3.5 h-3.5" /></button>

        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('underline') }"
          title="Underline"
          @click="editor?.chain().focus().toggleUnderline().run()"
        ><Icon icon="lucide:underline" class="w-3.5 h-3.5" /></button>

        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('highlight') }"
          title="Highlight"
          @click="editor?.chain().focus().toggleHighlight().run()"
        ><Icon icon="lucide:highlighter" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-gray-300 mx-1" />

        <!-- Headings -->
        <button
          class="toolbar-btn text-[10px] font-bold"
          :class="{ 'toolbar-btn--active': editor?.isActive('heading', { level: 2 }) }"
          title="Heading 2"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >H2</button>

        <button
          class="toolbar-btn text-[10px] font-bold"
          :class="{ 'toolbar-btn--active': editor?.isActive('heading', { level: 3 }) }"
          title="Heading 3"
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        >H3</button>

        <div class="w-px h-4 bg-gray-300 mx-1" />

        <!-- Link -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('link') }"
          title="Link"
          @click="setLink"
        ><Icon icon="lucide:link" class="w-3.5 h-3.5" /></button>

        <!-- Blockquote -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('blockquote') }"
          title="Quote"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        ><Icon icon="lucide:quote" class="w-3.5 h-3.5" /></button>

        <!-- Image -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('image') }"
          title="Image"
          @click="insertImage"
        ><Icon icon="lucide:image" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-gray-300 mx-1" />

        <!-- Lists -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('bulletList') }"
          title="Bullet list"
          @click="editor?.chain().focus().toggleBulletList().run()"
        ><Icon icon="lucide:list" class="w-3.5 h-3.5" /></button>

        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('orderedList') }"
          title="Numbered list"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        ><Icon icon="lucide:list-ordered" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-gray-300 mx-1" />

        <!-- Horizontal rule -->
        <button
          class="toolbar-btn"
          title="Divider"
          @click="editor?.chain().focus().setHorizontalRule().run()"
        ><Icon icon="lucide:minus" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-gray-300 mx-1" />

        <!-- Undo / Redo -->
        <button
          class="toolbar-btn"
          title="Undo"
          @click="editor?.chain().focus().undo().run()"
        ><Icon icon="lucide:undo-2" class="w-3.5 h-3.5" /></button>

        <button
          class="toolbar-btn"
          title="Redo"
          @click="editor?.chain().focus().redo().run()"
        ><Icon icon="lucide:redo-2" class="w-3.5 h-3.5" /></button>
      </div>

      <!-- Hidden file input for image upload -->
      <input ref="imageInput" type="file" accept="image/*" class="sr-only" @change="handleImageInsert" />

      <!-- Word count hint -->
      <div class="flex items-center justify-between mt-1">
        <p v-if="fieldErrors.wordCount" class="text-[10px] text-red-500">Content must be at least 100 words ({{ bodyWordCount }} words)</p>
        <p v-else class="text-[10px] text-gray-400">{{ bodyWordCount }} words</p>
      </div>

      <!-- Tiptap content area -->
      <EditorContent :editor="editor" class="editor-body border border-gray-300 px-4 py-4" />
    </div>

    <!-- Sidebar -->
    <aside class="w-full lg:w-72 xl:w-80  py-8 lg:py-14 space-y-6">

      <!-- Tags (SEO) -->
      <div>
        <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2">Tags</p>
        <p v-if="fieldErrors.tags" class="text-[10px] text-red-500 mb-1">Add at least one tag</p>

        <!-- Selected tags -->
        <div v-if="tags.length" class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5"
          >
            #{{ tag }}
            <button @click="removeTag(tag)"><Icon icon="lucide:x" class="w-2.5 h-2.5" /></button>
          </span>
        </div>

        <!-- Tag input -->
        <div class="flex gap-1">
          <input
            v-model="tagInput"
            type="text"
            placeholder="Add a tag…"
            maxlength="30"
            class="flex-1 border border-gray-300 bg-white px-3 py-2 text-sm text-[#111418] placeholder-gray-300 outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] transition"
            @keydown.enter.prevent="addTag"
            @keydown.,.prevent="addTag"
          />
          <button
            type="button"
            class="border border-gray-300 px-2 text-gray-500 hover:bg-gray-50 transition text-xs font-semibold disabled:opacity-30"
            :disabled="!tagInput.trim() || tags.length >= TAGS_MAX"
            @click="addTag"
          >Add</button>
        </div>
        <p class="text-[10px] text-gray-400 mt-1">{{ tags.length }}/{{ TAGS_MAX }} tags</p>
      </div>

      <!-- Excerpt -->
      <div>
        <label class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2 block">Excerpt</label>
        <textarea
          v-model="excerpt"
          rows="3"
          placeholder="A short summary of this piece…"
          class="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#111418] placeholder-gray-300 outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] resize-none transition"
          @input="scheduleSave"
        />
      </div>

      <!-- Categories -->
      <div>
        <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2">Category</p>
        <p v-if="fieldErrors.category" class="text-[10px] text-red-500 mb-1">Select a category</p>

        <!-- Selected tags -->
        <div v-if="categories.length" class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="cat in categories"
            :key="cat"
            class="inline-flex items-center gap-1 bg-[#8b1e21]/10 text-[#8b1e21] text-[11px] font-medium px-2 py-0.5"
          >
            {{ cat }}
            <button @click="toggleCategory(cat)"><Icon icon="lucide:x" class="w-2.5 h-2.5" /></button>
          </span>
        </div>

        <!-- Dropdown -->
        <div class="relative">
          <button
            type="button"
            class="w-full flex items-center justify-between border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-400 hover:border-gray-400 transition"
            @click="categoryMenuOpen = !categoryMenuOpen"
          >
            <span>{{ categories.length ? 'Add more…' : 'Select categories…' }}</span>
            <Icon icon="lucide:chevron-down" class="w-3.5 h-3.5 transition" :class="{ 'rotate-180': categoryMenuOpen }" />
          </button>

          <div
            v-if="categoryMenuOpen"
            class="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 shadow-lg mt-0.5 max-h-48 overflow-y-auto"
          >
            <button
              v-for="cat in CATEGORY_OPTIONS"
              :key="cat"
              type="button"
              class="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition"
              @click="toggleCategory(cat)"
            >
              <span :class="categories.includes(cat) ? 'text-[#8b1e21] font-medium' : 'text-[#111418]'">{{ cat }}</span>
              <Icon v-if="categories.includes(cat)" icon="lucide:check" class="w-3.5 h-3.5 text-[#8b1e21]" />
            </button>
          </div>
        </div>
      </div>

      <!-- Cover image -->
      <div>
        <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-3">Cover Image</p>
        <p v-if="fieldErrors.coverImage" class="text-[10px] text-red-500 mb-1">Add a cover image</p>

        <div v-if="coverImagePreview" class="relative">
          <img :src="coverImagePreview" alt="Cover" class="w-full aspect-video object-cover border border-gray-300" />
          <button
            class="absolute top-2 right-2 bg-white border border-gray-300 p-1 hover:bg-gray-100 transition"
            title="Remove image"
            @click="removeCoverImage"
          >
            <Icon icon="lucide:x" class="w-3 h-3 text-gray-500" />
          </button>
        </div>

        <label
          v-else
          class="block border-2 border-dashed transition cursor-pointer"
          :class="isDraggingOver ? 'border-[#8b1e21] bg-red-50' : 'border-gray-300 hover:border-gray-400'"
          @dragover.prevent="isDraggingOver = true"
          @dragleave="isDraggingOver = false"
          @drop.prevent="handleDrop"
        >
          <input type="file" accept="image/*" class="sr-only" @change="handleFileSelect" />
          <div class="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
            <Icon icon="lucide:image-plus" class="w-6 h-6" />
            <span class="text-xs text-center">Drag & drop or <span class="text-[#8b1e21] font-semibold">browse</span></span>
          </div>
        </label>
      </div>

    </aside>
  </div>

  <!-- Close / unsaved changes modal -->
  <Teleport to="body">
    <div
      v-if="showCloseModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      @click.self="showCloseModal = false"
    >
      <div class="bg-white w-full max-w-sm p-6 shadow-xl">
        <div class="flex items-start gap-3 mb-5">
          <div class="w-8 h-8 shrink-0 flex items-center justify-center bg-amber-50 border border-amber-200">
            <Icon icon="lucide:alert-triangle" class="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p class="font-bold text-[#111418] text-sm mb-1">You have unsaved changes</p>
            <p class="text-xs text-gray-500 leading-relaxed">If you leave now, your recent changes will be lost. Save to draft first, or discard them.</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button
            class="w-full bg-[#8b1e21] text-white text-xs font-semibold py-2.5 hover:bg-[#6d1819] transition"
            @click="saveAndClose"
          >Save to draft and close</button>
          <button
            class="w-full border border-gray-300 text-[#111418] text-xs font-semibold py-2.5 hover:bg-gray-50 transition"
            @click="confirmClose"
          >Discard changes and close</button>
          <button
            class="w-full text-gray-400 text-xs py-2 hover:text-[#111418] transition"
            @click="showCloseModal = false"
          >Keep editing</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toolbar-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.15s, background-color 0.15s;
  border-radius: 0.125rem;
}
.toolbar-btn:hover {
  color: #111418;
  background-color: #fff;
}
.toolbar-btn--active {
  color: #8b1e21;
  background-color: #fff;
}

/* Tiptap prose styles */
.editor-body :deep(.ProseMirror) {
  outline: none;
  min-height: 320px;
  color: #111418;
  font-size: 1rem;
  line-height: 1.75;
}
.editor-body :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #d1d5db;
  pointer-events: none;
  float: left;
  height: 0;
}
.editor-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: #111418;
}
.editor-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111418;
}
.editor-body :deep(p) { margin-bottom: 1rem; }
.editor-body :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.editor-body :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.editor-body :deep(li) { margin-bottom: 0.25rem; }
.editor-body :deep(blockquote) {
  border-left: 4px solid #8b1e21;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin: 1rem 0;
}
.editor-body :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
  color: #8b1e21;
}
.editor-body :deep(pre) {
  background: #111827;
  color: #f3f4f6;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
.editor-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.editor-body :deep(a) {
  color: #8b1e21;
  text-decoration: underline;
}
.editor-body :deep(mark) {
  background: #fef9c3;
  padding: 0 0.125rem;
}
.editor-body :deep(hr) {
  border: none;
  border-top: 1px solid #eae8e4;
  margin: 2rem 0;
}
.editor-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.editor-body :deep(td),
.editor-body :deep(th) {
  border: 1px solid #eae8e4;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.editor-body :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  text-align: left;
}
.editor-body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.draft-title-input {
  font-family: 'Source Serif 4', Georgia, serif;
}
.editor-body :deep(.ProseMirror) {
  font-family: 'Source Serif 4', Georgia, serif;
}

/* --- Mobile touch targets --- */
@media (max-width: 639px) {
  .toolbar-btn {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>