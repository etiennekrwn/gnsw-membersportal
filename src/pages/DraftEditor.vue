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
  publishDraft,
} from '../data/writing.js'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.name === 'DraftNew')

// --- Fields ---
const title = ref('')
const excerpt = ref('')
const slug = ref('')
const categories = ref([])
const coverImage = ref(null) // base64 or null
const coverImagePreview = ref(null)
const saved = ref(true)
const saveMessage = ref('')
const publishError = ref('')
const showCloseModal = ref(false)
const isDraggingOver = ref(false)

// Category options
const CATEGORY_OPTIONS = [
  'Speech Writing', 'Rhetoric', 'Public Speaking', 'Politics',
  'Leadership', 'Communication', 'Culture', 'Opinion', 'Analysis',
]
const categoryMenuOpen = ref(false)

let saveTimer = null
let lastSavedTitle = ''
let lastSavedBody = ''
let lastSavedExcerpt = ''
let lastSavedSlug = ''
let lastSavedCategories = ''
let lastSavedCoverImage = null

const isDirty = computed(() => {
  return (
    title.value !== lastSavedTitle ||
    (editor.value?.getHTML() ?? '') !== lastSavedBody ||
    excerpt.value !== lastSavedExcerpt ||
    slug.value !== lastSavedSlug ||
    JSON.stringify(categories.value) !== lastSavedCategories ||
    coverImage.value !== lastSavedCoverImage
  )
})

function syncSavedSnapshot() {
  lastSavedTitle = title.value
  lastSavedBody = editor.value?.getHTML() ?? ''
  lastSavedExcerpt = excerpt.value
  lastSavedSlug = slug.value
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
      class: 'prose prose-lg max-w-none focus:outline-none min-h-[320px] font-source-serif text-[#111418]',
    },
  },
})

// --- Load draft ---
function loadDraft() {
  publishError.value = ''
  if (isNew.value) {
    title.value = ''
    excerpt.value = ''
    slug.value = ''
    categories.value = []
    coverImage.value = null
    coverImagePreview.value = null
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
  slug.value = draft.slug ?? ''
  categories.value = draft.categories ?? []
  coverImage.value = draft.coverImage ?? null
  coverImagePreview.value = draft.coverImage ?? null
  editor.value?.commands.setContent(draft.body ?? '')
  syncSavedSnapshot()
}

// --- Auto-slug from title ---
watch(title, (val) => {
  if (!slug.value || slug.value === autoSlug(lastSavedTitle)) {
    slug.value = autoSlug(val)
  }
})

function autoSlug(val) {
  return val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

// --- Save logic ---
function scheduleSave() {
  if (isNew.value) { saved.value = false; return }
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 800)
}

function saveNow() {
  publishError.value = ''
  const body = editor.value?.getHTML() ?? ''

  if (isNew.value) {
    if (!title.value.trim() && !body.replace(/<[^>]*>/g, '').trim()) return
    const draft = createDraft({
      title: title.value || 'Untitled Draft',
      body,
      excerpt: excerpt.value,
      slug: slug.value,
      categories: categories.value,
      coverImage: coverImage.value,
    })
    syncSavedSnapshot()
    saveMessage.value = 'Draft saved'
    router.replace({ name: 'DraftEdit', params: { id: draft.id } })
    setTimeout(() => { saveMessage.value = '' }, 2000)
    return
  }

  updateDraft(route.params.id, {
    title: title.value,
    body,
    excerpt: excerpt.value,
    slug: slug.value,
    categories: categories.value,
    coverImage: coverImage.value,
  })
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
    updateDraft(route.params.id, {
      title: title.value,
      body: editor.value?.getHTML() ?? '',
      excerpt: excerpt.value,
      slug: slug.value,
      categories: categories.value,
      coverImage: coverImage.value,
    })
    syncSavedSnapshot()
  }
  const result = publishDraft(route.params.id)
  if (!result.ok) {
    publishError.value = result.error
    return
  }
  router.push({ name: 'MyWriting', query: { tab: 'Published', published: result.published.id } })
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

// --- Cover image ---
function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) readImageFile(file)
}

function handleDrop(e) {
  isDraggingOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) readImageFile(file)
}

function readImageFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    coverImage.value = base64
    coverImagePreview.value = base64
    scheduleSave()
  }
  reader.readAsDataURL(file)
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
  <div class="fixed top-0 inset-x-0 z-30 bg-white border-b border-[#eae8e4] flex items-center justify-between px-6 h-14">
    <span class="font-extrabold text-[#111418] tracking-tight text-lg select-none">GNSW</span>

    <div class="flex items-center gap-2">
      <!-- Save status -->
      <span v-if="!saveMessage" class="text-xs text-gray-400 hidden sm:block">
        {{ isNew ? 'Unsaved draft' : saved ? 'All changes saved' : 'Saving…' }}
      </span>
      <span v-if="saveMessage" class="text-xs font-semibold text-[#8b1e21]">{{ saveMessage }}</span>

      <!-- Save to draft -->
      <button
        type="button"
        class="border border-[#eae8e4] text-[#111418] px-4 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
        @click="saveNow"
      >
        Save to draft
      </button>

      <!-- Publish -->
      <button
        type="button"
        class="bg-[#8b1e21] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#6d1819] transition flex items-center gap-1.5"
        @click="handlePublish"
      >
        <Icon icon="lucide:send" class="w-3.5 h-3.5" />
        Publish
      </button>

      <!-- Close -->
      <button
        type="button"
        class="ml-1 p-1.5 text-gray-400 hover:text-[#111418] transition"
        @click="handleClose"
        title="Close editor"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Publish error banner -->
  <div
    v-if="publishError"
    class="fixed top-14 inset-x-0 z-20 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium px-6 py-2 flex items-center gap-2"
  >
    <Icon icon="lucide:alert-circle" class="w-3.5 h-3.5 flex-shrink-0" />
    {{ publishError }}
    <button class="ml-auto text-red-400 hover:text-red-600" @click="publishError = ''">
      <Icon icon="lucide:x" class="w-3.5 h-3.5" />
    </button>
  </div>

  <!-- Main layout -->
  <div class="pt-14 min-h-screen bg-white flex flex-col lg:flex-row">

    <!-- Editor column -->
    <div class="flex-1 min-w-0 px-6 sm:px-10 lg:px-16 xl:px-24 py-10 lg:py-14">

      <!-- Title -->
      <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#111418] placeholder-gray-200 border-none outline-none mb-8 bg-transparent leading-tight"
        @input="scheduleSave"
      />

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-0.5 mb-4 border border-[#eae8e4] bg-[#fafaf9] px-2 py-1.5">

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

        <div class="w-px h-4 bg-[#eae8e4] mx-1" />

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

        <div class="w-px h-4 bg-[#eae8e4] mx-1" />

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

        <!-- Inline code -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('code') }"
          title="Inline code"
          @click="editor?.chain().focus().toggleCode().run()"
        ><Icon icon="lucide:code" class="w-3.5 h-3.5" /></button>

        <!-- Code block -->
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor?.isActive('codeBlock') }"
          title="Code block"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
        ><Icon icon="lucide:terminal" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-[#eae8e4] mx-1" />

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

        <div class="w-px h-4 bg-[#eae8e4] mx-1" />

       

        <!-- Horizontal rule -->
        <button
          class="toolbar-btn"
          title="Divider"
          @click="editor?.chain().focus().setHorizontalRule().run()"
        ><Icon icon="lucide:minus" class="w-3.5 h-3.5" /></button>

        <div class="w-px h-4 bg-[#eae8e4] mx-1" />

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

      <!-- Tiptap content area -->
      <EditorContent :editor="editor" class="editor-body" />
    </div>

    <!-- Sidebar -->
    <aside class="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-[#eae8e4] bg-[#fafaf9] px-6 py-8 lg:py-14 flex-shrink-0 space-y-7">

      <!-- Cover image -->
      <div>
        <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-3">Cover Image</p>

        <div v-if="coverImagePreview" class="relative">
          <img :src="coverImagePreview" alt="Cover" class="w-full aspect-video object-cover border border-[#eae8e4]" />
          <button
            class="absolute top-2 right-2 bg-white border border-[#eae8e4] p-1 hover:bg-gray-100 transition"
            title="Remove image"
            @click="removeCoverImage"
          >
            <Icon icon="lucide:x" class="w-3 h-3 text-gray-500" />
          </button>
        </div>

        <label
          v-else
          class="block border-2 border-dashed transition cursor-pointer"
          :class="isDraggingOver ? 'border-[#8b1e21] bg-red-50' : 'border-[#eae8e4] hover:border-gray-300'"
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

      <!-- Excerpt -->
      <div>
        <label class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2 block">Excerpt</label>
        <textarea
          v-model="excerpt"
          rows="3"
          placeholder="A short summary of this piece…"
          class="w-full border border-[#eae8e4] bg-white px-3 py-2.5 text-sm text-[#111418] placeholder-gray-300 outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] resize-none"
          @input="scheduleSave"
        />
      </div>

      <!-- Slug -->
      <div>
        <label class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2 block">Slug</label>
        <input
          v-model="slug"
          type="text"
          placeholder="url-friendly-title"
          class="w-full border border-[#eae8e4] bg-white px-3 py-2.5 text-sm text-[#111418] placeholder-gray-300 outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] font-mono"
          @input="scheduleSave"
        />
      </div>

      <!-- Categories -->
      <div>
        <p class="text-[10px] uppercase tracking-[2px] text-gray-400 mb-2">Category</p>

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
            class="w-full flex items-center justify-between border border-[#eae8e4] bg-white px-3 py-2.5 text-sm text-gray-400 hover:border-gray-300 transition"
            @click="categoryMenuOpen = !categoryMenuOpen"
          >
            <span>{{ categories.length ? 'Add more…' : 'Select categories…' }}</span>
            <Icon icon="lucide:chevron-down" class="w-3.5 h-3.5 transition" :class="{ 'rotate-180': categoryMenuOpen }" />
          </button>

          <div
            v-if="categoryMenuOpen"
            class="absolute top-full left-0 right-0 z-10 bg-white border border-[#eae8e4] shadow-lg mt-0.5 max-h-48 overflow-y-auto"
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
          <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-amber-50 border border-amber-200">
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
            class="w-full border border-[#eae8e4] text-[#111418] text-xs font-semibold py-2.5 hover:bg-gray-50 transition"
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
</style>