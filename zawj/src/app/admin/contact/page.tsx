'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { contactApi, ContactMessage } from '@/lib/api/contact'
import { Mail, MessageSquare, Archive, Trash2, Eye, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminContactPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [response, setResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'archived'>('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin-login')
      return
    }
    loadMessages()
  }, [isAuthenticated, user, filter])

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await contactApi.getAll(token, filter === 'all' ? undefined : filter)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedMessage || !response.trim()) return

    setIsSending(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await contactApi.respond(token, selectedMessage._id, response)
      alert('Réponse envoyée avec succès!')
      setResponse('')
      setSelectedMessage(null)
      loadMessages()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setIsSending(false)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await contactApi.archive(token, id)
      loadMessages()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await contactApi.delete(token, id)
      loadMessages()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      responded: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    const labels = {
      pending: 'En attente',
      responded: 'Répondu',
      archived: 'Archivé',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff007f]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Messages de <span className="text-[#ff007f]">Contact</span>
        </h1>
        <p className="text-gray-400">Gérer les messages des utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex gap-4">
          {['all', 'pending', 'responded', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[#ff007f] text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'responded' ? 'Répondus' : 'Archivés'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="glass-card overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun message</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {messages.map((message) => (
              <div key={message._id} className="p-6 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{message.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="p-2 hover:bg-[#ff007f]/10 rounded-lg transition-colors"
                      title="Voir et répondre"
                    >
                      <Eye className="h-5 w-5 text-[#ff007f]" />
                    </button>
                    {message.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(message._id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Archiver"
                      >
                        <Archive className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#ff007f]">Sujet: {message.subject}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{message.message}</p>
                </div>
                {message.response && (
                  <div className="mt-4 p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400 mb-2">✓ Réponse envoyée</p>
                    <p className="text-sm text-gray-300">{message.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#1a1a1a] p-4 -m-4 mb-4">
              <h2 className="text-xl font-bold text-white">Message de {selectedMessage.name}</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">De:</p>
                <p className="text-white">{selectedMessage.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Sujet:</p>
                <p className="text-white">{selectedMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Message:</p>
                <div className="bg-[#0a0a0a] p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.status !== 'responded' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Votre réponse:</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all resize-none"
                    placeholder="Écrivez votre réponse ici..."
                  />
                  <button
                    onClick={handleRespond}
                    disabled={isSending || !response.trim()}
                    className="mt-4 w-full btn-pink px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Envoyer la réponse
                      </>
                    )}
                  </button>
                </div>
              )}

              {selectedMessage.response && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Réponse envoyée:</p>
                  <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.response}</p>
                    {selectedMessage.respondedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Envoyée le {new Date(selectedMessage.respondedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
