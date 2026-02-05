import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface UserSettings {
  _id: string
  userId: string
  notifications: {
    email: {
      newMatches: boolean
      newMessages: boolean
      profileViews: boolean
      likes: boolean
      newsletter: boolean
    }
    push: {
      newMatches: boolean
      newMessages: boolean
      profileViews: boolean
      likes: boolean
    }
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    showProfileViews: boolean
    allowMessagesFromNonMatches: boolean
    hideProfileFromSearch: boolean
  }
  searchPreferences: {
    ageRange: {
      min: number
      max: number
    }
    distanceRadius?: number
    preferredLocations?: string[]
    religiousPreferences: {
      madhabs?: string[]
      prayerFrequencies?: string[]
      practiceLevels?: string[]
    }
  }
  blocked: string[]
  language: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export const settingsApi = {
  // Get user settings
  get: async (token: string) => {
    const response = await axios.get(
      `${API_URL}/api/users/settings`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Update user settings
  update: async (token: string, settings: Partial<UserSettings>) => {
    const response = await axios.patch(
      `${API_URL}/api/users/settings`,
      settings,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Block a user
  blockUser: async (token: string, userId: string) => {
    const response = await axios.post(
      `${API_URL}/api/users/settings/block/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Unblock a user
  unblockUser: async (token: string, userId: string) => {
    const response = await axios.delete(
      `${API_URL}/api/users/settings/block/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  }
}
