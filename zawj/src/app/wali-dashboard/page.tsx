'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, MessageCircle, Heart, Users, Bell, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ProtectedUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  age?: number
  city?: string
  religiousInfo?: any
}

interface Conversation {
  id: string
  participants: any[]
  lastMessage: string
  lastMessageAt: Date
  unreadCount: number
}

interface Like {
  id: string
  from: any
  message?: string
  mutualMatch: boolean
  createdAt: Date
}

export default function WaliDashboardPage() {
  const [protectedUser, setProtectedUser] = useState<ProtectedUser | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([])
  const [mutualMatches, setMutualMatches] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('waliToken')
      if (!token) {
        router.push('/Tuteur-login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tuteur/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Échec de chargement')
      }

      const data = await response.json()
      setProtectedUser(data.protectedUser)
      setConversations(data.conversations)
      setReceivedLikes(data.receivedLikes)
      setMutualMatches(data.mutualMatches)
    } catch (error) {
      console.error('Error:', error)
      router.push('/Tuteur-login')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('waliToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tuteur/conversations/${conversationId}/messages`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        setSelectedConversation(conversationId)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('waliToken')
    localStorage.removeItem('protectedUser')
    router.push('/Tuteur-login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff007f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#ff007f] rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Espace Tuteur</h1>
                <p className="text-sm text-gray-400">
                  Surveillance de {protectedUser?.firstName} {protectedUser?.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:border-[#ff007f] hover:text-[#ff007f] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <MessageCircle className="h-8 w-8 text-[#ff007f]" />
              <span className="text-3xl font-bold text-white">{conversations.length}</span>
            </div>
            <p className="text-sm text-gray-400">Conversations</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Heart className="h-8 w-8 text-[#ff007f]" />
              <span className="text-3xl font-bold text-white">{receivedLikes.length}</span>
            </div>
            <p className="text-sm text-gray-400">Likes Reçus</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="h-8 w-8 text-red-500" />
              <span className="text-3xl font-bold text-white">{mutualMatches}</span>
            </div>
            <p className="text-sm text-gray-400">Matches Mutuels</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Bell className="h-8 w-8 text-[#ff007f]" />
              <span className="text-3xl font-bold text-white">
                {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
              </span>
            </div>
            <p className="text-sm text-gray-400">Non lus</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-[#ff007f]" />
              <span>Conversations</span>
            </h2>

            <div className="space-y-4">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune conversation</p>
              ) : (
                conversations.map((conv) => {
                  const otherParticipant = conv.participants.find(
                    (p: any) => p._id !== protectedUser?.id
                  )
                  return (
                    <button
                      key={conv.id}
                      onClick={() => fetchConversationMessages(conv.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedConversation === conv.id
                          ? 'bg-[#ff007f]/20 border-2 border-[#ff007f]'
                          : 'bg-[#1a1a1a] border border-gray-800 hover:border-[#ff007f]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {otherParticipant?.firstName} {otherParticipant?.lastName}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#ff007f] text-white text-xs font-bold px-2 py-1 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR')}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            {selectedConversation ? (
              <>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-[#ff007f]" />
                  <span>Messages de la conversation</span>
                </h2>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl ${
                        msg.senderId === protectedUser?.id
                          ? 'bg-[#ff007f]/10 ml-12'
                          : 'bg-[#1a1a1a] mr-12'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">
                          {msg.senderId === protectedUser?.id ? protectedUser?.firstName : msg.senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-300">{msg.text}</p>
                      {msg.isBlocked && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                          ⚠️ Contenu bloqué: {msg.blockReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Eye className="h-16 w-16 text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-400">
                  Cliquez sur une conversation pour voir les messages échangés
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Likes Section */}
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Heart className="h-5 w-5 text-[#ff007f]" />
            <span>Likes Reçus Récents</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receivedLikes.slice(0, 6).map((like) => (
              <div key={like.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">
                    {like.from.firstName}, {like.from.age}
                  </h3>
                  {like.mutualMatch && (
                    <CheckCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{like.from.city}</p>
                {like.message && (
                  <p className="text-sm text-gray-300 italic">&quot;{like.message}&quot;</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(like.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
