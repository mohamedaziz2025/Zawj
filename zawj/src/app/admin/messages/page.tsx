'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Search, ChevronLeft, Eye, Users, Calendar, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'
import { api } from '@/lib/api/client'

interface Conversation {
  _id: string
  participants: {
    _id: string
    firstName: string
    lastName: string
    email: string
    gender: string
  }[]
  lastMessage: {
    content: string
    sender: string
    createdAt: string
  }
  messageCount: number
  createdAt: string
}

interface Message {
  _id: string
  sender: {
    _id: string
    firstName: string
    lastName: string
  }
  content: string
  createdAt: string
}

export default function AdminMessagesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuthStore()

  // Fetch all conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const response = await api.get('/admin/conversations')
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'admin',
  })

  // Fetch messages for selected conversation
  const { data: messagesData } = useQuery({
    queryKey: ['admin-messages', selectedConversation],
    queryFn: async () => {
      const response = await api.get(`/admin/conversations/${selectedConversation}/messages`)
      return response.data
    },
    enabled: !!selectedConversation,
  })

  const conversations: Conversation[] = conversationsData?.conversations || []
  const messages: Message[] = messagesData?.messages || []

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) =>
      `${p.firstName} ${p.lastName} ${p.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Chargement des conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Messagerie des utilisateurs
              </h1>
              <p className="text-gray-600 text-lg">
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''} active{conversations.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv._id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedConversation === conv._id
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.participants.map(p => p.firstName).join(' & ')}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessage?.createdAt || conv.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage?.content || 'Aucun message'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {conv.messageCount} message{conv.messageCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune conversation trouvée</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
            {selectedConversation ? (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {conversations.find(c => c._id === selectedConversation)?.participants.map(p => `${p.firstName} ${p.lastName}`).join(' & ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {messages.length} message{messages.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                        <Eye className="h-3 w-3 inline mr-1" />
                        Mode supervision
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isFirstParticipant = message.sender._id === conversations.find(c => c._id === selectedConversation)?.participants[0]._id
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isFirstParticipant ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] ${isFirstParticipant ? '' : 'order-2'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700">
                                {message.sender.firstName} {message.sender.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div
                              className={`p-4 rounded-2xl ${
                                isFirstParticipant
                                  ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun message dans cette conversation</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <Eye className="h-4 w-4" />
                    <span>Mode lecture seule - Vous consultez cette conversation en tant qu'administrateur</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-600">
                    Choisissez une conversation dans la liste pour voir les messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
