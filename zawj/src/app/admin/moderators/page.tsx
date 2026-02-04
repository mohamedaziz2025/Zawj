'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Shield, UserPlus, Edit2, Trash2, Users, 
  CheckCircle, XCircle, Eye, UserCheck 
} from 'lucide-react'

interface Moderator {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  isActive: boolean
  assignedUsers: any[]
  canAccessAllMessages: boolean
  permissions: {
    canApprovePaidTutor: boolean
    canViewMessages: boolean
    canBlockUsers: boolean
  }
  statistics: {
    totalAssigned: number
    totalApprovals: number
    totalRejections: number
  }
  createdAt: string
}

export default function ModeratorsPage() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch moderators
  const { data: moderators = [], isLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/moderators', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch moderators')
      return res.json()
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/moderators/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (!res.ok) throw new Error('Failed to delete moderator')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] })
    },
  })

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`http://localhost:5000/api/moderators/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) throw new Error('Failed to update moderator')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Modérateurs</h1>
              <p className="text-gray-600">Gérez les modérateurs qui supervisent les utilisatrices</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              Ajouter un Modérateur
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-pink-600" />
              <span className="text-2xl font-bold text-gray-900">{moderators.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Modérateurs</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {moderators.filter((m: Moderator) => m.isActive).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Actifs</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {moderators.reduce((sum: number, m: Moderator) => sum + m.statistics.totalAssigned, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Utilisatrices Assignées</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {moderators.reduce((sum: number, m: Moderator) => sum + m.statistics.totalApprovals, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Approbations Totales</p>
          </div>
        </div>

        {/* Moderators List */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Liste des Modérateurs</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {moderators.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun modérateur pour le moment</p>
              </div>
            ) : (
              moderators.map((moderator: Moderator) => (
                <div key={moderator._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {moderator.userId.firstName[0]}{moderator.userId.lastName[0]}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {moderator.userId.firstName} {moderator.userId.lastName}
                          </h3>
                          {moderator.isActive ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Actif
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              Inactif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{moderator.userId.email}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            <Users className="inline h-4 w-4 mr-1" />
                            {moderator.statistics.totalAssigned} assignées
                          </span>
                          <span className="text-gray-600">
                            <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
                            {moderator.statistics.totalApprovals} approbations
                          </span>
                          <span className="text-gray-600">
                            <XCircle className="inline h-4 w-4 mr-1 text-red-600" />
                            {moderator.statistics.totalRejections} rejets
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: moderator._id, isActive: moderator.isActive })}
                        className={`p-2 rounded-lg transition-colors ${
                          moderator.isActive
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={moderator.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {moderator.isActive ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedModerator(moderator)
                          setShowEditModal(true)
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce modérateur ?')) {
                            deleteMutation.mutate(moderator._id)
                          }
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
