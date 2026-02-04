import { api } from './client'

// Types
export interface AdminStats {
  totalUsers: number
  totalWalis: number
  pendingMahrams: number
  pendingTuteurs?: number // Alias pour pendingMahrams
  totalReports: number
  activeToday: number
  growthRate: number
  reports: number // Add total reports
}

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  gender: 'male' | 'female'
  age?: number
  city?: string
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface Mahram {
  _id: string // MongoDB ID
  id: string
  user: {
    id: string
    name: string
    email: string
    age?: number
    location?: string
  }
  mahram: {
    name: string
    email: string
    phone?: string
    relationship: string
  }
  status: 'pending' | 'approved' | 'rejected'
  documents: {
    type: string
    url: string
    uploadedAt: Date
  }[]
  createdAt: string
  verifiedAt?: string // Add this field
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  verifiedBy?: string
}

// Alias pour Tuteur (ancien Mahram)
export type Tuteur = Mahram;

export interface Report {
  _id: string // MongoDB ID
  id: string
  reporter: {
    id: string
    name: string
    email: string
  }
  reportedUser: {
    id: string
    name: string
    email: string
  }
  type: 'harassment' | 'fake_profile' | 'inappropriate_content' | 'spam' | 'other'
  description: string
  evidence: {
    type: string
    url?: string
    text?: string
  }[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  severity: 'low' | 'medium' | 'high'
  assignedTo?: string
  resolution?: string
  actionTaken?: string
  createdAt: string
  resolvedAt?: string
}

export interface FinancialMetrics {
  revenue: {
    today: number
    week: number
    month: number
    year: number
  }
  subscriptions: {
    active: number
    cancelled: number
    total: number
  }
  conversionRate: number
  averageRevenue: number
}

// API Functions
export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/api/admin/stats')
    return response.data
  },

  // Users
  getUsers: async (params?: { limit?: number; skip?: number }): Promise<{ users: AdminUser[] }> => {
    const response = await api.get('/api/admin/users', { params })
    return response.data
  },

  blockUser: async (userId: string, blocked: boolean): Promise<void> => {
    await api.patch(`/api/admin/users/${userId}/block`, { blocked })
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/admin/users/${userId}`)
  },

  // Mahrams (Tuteurs)
  getMahrams: async (status?: string): Promise<{ mahrams: Mahram[] }> => {
    const params = status && status !== 'all' ? { status } : {}
    const response = await api.get('/api/admin/mahrams', { params })
    return response.data
  },

  // Alias pour getTuteurs
  getTuteurs: async (status?: string): Promise<{ mahrams: Tuteur[]; tuteurs?: Tuteur[] }> => {
    const params = status && status !== 'all' ? { status } : {}
    const response = await api.get('/api/admin/mahrams', { params })
    // Retourner avec les deux propriétés pour compatibilité
    return { 
      mahrams: response.data.mahrams,
      tuteurs: response.data.mahrams 
    }
  },

  approveMahram: async (mahramId: string): Promise<void> => {
    await api.patch(`/api/admin/mahrams/${mahramId}/approve`)
  },

  // Alias pour approveTuteur
  approveTuteur: async (tuteurId: string): Promise<void> => {
    await api.patch(`/api/admin/mahrams/${tuteurId}/approve`)
  },

  rejectMahram: async (mahramId: string, reason: string): Promise<void> => {
    await api.patch(`/api/admin/mahrams/${mahramId}/reject`, { reason })
  },

  // Alias pour rejectTuteur
  rejectTuteur: async (tuteurId: string, reason: string): Promise<void> => {
    await api.patch(`/api/admin/mahrams/${tuteurId}/reject`, { reason })
  },

  // Reports
  getReports: async (status?: string): Promise<{ reports: Report[] }> => {
    const params = status && status !== 'all' ? { status } : {}
    const response = await api.get('/api/admin/reports', { params })
    return response.data
  },

  createReport: async (data: {
    reportedUserId: string
    type: string
    description: string
    evidence?: any[]
  }): Promise<void> => {
    await api.post('/api/admin/reports', data)
  },

  resolveReport: async (
    reportId: string,
    resolution: string,
    actionTaken: string
  ): Promise<void> => {
    await api.patch(`/api/admin/reports/${reportId}/resolve`, {
      resolution,
      actionTaken,
    })
  },

  dismissReport: async (reportId: string): Promise<void> => {
    await api.patch(`/api/admin/reports/${reportId}/dismiss`)
  },

  // Financial
  getFinancialMetrics: async (): Promise<FinancialMetrics> => {
    const response = await api.get('/api/admin/financial/metrics')
    return response.data
  },
}
