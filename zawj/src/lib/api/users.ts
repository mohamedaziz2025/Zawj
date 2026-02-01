import { api } from './client'
import type { User } from './auth'
export type { User } from './auth'

export interface UpdateProfileData {
  bio?: string
  age?: number
  location?: string
  preferences?: any
}

export interface SearchFilters {
  gender?: 'male' | 'female'
  minAge?: number
  maxAge?: number
  location?: string
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/users/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch('/api/users/me', data)
    return response.data
  },

  searchUsers: async (filters: SearchFilters = {}): Promise<User[]> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
    const response = await api.get(`/api/users/search?${params}`)
    return response.data
  },
}