import { mockDrafts, mockPublished } from './mockDrafts.js'

const DRAFTS_KEY = 'gnsw_drafts'
const PUBLISHED_KEY = 'gnsw_published'
const HIDDEN_DRAFT_IDS_KEY = 'gnsw_hidden_draft_ids'

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900'

function loadJson(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadStoredDrafts() {
  return loadJson(DRAFTS_KEY)
}

function saveStoredDrafts(drafts) {
  saveJson(DRAFTS_KEY, drafts)
}

function loadHiddenDraftIds() {
  return new Set(loadJson(HIDDEN_DRAFT_IDS_KEY))
}

function hideDraftId(id) {
  const hidden = loadHiddenDraftIds()
  hidden.add(id)
  saveJson(HIDDEN_DRAFT_IDS_KEY, [...hidden])
}

function loadStoredPublished() {
  return loadJson(PUBLISHED_KEY)
}

function saveStoredPublished(items) {
  saveJson(PUBLISHED_KEY, items)
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function wordCount(body = '') {
  // body may be HTML from Tiptap; strip tags before counting
  const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

function generateSlug(title = '') {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function allDraftRecords() {
  const stored = loadStoredDrafts()
  const storedIds = new Set(stored.map(d => d.id))
  const seeded = mockDrafts.filter(d => !storedIds.has(d.id))
  return [...stored, ...seeded]
}

export function getDrafts() {
  const hidden = loadHiddenDraftIds()
  return allDraftRecords().filter(d => d.status === 'Draft' && !hidden.has(d.id))
}

export function getArchived() {
  return allDraftRecords().filter(d => d.status === 'Archived')
}

export function getPublished() {
  const stored = loadStoredPublished()
  const storedIds = new Set(stored.map(p => p.id))
  const seeded = mockPublished.filter(p => !storedIds.has(p.id))
  return [...stored, ...seeded]
}

export function getDraftById(id) {
  const hidden = loadHiddenDraftIds()
  if (hidden.has(id)) return null
  return allDraftRecords().find(d => d.id === id) ?? null
}

export function getPublishedById(id) {
  return getPublished().find(p => p.id === id) ?? null
}

export function createDraft({
  title = 'Untitled Draft',
  excerpt = '',
  body = '',
  thumbnail = DEFAULT_THUMBNAIL,
  slug = '',
  categories = [],
  tags = [],
  coverImage = null,
} = {}) {
  const draft = {
    id: `draft-${Date.now()}`,
    title,
    excerpt: excerpt || body.replace(/<[^>]*>/g, ' ').slice(0, 120).trim(),
    body,
    thumbnail: thumbnail || DEFAULT_THUMBNAIL,
    slug: slug || generateSlug(title),
    categories,
    tags,
    coverImage: coverImage ?? null,
    lastModified: formatDate(),
    wordCount: wordCount(body),
    status: 'Draft',
  }
  const stored = loadStoredDrafts()
  stored.unshift(draft)
  saveStoredDrafts(stored)
  return draft
}

export function updateDraft(id, updates) {
  const stored = loadStoredDrafts()
  const index = stored.findIndex(d => d.id === id)
  const next = { ...updates }

  if (updates.body !== undefined) {
    next.wordCount = wordCount(updates.body)
    if (!updates.excerpt) {
      next.excerpt = updates.body.replace(/<[^>]*>/g, ' ').slice(0, 120).trim()
    }
  }

  if (updates.title && !updates.slug) {
    // only auto-generate slug if one isn't explicitly provided
    const existing = index >= 0 ? stored[index] : mockDrafts.find(d => d.id === id)
    if (!existing?.slug) next.slug = generateSlug(updates.title)
  }

  next.lastModified = formatDate()

  if (index >= 0) {
    stored[index] = { ...stored[index], ...next }
    saveStoredDrafts(stored)
    return stored[index]
  }

  const seeded = mockDrafts.find(d => d.id === id)
  if (!seeded) return null

  const updated = { ...seeded, ...next }
  stored.unshift(updated)
  saveStoredDrafts(stored)
  return updated
}

export function renameDraft(id, title) {
  const trimmed = title.trim()
  if (!trimmed) return null
  return updateDraft(id, { title: trimmed })
}

export function duplicateDraft(id) {
  const source = getDraftById(id)
  if (!source) return null
  return createDraft({
    title: `${source.title} (Copy)`,
    excerpt: source.excerpt,
    body: source.body ?? '',
    thumbnail: source.thumbnail || DEFAULT_THUMBNAIL,
    slug: '',
    categories: source.categories ?? [],
    coverImage: source.coverImage ?? null,
  })
}

export function deleteDraft(id) {
  hideDraftId(id)
  saveStoredDrafts(loadStoredDrafts().filter(d => d.id !== id))
}

export function archiveDraft(id) {
  const draft = getDraftById(id)
  if (!draft) return null
  return updateDraft(id, { status: 'Archived' })
}

export function restoreDraft(id) {
  const record = allDraftRecords().find(d => d.id === id)
  if (!record || record.status !== 'Archived') return null
  return updateDraft(id, { status: 'Draft' })
}

export function publishDraft(id) {
  const draft = getDraftById(id)
  if (!draft) return { ok: false, error: 'Draft not found.' }

  const title = draft.title?.trim()
  const body = draft.body?.trim()
  if (!title) return { ok: false, error: 'Add a title before publishing.' }
  if (!body) return { ok: false, error: 'Add content before publishing.' }
  if (wordCount(body) < 50) return { ok: false, error: 'Draft needs at least 50 words before publishing.' }

  const published = {
    id: `published-${Date.now()}`,
    draftId: draft.id,
    title,
    excerpt: draft.excerpt || body.replace(/<[^>]*>/g, ' ').slice(0, 120).trim(),
    body,
    slug: draft.slug || generateSlug(title),
    categories: draft.categories ?? [],
    tags: draft.tags ?? [],
    coverImage: draft.coverImage ?? null,
    datePublished: formatDate(),
    readTime: Math.max(1, Math.ceil(wordCount(body) / 200)),
    claps: 0,
    views: 0,
    status: 'Published',
    articleId: null,
    thumbnail: draft.thumbnail || DEFAULT_THUMBNAIL,
  }

  const stored = loadStoredPublished()
  stored.unshift(published)
  saveStoredPublished(stored)

  hideDraftId(id)
  saveStoredDrafts(loadStoredDrafts().filter(d => d.id !== id))

  return { ok: true, published }
}

export function unpublishPost(id) {
  const stored = loadStoredPublished()
  const post = stored.find(p => p.id === id)
  if (!post) return { ok: false, error: 'Published post not found.' }

  const draft = {
    id: `draft-${Date.now()}`,
    title: post.title,
    excerpt: post.excerpt || '',
    body: post.body || '',
    thumbnail: post.thumbnail || DEFAULT_THUMBNAIL,
    slug: post.slug || generateSlug(post.title),
    categories: post.categories ?? [],
    coverImage: post.coverImage ?? null,
    lastModified: formatDate(),
    wordCount: wordCount(post.body || ''),
    status: 'Draft',
  }

  const drafts = loadStoredDrafts()
  drafts.unshift(draft)
  saveStoredDrafts(drafts)

  saveStoredPublished(stored.filter(p => p.id !== id))

  return { ok: true, draft }
}

export function deletePublished(id) {
  const stored = loadStoredPublished()
  saveStoredPublished(stored.filter(p => p.id !== id))
}

export function searchWriting(query) {
  const q = query.trim().toLowerCase()
  if (!q) return { drafts: getDrafts(), published: getPublished(), archived: getArchived() }
  const match = (item) =>
    item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q)
  return {
    drafts: getDrafts().filter(match),
    published: getPublished().filter(match),
    archived: getArchived().filter(match),
  }
}