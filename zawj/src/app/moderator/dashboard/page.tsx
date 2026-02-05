'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { moderatorApi, ModeratorProfile } from '@/lib/api/moderator'
import { 
  Users, MessageCircle, CheckCircle, XCircle, 
  Shield, TrendingUp, Eye
} from 'lucide-react'

export default function ModeratorDashboard() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Fetch moderator profile
  const { data: profile, isLoading } = useQuery<ModeratorProfile>({
    queryKey: ['moderator-profile'],
    queryFn: moderatorApi.getProfile
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 text-center max-w-md">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profil modérateur non trouvé</h2>
          <p className="text-gray-600">Veuillez contacter l'administrateur.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Modérateur</h1>
          <p className="text-gray-600">
            Bienvenue, {profile.userId.firstName} {profile.userId.lastName}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{profile.statistics.totalAssigned}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Utilisatrices Assignées</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">{profile.statistics.totalApprovals}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Approbations</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-8 w-8 text-gray-600" />
              <span className="text-3xl font-bold text-gray-900">{profile.statistics.totalRejections}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Rejets</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {profile.statistics.totalApprovals > 0 
                  ? Math.round((profile.statistics.totalApprovals / (profile.statistics.totalApprovals + profile.statistics.totalRejections)) * 100)
                  : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Taux d'Approbation</p>
          </div>
        </div>

        {/* Special Section for Tuteur Role */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rôle de Tuteur de Société</h2>
              <p className="text-sm text-black">Vous êtes assigné comme tuteur pour certaines utilisatrices</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-black mb-3">
              En tant que <strong>Tuteur de Société</strong>, vous avez des responsabilités spéciales :
            </p>
            <ul className="space-y-2 text-sm text-black">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Surveiller et approuver les conversations des utilisatrices assignées</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Recevoir des notifications pour chaque nouveau message</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Conseiller les utilisatrices dans leur démarche matrimoniale</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Garantir le respect des principes islamiques dans les échanges</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border-2 ${profile.permissions.canViewMessages ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                {profile.permissions.canViewMessages ? (
                  <CheckCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
                <span className="font-semibold text-gray-900">Voir les Messages</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border-2 ${profile.permissions.canApprovePaidTutor ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                {profile.permissions.canApprovePaidTutor ? (
                  <CheckCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
                <span className="font-semibold text-gray-900">Approuver Tuteur Payant</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border-2 ${profile.permissions.canBlockUsers ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                {profile.permissions.canBlockUsers ? (
                  <CheckCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
                <span className="font-semibold text-gray-900">Bloquer Utilisateurs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Users */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Mes Utilisatrices Assignées</h2>
            <p className="text-sm text-gray-600 mt-1">
              {profile.assignedUsers.length} utilisatrice{profile.assignedUsers.length > 1 ? 's' : ''} sous votre supervision
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {profile.assignedUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune utilisatrice assignée pour le moment</p>
              </div>
            ) : (
              profile.assignedUsers.map((user) => (
                <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {user.age && <span>{user.age} ans</span>}
                          {user.city && <span>• {user.city}</span>}
                          {user.profession && <span>• {user.profession}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUser(user._id)}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      Voir Messages
                    </button>
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
