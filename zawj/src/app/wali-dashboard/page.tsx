'use client'

import { useEffect, useState } from 'react'
import { waliApi, WaliDashboard } from '@/lib/api/wali'
import { useRouter } from 'next/navigation'

export default function WaliDashboardPage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<WaliDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'likes' | 'matches'>(
    'overview'
  )
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [conversationMessages, setConversationMessages] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('wali_token')
      if (!token) {
        router.push('/wali-login')
        return
      }

      const data = await waliApi.getDashboard(token)
      setDashboard(data)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      router.push('/wali-login')
    } finally {
      setLoading(false)
    }
  }

  const handleViewConversation = async (conversation: any) => {
    try {
      const token = localStorage.getItem('wali_token')
      if (!token) return

      const messages = await waliApi.getConversationMessages(token, conversation.id)
      setSelectedConversation(conversation)
      setConversationMessages(messages)
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }

  const handleManageConversation = async (action: 'approve' | 'reject') => {
    if (!selectedConversation) return

    try {
      const token = localStorage.getItem('wali_token')
      if (!token) return

      await waliApi.manageConversation(token, selectedConversation.id, action)
      alert(action === 'approve' ? 'Conversation approuvée' : 'Conversation rejetée')
      setSelectedConversation(null)
      loadDashboard()
    } catch (error) {
      console.error('Erreur gestion conversation:', error)
      alert('Erreur lors de la gestion de la conversation')
    }
  }

  const handleManageLike = async (likeId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('wali_token')
      if (!token) return

      await waliApi.manageLike(token, likeId, action)
      alert(action === 'approve' ? 'Like approuvé' : 'Like rejeté')
      loadDashboard()
    } catch (error) {
      console.error('Erreur gestion like:', error)
      alert('Erreur lors de la gestion du like')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Wali - {dashboard.protectedUser.firstName}
              </h1>
              <p className="mt-1 text-gray-600">
                Gestion et supervision du profil de votre protégée
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('wali_token')
                router.push('/wali-login')
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-red-600">{dashboard.stats.totalConversations}</div>
            <div className="text-gray-600 mt-1">Conversations</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {dashboard.stats.totalLikesReceived}
            </div>
            <div className="text-gray-600 mt-1">Likes Reçus</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-green-600">{dashboard.stats.totalMatches}</div>
            <div className="text-gray-600 mt-1">Matchs</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{dashboard.stats.totalLikesSent}</div>
            <div className="text-gray-600 mt-1">Likes Envoyés</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-orange-600">
              {dashboard.stats.activeConversations}
            </div>
            <div className="text-gray-600 mt-1">Conv. Actives</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b px-6">
            <nav className="flex space-x-8">
              {(['overview', 'conversations', 'likes', 'matches'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview'
                    ? 'Vue d\'ensemble'
                    : tab === 'conversations'
                    ? 'Conversations'
                    : tab === 'likes'
                    ? 'Likes Reçus'
                    : 'Matchs'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Profil */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Profil de {dashboard.protectedUser.firstName}</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Âge:</span>{' '}
                        <span className="font-medium">{dashboard.protectedUser.age} ans</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Ville:</span>{' '}
                        <span className="font-medium">{dashboard.protectedUser.city}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Bio:</span>{' '}
                        <span className="font-medium">{dashboard.protectedUser.bio}</span>
                      </p>
                    </div>
                  </div>

                  {/* Infos religieuses */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informations Religieuses</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Madhab:</span>{' '}
                        <span className="font-medium">
                          {dashboard.protectedUser.religiousInfo?.madhab || 'Non spécifié'}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Prière:</span>{' '}
                        <span className="font-medium">
                          {dashboard.protectedUser.religiousInfo?.prayerFrequency || 'Non spécifié'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversations Tab */}
            {activeTab === 'conversations' && (
              <div className="space-y-4">
                {dashboard.conversations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune conversation</p>
                ) : (
                  dashboard.conversations.map((conv: any) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                          {conv.otherUser?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">{conv.lastMessage}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conv.isApprovedByWali ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            Approuvée
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                            En attente
                          </span>
                        )}
                        <button
                          onClick={() => handleViewConversation(conv)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Likes Tab */}
            {activeTab === 'likes' && (
              <div className="space-y-4">
                {dashboard.receivedLikes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun like reçu</p>
                ) : (
                  dashboard.receivedLikes.map((like: any) => (
                    <div
                      key={like.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                          {like.from?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {like.from?.firstName} {like.from?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {like.from?.age} ans - {like.from?.city}
                          </p>
                          {like.message && (
                            <p className="text-sm text-gray-500 mt-1 italic">&quot;{like.message}&quot;</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleManageLike(like.id, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleManageLike(like.id, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Rejeter
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <div className="space-y-4">
                {dashboard.mutualMatches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun match</p>
                ) : (
                  dashboard.mutualMatches.map((match: any) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-800">
                          {match.from?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {match.from?.firstName} {match.from?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {match.from?.age} ans - {match.from?.city}
                          </p>
                          <p className="text-sm text-green-600 font-medium mt-1">✓ Match mutuel</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Conversation avec {selectedConversation.otherUser?.firstName}
              </h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {conversationMessages.map((msg: any) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId._id === dashboard.protectedUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId._id === dashboard.protectedUser.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!selectedConversation.isApprovedByWali && (
              <div className="p-6 border-t flex space-x-4">
                <button
                  onClick={() => handleManageConversation('approve')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Approuver cette conversation
                </button>
                <button
                  onClick={() => handleManageConversation('reject')}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Rejeter et supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
