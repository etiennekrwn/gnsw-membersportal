const SAVED_KEY = 'gnsw_saved_articles'
const MUTED_KEY = 'gnsw_muted_authors'
const FOLLOWED_KEY = 'gnsw_followed_authors'
const LIKED_KEY = 'gnsw_liked_articles'

function loadSet(key) {
  try {
    const stored = localStorage.getItem(key)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]))
}

export function getSavedArticleIds() {
  return loadSet(SAVED_KEY)
}

export function isArticleSaved(articleId) {
  return getSavedArticleIds().has(String(articleId))
}

export function toggleSaveArticle(articleId) {
  const saved = getSavedArticleIds()
  const id = String(articleId)
  if (saved.has(id)) saved.delete(id)
  else saved.add(id)
  saveSet(SAVED_KEY, saved)
  return saved.has(id)
}

export function getMutedAuthors() {
  return loadSet(MUTED_KEY)
}

export function isAuthorMuted(authorName) {
  return getMutedAuthors().has(authorName)
}

export function toggleMuteAuthor(authorName) {
  const muted = getMutedAuthors()
  if (muted.has(authorName)) muted.delete(authorName)
  else muted.add(authorName)
  saveSet(MUTED_KEY, muted)
  return muted.has(authorName)
}

export function getFollowedAuthors() {
  return loadSet(FOLLOWED_KEY)
}

export function isAuthorFollowed(authorName) {
  return getFollowedAuthors().has(authorName)
}

export function toggleFollowAuthor(authorName) {
  const followed = getFollowedAuthors()
  if (followed.has(authorName)) followed.delete(authorName)
  else followed.add(authorName)
  saveSet(FOLLOWED_KEY, followed)
  return followed.has(authorName)
}

export function filterFeedArticles(articles) {
  const muted = getMutedAuthors()
  return articles.filter(a => !muted.has(a.author.name))
}

export function getSavedArticles(allArticles) {
  const saved = getSavedArticleIds()
  return allArticles.filter(a => saved.has(String(a.id)))
}

// --- Liked articles (persisted locally for now; server sync is a later step) ---

export function getLikedArticleIds() {
  return loadSet(LIKED_KEY)
}

export function isArticleLiked(articleId) {
  return getLikedArticleIds().has(String(articleId))
}

export function toggleLikeArticle(articleId) {
  const liked = getLikedArticleIds()
  const id = String(articleId)
  if (liked.has(id)) liked.delete(id)
  else liked.add(id)
  saveSet(LIKED_KEY, liked)
  return liked.has(id)
}

/**
 * Basic engagement score for a recommended feed. Ranks articles by a blend of
 * claps, comments, and views so "For You / Trending" shows high-engagement
 * writing first (weighted toward claps and comments).
 */
export function engagementScore(article) {
  const claps = Number(article.claps || article.likes || 0)
  const comments = Number(article.comments || 0)
  const views = Number(article.views || 0)
  // Prefer items with meaningful reactions; views are the weakest signal.
  return claps * 2 + comments * 3 + views * 0.1
}
