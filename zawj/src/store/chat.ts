import { create } from 'zustand'
import { Conversation, Message } from '@/lib/api/chat'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isConnected: boolean
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setConnected: (connected: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isConnected: false,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const { messages, conversations, currentConversation } = get()
    const newMessages = [...messages, message]

    // Update conversation's last message if it's the current conversation
    if (currentConversation && (message.senderId === currentConversation.participants.find(p => p !== message.senderId) ||
        message.receiverId === currentConversation.participants.find(p => p !== message.receiverId))) {
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversation.id
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      )
      set({ messages: newMessages, conversations: updatedConversations })
    } else {
      set({ messages: newMessages })
    }
  },
  setConnected: (connected) => set({ isConnected: connected }),
}))