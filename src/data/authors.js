import { getFeedArticles } from '../api/client.js'
import { isAuthorFollowed, toggleFollowAuthor } from './feedActions.js'

/**
 * Author data now comes from the LIVE community feed. These helpers take
 * the already-fetched article list (from GET /public/articles) and derive
 * author profiles, their articles, and aggregate stats.
 */
export function getAuthors(feedArticles) {
  const articles = feedArticles || []
  const byName = {}
  articles.forEach(a => {
    if (!a.author || !a.author.name) return
    const name = a.author.name
    if (!byName[name]) {
      byName[name] = {
        ...a.author,
        id: `author-${name.toLowerCase().replace(/\s+/g, '-')}`,
      }
    }
  })
  return Object.values(byName)
}

export function findAuthor(feedArticles, name) {
  return getAuthors(feedArticles).find(a => a.name === name) || null
}

export function getArticlesByAuthor(feedArticles, name) {
  return (feedArticles || []).filter(a => a.author && a.author.name === name)
}

export function getAuthorStats(feedArticles, name) {
  const articles = getArticlesByAuthor(feedArticles, name)
  return {
    articleCount: articles.length,
    totalClaps: articles.reduce((s, a) => s + (a.claps || 0), 0),
    totalViews: articles.reduce((s, a) => s + (a.views || 0), 0),
  }
}