import { mockArticles } from './mockArticles.js'
import { filterCourses } from './courses.js'
import { getEvents } from './events.js'
import { searchWriting } from './writing.js'

export function globalSearch(query) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { articles: [], courses: [], events: [], drafts: [], published: [] }
  }

  const articles = mockArticles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.author.name.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q)
  )

  const courses = filterCourses({ query: q })
  const events = getEvents().filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.city.toLowerCase().includes(q) ||
    e.type.toLowerCase().includes(q)
  )

  const { drafts, published } = searchWriting(q)

  return { articles, courses, events, drafts, published }
}

export function hasSearchResults(results) {
  return (
    results.articles.length +
    results.courses.length +
    results.events.length +
    results.drafts.length +
    results.published.length
  ) > 0
}
