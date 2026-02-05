'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, UserCheck, UserX, Plus, Edit, Trash2, Search, Filter, Check, X, Users } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

interface Tuteur {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    gender: string
  }
  name: string
  email: string
  phone?: string
  relationship: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'family' | 'paid' | 'platform-assigned'
  isPaid: boolean
  assignedByAdmin: boolean
  moderatorId?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  hasAccessToDashboard: boolean
  notifyOnNewMessage: boolean
  createdAt: string
  approvedAt?: string
  rejectedAt?: string
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  gender: string
  role: string
}

export default function TuteursAdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [moderators, setModerators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModeratorModal, setShowAssignModeratorModal] = useState(false)
  const [selectedTuteur, setSelectedTuteur] = useState<Tuteur | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedModeratorId, setSelectedModeratorId] = useState('')

  // New tuteur form
  const [newTuteur, setNewTuteur] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    relationship: 'father' as string,
    type: 'platform-assigned' as string,
    isPaid: false,
    hasAccessToDashboard: true,
    notifyOnNewMessage: true
  })

  // Edit tuteur form
  const [editTuteur, setEditTuteur] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'father' as string,
    hasAccessToDashboard: false,
    notifyOnNewMessage: true
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin-login')
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch tuteurs
      const tuteursRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const tuteursData = await tuteursRes.json()
      
      // Fetch all users (women)
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      const femaleUsers = usersData.users.filter((u: User) => u.gender === 'female')
      
      // Fetch moderators
      const moderatorsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/moderators`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const moderatorsData = await moderatorsRes.json()
      
      // Extract users from moderators (moderators have userId populated)
      const moderatorUsers = Array.isArray(moderatorsData) 
        ? moderatorsData.map((m: any) => m.userId).filter((u: any) => u != null)
        : []
      
      setTuteurs(tuteursData.tuteurs || [])
      setUsers(femaleUsers)
      setModerators(moderatorUsers)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de l\'approbation')
      }

      const result = await response.json()
      console.log('Tuteur approuvé:', result)
      
      await fetchData()
    } catch (error: any) {
      console.error('Error approving tuteur:', error)
      alert(`Erreur lors de l'approbation: ${error.message}`)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du rejet')
      }

      const result = await response.json()
      console.log('Tuteur rejeté:', result)
      
      await fetchData()
    } catch (error: any) {
      console.error('Error rejecting tuteur:', error)
      alert(`Erreur lors du rejet: ${error.message}`)
    }
  }

  const handleCreateTuteur = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTuteur)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la création')
      }

      const result = await response.json()
      console.log('Tuteur créé:', result)
      
      setShowCreateModal(false)
      setNewTuteur({
        userId: '',
        name: '',
        email: '',
        phone: '',
        relationship: 'father',
        type: 'platform-assigned',
        isPaid: false,
        hasAccessToDashboard: true,
        notifyOnNewMessage: true
      })
      await fetchData()
    } catch (error: any) {
      console.error('Error creating tuteur:', error)
      alert(`Erreur lors de la création: ${error.message}`)
    }
  }

  const handleAssignModerator = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs/assign-moderator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          moderatorId: selectedModeratorId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de l\'assignation')
      }

      const result = await response.json()
      console.log('Modérateur assigné:', result)
      
      setShowAssignModeratorModal(false)
      setSelectedUserId('')
      setSelectedModeratorId('')
      await fetchData()
    } catch (error: any) {
      console.error('Error assigning moderator:', error)
      alert(`Erreur lors de l'assignation: ${error.message}`)
    }
  }

  const handleEditClick = (tuteur: Tuteur) => {
    setSelectedTuteur(tuteur)
    setEditTuteur({
      name: tuteur.name,
      email: tuteur.email,
      phone: tuteur.phone || '',
      relationship: tuteur.relationship,
      hasAccessToDashboard: tuteur.hasAccessToDashboard,
      notifyOnNewMessage: tuteur.notifyOnNewMessage
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTuteur) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs/${selectedTuteur._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editTuteur)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      const result = await response.json()
      console.log('Tuteur mis à jour:', result)
      
      setShowEditModal(false)
      setSelectedTuteur(null)
      await fetchData()
    } catch (error: any) {
      console.error('Error updating tuteur:', error)
      alert(`Erreur lors de la mise à jour: ${error.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tuteur ?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuteurs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la suppression')
      }

      const result = await response.json()
      console.log('Tuteur supprimé:', result)
      
      await fetchData()
    } catch (error: any) {
      console.error('Error deleting tuteur:', error)
      alert(`Erreur lors de la suppression: ${error.message}`)
    }
  }

  const filteredTuteurs = tuteurs
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.userId?.firstName && t.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.userId?.lastName && t.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const relationshipLabels: { [key: string]: string } = {
    'father': 'Père',
    'brother': 'Frère',
    'uncle': 'Oncle',
    'grandfather': 'Grand-père',
    'imam': 'Imam',
    'trusted-community-member': 'Membre de confiance',
    'platform-moderator': 'Tuteur de Société'
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Tuteurs</h1>
              <p className="text-black">Gérer les tuteurs des utilisatrices</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowAssignModeratorModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                <Users className="h-5 w-5" />
                Assigner un Modérateur
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Créer un Tuteur
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="text-sm text-black mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{tuteurs.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-yellow-200">
              <div className="text-sm text-black mb-1">En Attente</div>
              <div className="text-2xl font-bold text-yellow-600">{tuteurs.filter(t => t.status === 'pending').length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-red-200">
              <div className="text-sm text-black mb-1">Approuvés</div>
              <div className="text-2xl font-bold text-red-600">{tuteurs.filter(t => t.status === 'approved').length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
              <div className="text-sm text-black mb-1">Rejetés</div>
              <div className="text-2xl font-bold text-gray-600">{tuteurs.filter(t => t.status === 'rejected').length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Rejetés'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tuteurs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Utilisatrice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tuteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Relation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Accès Dashboard</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTuteurs.map((tuteur) => (
                  <tr key={tuteur._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tuteur.userId.firstName} {tuteur.userId.lastName}
                      </div>
                      <div className="text-sm text-black">{tuteur.userId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tuteur.name}</div>
                      <div className="text-sm text-black">{tuteur.email}</div>
                      {tuteur.moderatorId && tuteur.moderatorId.firstName && (
                        <div className="text-xs text-purple-600 font-medium mt-1">
                          Modérateur: {tuteur.moderatorId.firstName} {tuteur.moderatorId.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-black">{relationshipLabels[tuteur.relationship]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tuteur.type === 'platform-assigned' 
                          ? 'bg-purple-100 text-purple-700'
                          : tuteur.type === 'paid'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-black'
                      }`}>
                        {tuteur.type === 'platform-assigned' ? 'Assigné' : tuteur.type === 'paid' ? 'Payant' : 'Familial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tuteur.status === 'approved'
                          ? 'bg-red-100 text-red-700'
                          : tuteur.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tuteur.status === 'approved' ? 'Approuvé' : tuteur.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tuteur.hasAccessToDashboard ? (
                        <Check className="h-5 w-5 text-red-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {tuteur.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(tuteur._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Approuver"
                            >
                              <UserCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Raison du rejet:')
                                if (reason) handleReject(tuteur._id, reason)
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Rejeter"
                            >
                              <UserX className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditClick(tuteur)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tuteur._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Tuteur Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer un Tuteur</h3>
            <form onSubmit={handleCreateTuteur} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Utilisatrice *</label>
                <select
                  value={newTuteur.userId}
                  onChange={(e) => setNewTuteur({ ...newTuteur, userId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                >
                  <option value="">Sélectionnez...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nom *</label>
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

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newTuteur.hasAccessToDashboard}
                  onChange={(e) => setNewTuteur({ ...newTuteur, hasAccessToDashboard: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-black">Accès au dashboard</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newTuteur.notifyOnNewMessage}
                  onChange={(e) => setNewTuteur({ ...newTuteur, notifyOnNewMessage: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-black">Notifications email</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tuteur Modal */}
      {showEditModal && selectedTuteur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Modifier le Tuteur</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={editTuteur.name}
                  onChange={(e) => setEditTuteur({ ...editTuteur, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  placeholder="Ahmed Ben Ali"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Email *</label>
                <input
                  type="email"
                  value={editTuteur.email}
                  onChange={(e) => setEditTuteur({ ...editTuteur, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  placeholder="ahmed@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editTuteur.phone}
                  onChange={(e) => setEditTuteur({ ...editTuteur, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  placeholder="+33612345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Relation *</label>
                <select
                  value={editTuteur.relationship}
                  onChange={(e) => setEditTuteur({ ...editTuteur, relationship: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                >
                  <option value="father">Père</option>
                  <option value="brother">Frère</option>
                  <option value="uncle">Oncle</option>
                  <option value="grandfather">Grand-père</option>
                  <option value="imam">Imam</option>
                  <option value="trusted-community-member">Membre de confiance</option>
                  <option value="platform-moderator">Tuteur de Société</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editTuteur.hasAccessToDashboard}
                  onChange={(e) => setEditTuteur({ ...editTuteur, hasAccessToDashboard: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-black">Accès au dashboard</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editTuteur.notifyOnNewMessage}
                  onChange={(e) => setEditTuteur({ ...editTuteur, notifyOnNewMessage: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-black">Notifications email</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedTuteur(null)
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Moderator Modal */}
      {showAssignModeratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Assigner un Modérateur comme Tuteur</h3>
            <form onSubmit={handleAssignModerator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Utilisatrice *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black"
                >
                  <option value="">Sélectionnez...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Modérateur *</label>
                <select
                  value={selectedModeratorId}
                  onChange={(e) => setSelectedModeratorId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black"
                >
                  <option value="">Sélectionnez...</option>
                  {moderators.filter(m => m && m._id).map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-black">
                  Le modérateur sélectionné sera assigné comme <strong>Tuteur de Société</strong> pour cette utilisatrice. 
                  Il aura accès à son dashboard et recevra des notifications.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModeratorModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                >
                  Assigner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
