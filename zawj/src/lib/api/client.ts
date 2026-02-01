import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true
        })
        const newToken = refreshResponse.data.accessToken
        localStorage.setItem('accessToken', newToken)
        error.config.headers.Authorization = `Bearer ${newToken}`
        return api.request(error.config)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api