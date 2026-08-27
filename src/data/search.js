import { getFeedArticles } from '../api/client.js'

/**
 * Search the LIVE community feed. Returns articles from the server
 * (already filtered by the backend's free-text search).
 */
export async function searchFeedArticles(query) {
  const q = (query || '').trim()
  if (!q) return []
  try {
    const res = await getFeedArticles({ search: q })
    return res.data?.data || []
  } catch {
    return []
  }
}
