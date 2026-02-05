import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessage extends ContactFormData {
  _id: string
  status: 'pending' | 'responded' | 'archived'
  response?: string
  respondedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export const contactApi = {
  // Submit contact form (public)
  submit: async (data: ContactFormData) => {
    const response = await axios.post(`${API_URL}/api/contact`, data)
    return response.data
  },

  // Get all contact messages (admin only)
  getAll: async (token: string, status?: string) => {
    const url = status ? `${API_URL}/api/contact?status=${status}` : `${API_URL}/api/contact`
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // Respond to contact message (admin only)
  respond: async (token: string, messageId: string, response: string) => {
    const res = await axios.patch(
      `${API_URL}/api/contact/${messageId}/respond`,
      { response },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
  },

  // Archive contact message (admin only)
  archive: async (token: string, messageId: string) => {
    const response = await axios.patch(
      `${API_URL}/api/contact/${messageId}/archive`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  // Delete contact message (admin only)
  delete: async (token: string, messageId: string) => {
    const response = await axios.delete(
      `${API_URL}/api/contact/${messageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  }
}
