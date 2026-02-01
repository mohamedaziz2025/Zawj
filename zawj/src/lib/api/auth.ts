import { api } from './client'

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  gender: 'male' | 'female'
  waliInfo?: {
    type: 'platform' | 'external'
    platformServicePaid?: boolean
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  gender: 'male' | 'female'
  age?: number
  location?: string
  bio?: string
  isActive: boolean
  isVerified: boolean
  role?: 'user' | 'admin' | 'moderator'
  subscription?: {
    plan: string
    status: string
  }
  waliId?: string
  waliInfo?: any
  preferences?: any
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/api/auth/register', data)
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  login: async (data: LoginData) => {
    const response = await api.post('/api/auth/login', data)
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  logout: async () => {
    await api.post('/api/auth/logout')
    localStorage.removeItem('accessToken')
  },

  refresh: async () => {
    const response = await api.post('/api/auth/refresh')
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/users/me')
    return response.data
  },
}