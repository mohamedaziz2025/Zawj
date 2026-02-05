'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Check, X, Clock, UserCheck, Trash2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { tuteurApi } from '@/lib/api/tuteur'
import Link from 'next/link'

interface Tuteur {
  _id: string
  name: string
  email: string
  phone?: string
  relationship: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'family' | 'paid' | 'platform-assigned'
  isPaid: boolean
  assignedByAdmin: boolean
  moderatorId?: {
    firstName: string
    lastName: string
    email: string
  }
  hasAccessToDashboard: boolean
  notifyOnNewMessage: boolean
  createdAt: string
  rejectionReason?: string
}

export default function MesTuteursPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newTuteur, setNewTuteur] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'father' as string,
    type: 'family' as string,
    hasAccessToDashboard: false,
    notifyOnNewMessage: true
  })

  useEffect(() => {
    if (!user || user.gender !== 'female') {
      router.push('/')
      return
    }
    fetchTuteurs()
  }, [user, router])

  const fetchTuteurs = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await tuteurApi.getMyTuteurs(token)
      setTuteurs(data.tuteurs || [])
    } catch (error) {
      console.error('Error fetching tuteurs:', error)
      setError('Erreur lors du chargement des tuteurs')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTuteur = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous devez être connecté')
        return
      }

      console.log('Envoi de la demande avec:', newTuteur)
      const response = await tuteurApi.requestTuteur(token, newTuteur)
      
      setShowAddModal(false)
      setNewTuteur({
        name: '',
        email: '',
        phone: '',
        relationship: 'father',
        type: 'family',
        hasAccessToDashboard: false,
        notifyOnNewMessage: true
      })
      
      setSuccess(response.message || 'Demande de tuteur envoyée avec succès')
      fetchTuteurs()
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Erreur complète:', error)
      console.error('Response data:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de la demande'
      setError(errorMessage)
    }
  }

  const relationshipLabels: { [key: string]: string } = {
    'father': 'Père',
    'brother': 'Frère',
    'uncle': 'Oncle',
    'grandfather': 'Grand-père',
    'imam': 'Imam',
    'trusted-community-member': 'Membre de confiance',
    'platform-moderator': 'Tuteur de Société'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-red-100 text-red-700 border-red-200',
    rejected: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const statusIcons = {
    pending: Clock,
    approved: Check,
    rejected: X
  }

  const statusLabels = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black/5 via-white to-black/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-black">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black/5 via-white to-black/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-black hover:text-red-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux paramètres
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Tuteurs (Wali)</h1>
              <p className="text-black">Gérez vos tuteurs et leurs accès</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Ajouter un Tuteur
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">À propos des tuteurs</p>
                <p>
                  Selon les principes islamiques, une femme musulmane doit avoir un tuteur (Wali) pour superviser 
                  sa recherche matrimoniale. Vous pouvez ajouter plusieurs tuteurs qui recevront des notifications 
                  et pourront (selon vos paramètres) accéder à vos conversations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tuteurs List */}
        <div className="space-y-4">
          {tuteurs.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun tuteur enregistré</h3>
              <p className="text-black mb-6">
                Commencez par ajouter votre tuteur familial ou demandez un service de tuteur payant
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
              >
                <Plus className="h-5 w-5" />
                Ajouter mon premier tuteur
              </button>
            </div>
          ) : (
            tuteurs.map((tuteur) => {
              const StatusIcon = statusIcons[tuteur.status]
              
              return (
                <div key={tuteur._id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {tuteur.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{tuteur.name}</h3>
                          {tuteur.moderatorId && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              Tuteur de Société
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-black mb-2">{tuteur.email}</p>
                        {tuteur.phone && (
                          <p className="text-sm text-black mb-2">{tuteur.phone}</p>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-black rounded-full">
                            {relationshipLabels[tuteur.relationship]}
                          </span>
                          
                          {tuteur.type === 'platform-assigned' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              Assigné par la plateforme
                            </span>
                          )}
                          
                          {tuteur.isPaid && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              Service payant
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${statusColors[tuteur.status]}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{statusLabels[tuteur.status]}</span>
                    </div>
                  </div>

                  {tuteur.status === 'rejected' && tuteur.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-900">
                        <strong>Raison du rejet:</strong> {tuteur.rejectionReason}
                      </p>
                    </div>
                  )}

                  {tuteur.moderatorId && tuteur.moderatorId.firstName && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-purple-900">
                        <strong>Modérateur:</strong> {tuteur.moderatorId.firstName} {tuteur.moderatorId.lastName}
                      </p>
                    </div>
                  )}

                  {/* Permissions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      {tuteur.hasAccessToDashboard ? (
                        <Check className="h-5 w-5 text-red-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={tuteur.hasAccessToDashboard ? 'text-black font-medium' : 'text-gray-500'}>
                        Accès au dashboard
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {tuteur.notifyOnNewMessage ? (
                        <Check className="h-5 w-5 text-red-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={tuteur.notifyOnNewMessage ? 'text-black font-medium' : 'text-gray-500'}>
                        Notifications email
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    Ajouté le {new Date(tuteur.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Tuteur Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un Tuteur</h3>
            
            <form onSubmit={handleAddTuteur} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={newTuteur.name}
                  onChange={(e) => setNewTuteur({ ...newTuteur, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Email *</label>
                <input
                  type="email"
                  value={newTuteur.email}
                  onChange={(e) => setNewTuteur({ ...newTuteur, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newTuteur.phone}
                  onChange={(e) => setNewTuteur({ ...newTuteur, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Relation *</label>
                <select
                  value={newTuteur.relationship}
                  onChange={(e) => setNewTuteur({ ...newTuteur, relationship: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                >
                  <option value="father">Père</option>
                  <option value="brother">Frère</option>
                  <option value="uncle">Oncle</option>
                  <option value="grandfather">Grand-père</option>
                  <option value="imam">Imam</option>
                  <option value="trusted-community-member">Membre de confiance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Type *</label>
                <select
                  value={newTuteur.type}
                  onChange={(e) => setNewTuteur({ ...newTuteur, type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                >
                  <option value="family">Tuteur familial (Gratuit)</option>
                  <option value="paid">Service payant</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTuteur.hasAccessToDashboard}
                    onChange={(e) => setNewTuteur({ ...newTuteur, hasAccessToDashboard: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                  <span className="text-sm text-black">Accès au dashboard (peut voir mes conversations)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTuteur.notifyOnNewMessage}
                    onChange={(e) => setNewTuteur({ ...newTuteur, notifyOnNewMessage: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                  <span className="text-sm text-black">Notifications email pour chaque message</span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Votre demande sera envoyée à l'administrateur pour approbation. 
                  Vous recevrez une notification une fois approuvée.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
