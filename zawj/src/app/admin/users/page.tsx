'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, UserCheck, UserX, Trash2, Mail, MapPin, Calendar, Shield, ChevronLeft, Download, MoreVertical } from 'lucide-react'
import { adminApi, AdminUser } from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600 text-lg">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              <Download className="h-5 w-5" />
              Exporter
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
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
  onDelete
}: {
  user: AdminUser
  onBlock: (blocked: boolean) => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
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
                onClick={() => onBlock(!user.isActive)}
                className={`p-2.5 rounded-xl transition-all ${
                  user.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
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
