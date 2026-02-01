import { api } from './client'

export interface Like {
  _id: string
  from: string
  to: string
  type: 'like' | 'super-like'
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  mutualMatch: boolean
  createdAt: string
  updatedAt: string
}

export interface SendLikeData {
  to: string
  type?: 'like' | 'super-like'
  message?: string
}

export interface LikesStats {
  sent: number
  received: number
  matches: number
  dailyLikesRemaining?: number
}

export const likesApi = {
  // Send a like/interest to a user
  sendLike: async (data: SendLikeData): Promise<Like> => {
    const response = await api.post('/api/likes/send', data)
    return response.data
  },

  // Get all likes sent by current user
  getSentLikes: async (): Promise<Like[]> => {
    const response = await api.get('/api/likes/sent')
    return response.data
  },

  // Get all likes received by current user
  getReceivedLikes: async (): Promise<Like[]> => {
    const response = await api.get('/api/likes/received')
    return response.data
  },

  // Get mutual matches (both users liked each other)
  getMatches: async (): Promise<Like[]> => {
    const response = await api.get('/api/likes/matches')
    return response.data
  },

  // Get likes statistics
  getStats: async (): Promise<LikesStats> => {
    const response = await api.get('/api/likes/stats')
    return response.data
  },

  // Remove/unlike a user
  removeLike: async (likeId: string): Promise<void> => {
    await api.delete(`/api/likes/${likeId}`)
  },
}
