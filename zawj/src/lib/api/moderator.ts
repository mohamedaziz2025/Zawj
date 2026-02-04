import { api } from './client'

export interface ModeratorProfile {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  isActive: boolean
  assignedUsers: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
    city?: string
    age?: number
    profession?: string
  }>
  canAccessAllMessages: boolean
  permissions: {
    canApprovePaidTutor: boolean
    canViewMessages: boolean
    canBlockUsers: boolean
  }
  statistics: {
    totalAssigned: number
    totalApprovals: number
    totalRejections: number
  }
}

export const moderatorApi = {
  // Get moderator profile
  getProfile: async (): Promise<ModeratorProfile> => {
    const response = await api.get('/api/moderators/me')
    return response.data
  },

  // Get assigned users
  getAssignedUsers: async (): Promise<any[]> => {
    const profile = await moderatorApi.getProfile()
    return profile.assignedUsers
  },

  // Get messages for assigned users
  getMessages: async (): Promise<any[]> => {
    const response = await api.get('/api/moderators/messages')
    return response.data
  },
}
