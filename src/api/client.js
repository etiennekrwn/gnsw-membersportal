import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor: attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portal_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: extract error messages consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('portal_token')
        localStorage.removeItem('portal_user')
        window.location.href = '/login'
        return Promise.reject(new Error('Session expired. Please log in again.'))
      }
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'An unexpected error occurred.'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(
        new Error('Unable to reach the server. Please check your connection.')
      )
    }
    return Promise.reject(error)
  }
)

// --- Preferences & account (member portal) ---

export const getMyPreferences = () => apiClient.get('/members/preferences')
export const updateMyPreferences = (payload) => apiClient.patch('/members/preferences', payload)
export const changeMyPassword = (payload) => apiClient.post('/members/password', payload)
export const requestAccountDeletion = (payload) => apiClient.post('/members/account/deletion-request', payload)

// --- Community feed (portal articles) ---

// Public feed endpoint — no auth required (guests can browse published articles).
export const getFeedArticles = (params = {}) => {
  const query = new URLSearchParams()
  if (params.tag) query.set('tag', params.tag)
  if (params.search) query.set('search', params.search)
  const qs = query.toString()
  return apiClient.get(`/public/articles${qs ? `?${qs}` : ''}`)
}

export const getArticle = (id) => apiClient.get(`/public/articles/${id}`)
export const clapArticle = (id) => apiClient.post(`/public/articles/${id}/clap`)

// Authenticated member article methods (drafts / own articles / publish).
export const getMyArticles = () => apiClient.get('/members/articles')
export const publishArticle = (payload) => apiClient.post('/members/articles', payload)

export default apiClient