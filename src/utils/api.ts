import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Get CSRF token function
export const getCSRFToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/csrf/`, { 
      withCredentials: true 
    })
    return response.data.csrfToken
  } catch (error) {
    console.log('CSRF token fetch failed')
    return null
  }
}

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    // For write operations, ensure we have CSRF token
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      try {
        const csrfToken = await getCSRFToken()
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken
        }
      } catch (error) {
        console.log('Could not get CSRF token, continuing anyway')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api