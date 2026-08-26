import { mockArticles } from './mockArticles.js'
import { getSavedArticleIds, isAuthorFollowed, toggleFollowAuthor } from './feedActions.js'

export function getAuthors() {
  const byName = {}
  mockArticles.forEach(a => {
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

export function getAuthorById(id) {
  return getAuthors().find(a => a.id === id) || null
}

export function getArticlesByAuthor(name) {
  return mockArticles.filter(a => a.author.name === name)
}

export function getAuthorStats(name) {
  const articles = getArticlesByAuthor(name)
  return {
    articleCount: articles.length,
    totalClaps: articles.reduce((s, a) => s + (a.claps || 0), 0),
    totalViews: articles.reduce((s, a) => s + (a.views || 0), 0),
  }
}