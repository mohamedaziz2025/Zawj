'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, UserCheck, UserX, Trash2, Mail, MapPin, Calendar, Shield, ChevronLeft, Download, MoreVertical, Edit, Eye, X } from 'lucide-react'
import { adminApi, AdminUser } from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  // Fetch users from API
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 100 }),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  const blockUserMutation = useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      adminApi.blockUser(userId, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const users = usersData?.users || []

  const filteredUsers = users.filter((user: AdminUser) => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified)

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/admin/create-user"
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
              >
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                Créer Utilisateur
              </Link>
              <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm sm:text-base">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <FilterButton
                active={filterStatus === 'all'}
                onClick={() => setFilterStatus('all')}
                icon={Filter}
              >
                Tous
              </FilterButton>
              <FilterButton
                active={filterStatus === 'active'}
                onClick={() => setFilterStatus('active')}
              >
                Actifs
              </FilterButton>
              <FilterButton
                active={filterStatus === 'inactive'}
                onClick={() => setFilterStatus('inactive')}
              >
                Inactifs
              </FilterButton>
              <FilterButton
                active={filterStatus === 'verified'}
                onClick={() => setFilterStatus('verified')}
              >
                Vérifiés
              </FilterButton>
              <FilterButton
                active={filterStatus === 'unverified'}
                onClick={() => setFilterStatus('unverified')}
              >
                Non vérifiés
              </FilterButton>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user: AdminUser) => (
            <UserCard
              key={user.id}
              user={user}
              onView={() => {
                setSelectedUser(user)
                setShowDetailsModal(true)
              }}
              onEdit={() => {
                setSelectedUser(user)
                setShowEditModal(true)
              }}
              onBlock={(blocked) =>
                blockUserMutation.mutate({
                  userId: user.id,
                  blocked,
                })
              }
              onDelete={() => {
                if (
                  confirm(
                    'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'
                  )
                ) {
                  deleteUserMutation.mutate(user.id)
                }
              }}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.firstName?.[0] || '?'}
                  {selectedUser.lastName?.[0] || ''}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Rôle</p>
                  <p className="font-semibold text-gray-900">{selectedUser.role}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Genre</p>
                  <p className="font-semibold text-gray-900">{selectedUser.gender === 'male' ? 'Homme' : 'Femme'}</p>
                </div>
                {selectedUser.age && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Âge</p>
                    <p className="font-semibold text-gray-900">{selectedUser.age} ans</p>
                  </div>
                )}
                {selectedUser.city && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Ville</p>
                    <p className="font-semibold text-gray-900">{selectedUser.city}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <p className="font-semibold text-gray-900">{selectedUser.isActive ? 'Actif' : 'Bloqué'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Vérifié</p>
                  <p className="font-semibold text-gray-900">{selectedUser.isVerified ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Date d'inscription</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedUser.lastLogin && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Dernière connexion</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  defaultValue={selectedUser.firstName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue={selectedUser.lastName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="seeker">Seeker</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={selectedUser.isActive}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={selectedUser.isVerified}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Vérifié</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // TODO: Add update user API call
                    alert('Fonctionnalité de mise à jour à implémenter')
                    setShowEditModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  icon: Icon,
  children
}: {
  active: boolean
  onClick: () => void
  icon?: any
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {Icon && <Icon className="inline mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

function UserCard({
  user,
  onBlock,
  onDelete,
  onEdit,
  onView
}: {
  user: AdminUser
  onBlock: (blocked: boolean) => void
  onDelete: () => void
  onEdit: () => void
  onView: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user.firstName?.[0] || '?'}
            {user.lastName?.[0] || ''}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user.firstName || 'N/A'} {user.lastName || ''}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                {user.age && (
                  <span className="text-sm text-gray-600">
                    {user.age} ans
                  </span>
                )}
                {user.city && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {user.city}
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onView}
                className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                title="Voir détails"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={onEdit}
                className="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                title="Modifier"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onBlock(!user.isActive)}
                className={`p-2.5 rounded-xl transition-all ${
                  user.isActive
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
                title={user.isActive ? 'Bloquer' : 'Débloquer'}
              >
                {user.isActive ? (
                  <UserX className="h-5 w-5" />
                ) : (
                  <UserCheck className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onDelete}
                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                title="Supprimer"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                user.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {user.isActive ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Actif
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Bloqué
                </>
              )}
            </span>
            
            {user.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700">
                <Shield className="h-3 w-3" />
                Vérifié
              </span>
            )}
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 text-purple-700">
              {user.role}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {user.lastLogin && (
              <span className="text-sm text-gray-500">
                Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
