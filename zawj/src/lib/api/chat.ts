import { api } from './client'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: Date
}

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/api/chat/conversations')
    return response.data
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`)
    return response.data
  },

  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    const response = await api.post('/api/chat/messages', { receiverId, content })
    return response.data
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/api/chat/conversations/${conversationId}/read`)
  },
}