import axios from 'axios'

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(
  /\/$/,
  ''
)
const API_BASE = backendBaseUrl ? `${backendBaseUrl}/api` : '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahyog_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || ''
    const isAuthEndpoint = requestUrl.startsWith('/auth/')

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('sahyog_token')
      localStorage.removeItem('sahyog_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Admin API (separate instance with admin token)
const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahyog_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sahyog_admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  emailRegister: (data) => api.post('/auth/register', data),
  emailLogin: (data) => api.post('/auth/login', data),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
}

// ============================================
// USER API
// ============================================
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) =>
    api.put(
      '/user/update',
      data,
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    ),
  getLeaderboard: (params) => api.get('/user/leaderboard', { params }),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data) => api.put('/user/settings', data),
}

// ============================================
// BLOOD API
// ============================================
export const bloodAPI = {
  registerDonor: (data) => api.post('/blood/register-donor', data),
  createRequest: (data) => api.post('/blood/create-request', data),
  getNearbyDonors: (params) => api.get('/blood/nearby-donors', { params }),
  respond: (data) => api.post('/blood/respond', data),
  getHistory: () => api.get('/blood/history'),
  getRequests: (params) => api.get('/blood/requests', { params }),
}

// ============================================
// FUND API
// ============================================
export const fundAPI = {
  getCategories: () => api.get('/fund/categories'),
  createCampaign: (data) =>
    api.post(
      '/fund/campaign/create',
      data,
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    ),
  listCampaigns: (params) => api.get('/fund/campaign/list', { params }),
  donate: (data) => api.post('/fund/donate', data),
  getTransactions: (params) => api.get('/fund/transactions', { params }),
}

// ============================================
// MISSING API
// ============================================
export const missingAPI = {
  report: (data) =>
    api.post(
      '/missing/report',
      data,
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    ),
  list: (params) => api.get('/missing/list', { params }),
  getDetail: (id) => api.get(`/missing/${id}`),
  reportSighting: (data) => api.post('/missing/sighting', data),
}

// ============================================
// REPORT API
// ============================================
export const reportAPI = {
  create: (data) => api.post('/report/create', data),
  list: (params) => api.get('/report/list', { params }),
}

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  login: (data) => adminApi.post('/admin/auth/login', data),
  getDashboard: () => adminApi.get('/admin/dashboard'),
  getVerifications: (params) =>
    adminApi.get('/admin/verifications', { params }),
  approveVerification: (data) =>
    adminApi.post('/admin/verification/approve', data),
  rejectVerification: (data) =>
    adminApi.post('/admin/verification/reject', data),
  getReports: (params) => adminApi.get('/admin/reports', { params }),
  takeAction: (data) => adminApi.post('/admin/action', data),
}

export default api
