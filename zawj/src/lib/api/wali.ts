import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface WaliDashboard {
  protectedUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    age: number
    city: string
    bio: string
    religiousInfo: any
    marriageExpectations: any
  }
  conversations: any[]
  receivedLikes: any[]
  sentLikes: any[]
  mutualMatches: any[]
  tuteurInfo: any
  stats: {
    totalConversations: number
    totalLikesReceived: number
    totalLikesSent: number
    totalMatches: number
    activeConversations: number
  }
}

export const waliApi = {
  /**
   * Login du wali
   */
  login: async (email: string, accessCode: string) => {
    const { data } = await axios.post(`${API_URL}/wali/login`, { email, accessCode })
    return data
  },

  /**
   * Récupérer le dashboard complet
   */
  getDashboard: async (token: string): Promise<WaliDashboard> => {
    const { data } = await axios.get(`${API_URL}/wali/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  /**
   * Récupérer les messages d'une conversation
   */
  getConversationMessages: async (token: string, conversationId: string) => {
    const { data } = await axios.get(
      `${API_URL}/wali/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Approuver ou rejeter une conversation
   */
  manageConversation: async (
    token: string,
    conversationId: string,
    action: 'approve' | 'reject'
  ) => {
    const { data } = await axios.patch(
      `${API_URL}/wali/conversations/${conversationId}/manage`,
      { action },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Approuver ou rejeter un like
   */
  manageLike: async (token: string, likeId: string, action: 'approve' | 'reject') => {
    const { data } = await axios.patch(
      `${API_URL}/wali/likes/${likeId}/manage`,
      { action },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  },

  /**
   * Mettre à jour les préférences du wali
   */
  updatePreferences: async (
    token: string,
    preferences: {
      hasAccessToDashboard?: boolean
      notifyOnNewMessage?: boolean
      notifyOnNewLike?: boolean
    }
  ) => {
    const { data } = await axios.patch(`${API_URL}/wali/preferences`, preferences, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },
}
