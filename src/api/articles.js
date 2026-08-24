import apiClient from './client'

/**
 * Members community feed API — real articles from the backend.
 */
export async function getFeedArticles({ tag, search } = {}) {
  const params = {}
  if (tag && tag !== 'All') params.tag = tag
  if (search) params.search = search
  const { data } = await apiClient.get('/public/articles', { params })
  return data.data || []
}

export async function getArticle(id) {
  const { data } = await apiClient.get(`/public/articles/${id}`)
  return data.data
}

export async function clapArticle(id) {
  const { data } = await apiClient.post(`/public/articles/${id}/clap`)
  return data.data
}

export async function getMyArticles() {
  const { data } = await apiClient.get('/members/articles')
  return data.data || []
}

export async function createArticle(payload) {
  const { data } = await apiClient.post('/members/articles', payload)
  return data.data
}
