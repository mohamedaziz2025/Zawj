import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface SavedSearchFilters {
  gender?: 'male' | 'female'
  minAge?: number
  maxAge?: number
  location?: string
  city?: string
  country?: string
  madhab?: string[]
  prayerFrequency?: string[]
  practiceLevel?: string[]
  wearsHijab?: boolean
  hasBeard?: boolean
  quranMemorization?: string
  acceptsPolygamy?: boolean
  willingToRelocate?: boolean
  wantsChildren?: boolean
}

export interface SavedSearch {
  _id: string
  userId: string
  name: string
  filters: SavedSearchFilters
  notificationsEnabled: boolean
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

export const savedSearchApi = {
  // Save a new search
  save: async (token: string, name: string, filters: SavedSearchFilters, notificationsEnabled: boolean = false) => {
    const response = await axios.post(
      `${API_URL}/api/search/save`,
      { name, filters, notificationsEnabled },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Get all saved searches
  getAll: async (token: string) => {
    const response = await axios.get(
      `${API_URL}/api/search/saved`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Get a specific saved search
  getById: async (token: string, id: string) => {
    const response = await axios.get(
      `${API_URL}/api/search/saved/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Update a saved search
  update: async (token: string, id: string, name: string, filters: SavedSearchFilters, notificationsEnabled: boolean) => {
    const response = await axios.patch(
      `${API_URL}/api/search/saved/${id}`,
      { name, filters, notificationsEnabled },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Delete a saved search
  delete: async (token: string, id: string) => {
    const response = await axios.delete(
      `${API_URL}/api/search/saved/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  }
}
