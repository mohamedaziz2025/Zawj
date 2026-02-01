'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, FileText, Download } from 'lucide-react'
import { adminApi, Mahram } from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth'

export default function AdminMahramsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  // Fetch mahrams from API
  const { data: mahramsData, isLoading } = useQuery({
    queryKey: ['admin-mahrams', filterStatus],
    queryFn: () => adminApi.getMahrams(filterStatus),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  const approveMutation = useMutation({
    mutationFn: (mahramId: string) => adminApi.approveMahram(mahramId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mahrams'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ mahramId, reason }: { mahramId: string; reason: string }) =>
      adminApi.rejectMahram(mahramId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mahrams'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const mahrams = mahramsData?.mahrams || []

  const handleApprove = (mahramId: string) => {
    if (confirm('Voulez-vous approuver cette demande de mahram ?')) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Chargement des mahrams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Gestion des Mahrams
          </h1>
          <p className="text-gray-400">Vérification et approbation des demandes de mahram</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'pending'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="inline mr-2 h-4 w-4" />
            En attente
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'approved'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle className="inline mr-2 h-4 w-4" />
            Approuvés
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'rejected'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <XCircle className="inline mr-2 h-4 w-4" />
            Rejetés
          </button>
        </div>

        {/* Mahrams List */}
        <div className="space-y-4">
          {mahrams.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
              <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucune demande de mahram</p>
            </div>
          ) : (
            mahrams.map((mahram: Mahram) => (
              <div
                key={mahram._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {mahram.user?.name || 'Utilisateur'}
                      </h3>
                      <span className="text-gray-400">→</span>
                      <h3 className="text-xl font-semibold text-white">
                        {mahram.mahram.name}
                      </h3>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <span>{mahram.mahram.email}</span>
                      <span>{mahram.mahram.phone}</span>
                      <span className="capitalize">{mahram.mahram.relationship}</span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      mahram.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : mahram.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {mahram.status === 'pending'
                      ? 'En attente'
                      : mahram.status === 'approved'
                      ? 'Approuvé'
                      : 'Rejeté'}
                  </span>
                </div>

                {mahram.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">
                      <strong>Raison du rejet:</strong> {mahram.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Demande le: {new Date(mahram.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {mahram.verifiedAt && (
                      <p className="text-sm text-green-400">
                        Vérifié le: {new Date(mahram.verifiedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {mahram.documents && mahram.documents.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {mahram.documents.map((doc, index) => (
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
                  {mahram.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(mahram._id)}
                        disabled={approveMutation.isPending}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {approveMutation.isPending ? 'En cours...' : 'Approuver'}
                      </button>
                      <button
                        onClick={() => handleReject(mahram._id)}
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
