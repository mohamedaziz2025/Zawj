import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface ModeratorDashboard {
  stats: {
    totalReports: number
    pendingReports: number
    totalUsers: number
    suspendedUsers: number
    flaggedMessages: number
  }
  recentActivity: {
    recentReports: any[]
    recentUsers: any[]
  }
}

export const moderationApi = {
  /**
   * Récupérer le dashboard de modération
   */
  getDashboard: async (token: string): Promise<ModeratorDashboard> => {
    const { data } = await axios.get(`${API_URL}/moderation/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  /**
   * Récupérer les signalements avec filtres
   */
  getReports: async (
    token: string,
    filters?: {
      status?: string
      type?: string
      page?: number
      limit?: number
    }
  ) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const { data } = await axios.get(`${API_URL}/moderation/reports?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  /**
   * Traiter un signalement
   */
  handleReport: async (
    token: string,
    reportId: string,
    action: 'approve' | 'reject' | 'suspend-user' | 'warn-user',
    notes?: string
  ) => {
    const { data } = await axios.patch(
      `${API_URL}/moderation/reports/${reportId}`,
      { action, notes },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Suspendre un utilisateur
   */
  suspendUser: async (token: string, userId: string, reason: string, durationDays: number) => {
    const { data } = await axios.post(
      `${API_URL}/moderation/users/${userId}/suspend`,
      { reason, durationDays },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Avertir un utilisateur
   */
  warnUser: async (token: string, userId: string, reason: string) => {
    const { data } = await axios.post(
      `${API_URL}/moderation/users/${userId}/warn`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Bannir un utilisateur
   */
  banUser: async (token: string, userId: string, reason: string) => {
    const { data } = await axios.post(
      `${API_URL}/moderation/users/${userId}/ban`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Débloquer un utilisateur
   */
  unblockUser: async (token: string, userId: string) => {
    const { data } = await axios.post(
      `${API_URL}/moderation/users/${userId}/unblock`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Récupérer les messages signalés
   */
  getFlaggedMessages: async (token: string, page: number = 1, limit: number = 50) => {
    const { data } = await axios.get(
      `${API_URL}/moderation/messages/flagged?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Modérer un message
   */
  moderateMessage: async (
    token: string,
    messageId: string,
    shouldBlock: boolean,
    reason?: string
  ) => {
    const { data } = await axios.patch(
      `${API_URL}/moderation/messages/${messageId}`,
      { shouldBlock, reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Vérifier un utilisateur
   */
  verifyUser: async (token: string, userId: string) => {
    const { data } = await axios.post(
      `${API_URL}/moderation/users/${userId}/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Récupérer les statistiques globales
   */
  getGlobalStats: async (token: string) => {
    const { data} = await axios.get(`${API_URL}/moderation/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },
}
