import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const tuteurApi = {
  // Admin routes
  getAllTuteurs: async (token: string, status?: string) => {
    const url = status ? `${API_URL}/api/admin/tuteurs?status=${status}` : `${API_URL}/api/admin/tuteurs`
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  approveTuteur: async (token: string, tuteurId: string) => {
    const response = await axios.patch(
      `${API_URL}/api/admin/tuteurs/${tuteurId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  rejectTuteur: async (token: string, tuteurId: string, reason: string) => {
    const response = await axios.patch(
      `${API_URL}/api/admin/tuteurs/${tuteurId}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  createTuteur: async (token: string, data: any) => {
    const response = await axios.post(
      `${API_URL}/api/admin/tuteurs`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  assignModerator: async (token: string, userId: string, moderatorId: string) => {
    const response = await axios.post(
      `${API_URL}/api/admin/tuteurs/assign-moderator`,
      { userId, moderatorId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  updateTuteur: async (token: string, tuteurId: string, data: any) => {
    const response = await axios.patch(
      `${API_URL}/api/admin/tuteurs/${tuteurId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  deleteTuteur: async (token: string, tuteurId: string) => {
    const response = await axios.delete(
      `${API_URL}/api/admin/tuteurs/${tuteurId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // User routes
  getMyTuteurs: async (token: string) => {
    const response = await axios.get(
      `${API_URL}/api/tuteurs/my-tuteurs`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  requestTuteur: async (token: string, data: any) => {
    const response = await axios.post(
      `${API_URL}/api/tuteurs/request`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  }
}
