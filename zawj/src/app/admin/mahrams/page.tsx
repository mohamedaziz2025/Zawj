'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, FileText, Download } from 'lucide-react'
import { adminApi, Tuteur } from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth'

export default function AdminTuteursPage() {
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  // Fetch Tuteurs from API
  const { data: TuteursData, isLoading } = useQuery({
    queryKey: ['admin-Tuteurs', filterStatus],
    queryFn: () => adminApi.getTuteurs(filterStatus),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  const approveMutation = useMutation({
    mutationFn: (mahramId: string) => adminApi.approveMahram(mahramId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-Tuteurs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ mahramId, reason }: { mahramId: string; reason: string }) =>
      adminApi.rejectMahram(mahramId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-Tuteurs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const Tuteurs = TuteursData?.Tuteurs || []

  const handleApprove = (mahramId: string) => {
    if (confirm('Voulez-vous approuver cette demande de Tuteur ?')) {
      approveMutation.mutate(mahramId)
    }
  }

  const handleReject = (mahramId: string) => {
    const reason = prompt('Raison du rejet :')
    if (reason) {
      rejectMutation.mutate({ mahramId, reason })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Chargement des Tuteurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gestion des Tuteurs
          </h1>
          <p className="text-gray-600">Vérification et approbation des demandes de Tuteur</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filterStatus === 'pending'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Clock className="inline mr-2 h-4 w-4" />
            En attente
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filterStatus === 'approved'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <CheckCircle className="inline mr-2 h-4 w-4" />
            Approuvés
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filterStatus === 'rejected'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <XCircle className="inline mr-2 h-4 w-4" />
            Rejetés
          </button>
        </div>

        {/* Tuteurs List */}
        <div className="space-y-4">
          {Tuteurs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-600">Il n'y a pas de demandes de Tuteur {filterStatus !== 'all' ? `en statut "${filterStatus}"` : ''}</p>
            </div>
          ) : (
            Tuteurs.map((Tuteur: Tuteur) => (
              <div
                key={Tuteur._id}
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {Tuteur.user?.name || 'Utilisateur'}
                      </h3>
                      <span className="text-gray-400">→</span>
                      <h3 className="text-xl font-semibold text-white">
                        {Tuteur.Tuteur.name}
                      </h3>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <span>{Tuteur.Tuteur.email}</span>
                      <span>{Tuteur.Tuteur.phone}</span>
                      <span className="capitalize">{Tuteur.Tuteur.relationship}</span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      Tuteur.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : Tuteur.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {Tuteur.status === 'pending'
                      ? 'En attente'
                      : Tuteur.status === 'approved'
                      ? 'Approuvé'
                      : 'Rejeté'}
                  </span>
                </div>

                {Tuteur.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">
                      <strong>Raison du rejet:</strong> {Tuteur.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Demande le: {new Date(Tuteur.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {Tuteur.verifiedAt && (
                      <p className="text-sm text-green-400">
                        Vérifié le: {new Date(Tuteur.verifiedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {Tuteur.documents && Tuteur.documents.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {Tuteur.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded"
                          >
                            <FileText className="h-3 w-3" />
                            {doc.type}
                            <Download className="h-3 w-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {Tuteur.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(Tuteur._id)}
                        disabled={approveMutation.isPending}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {approveMutation.isPending ? 'En cours...' : 'Approuver'}
                      </button>
                      <button
                        onClick={() => handleReject(Tuteur._id)}
                        disabled={rejectMutation.isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {rejectMutation.isPending ? 'En cours...' : 'Rejeter'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
