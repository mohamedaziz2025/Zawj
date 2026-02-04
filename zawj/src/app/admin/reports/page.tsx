'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react'
import { adminApi, Report } from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth'

export default function AdminReportsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  // Fetch reports from API
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports', filterStatus],
    queryFn: () => adminApi.getReports(filterStatus),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, resolution, actionTaken }: { 
      reportId: string
      resolution: string
      actionTaken: 'warning' | 'ban' | 'none'
    }) => adminApi.resolveReport(reportId, resolution, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedReport(null)
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (reportId: string) => adminApi.dismissReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedReport(null)
    },
  })

  const reports = reportsData?.reports || []

  const handleResolve = (reportId: string) => {
    const resolution = prompt('Résolution du rapport :')
    if (resolution) {
      const actionOptions = ['warning', 'ban', 'none']
      const action = prompt('Action (warning/ban/none) :', 'warning')
      if (action && actionOptions.includes(action)) {
        resolveMutation.mutate({
          reportId,
          resolution,
          actionTaken: action as 'warning' | 'ban' | 'none',
        })
      }
    }
  }

  const handleDismiss = (reportId: string) => {
    if (confirm('Voulez-vous rejeter ce rapport ?')) {
      dismissMutation.mutate(reportId)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      harassment: 'Harcèlement',
      fake_profile: 'Faux profil',
      spam: 'Spam',
      inappropriate_content: 'Contenu inapproprié',
      scam: 'Arnaque',
      other: 'Autre',
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Chargement des rapports...</p>
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
            Rapports & Signalements
          </h1>
          <p className="text-gray-600">Gérer les signalements et modérer la plateforme</p>
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
            onClick={() => setFilterStatus('investigating')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'investigating'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="inline mr-2 h-4 w-4" />
            En cours
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'resolved'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle className="inline mr-2 h-4 w-4" />
            Résolus
          </button>
          <button
            onClick={() => setFilterStatus('dismissed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === 'dismissed'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <XCircle className="inline mr-2 h-4 w-4" />
            Rejetés
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun rapport trouvé</p>
            </div>
          ) : (
            reports.map((report: Report) => (
              <div
                key={report._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {getTypeLabel(report.type)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${getSeverityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity === 'high'
                          ? 'Haute'
                          : report.severity === 'medium'
                          ? 'Moyenne'
                          : 'Basse'}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400 mb-3">
                      <span>
                        <strong>Rapporteur:</strong> {report.reporter?.name || 'Utilisateur'}
                      </span>
                      <span>
                        <strong>Signalé:</strong> {report.reportedUser?.name || 'Utilisateur'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{report.description}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ml-4 ${
                      report.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : report.status === 'investigating'
                        ? 'bg-blue-500/20 text-blue-400'
                        : report.status === 'resolved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {report.status === 'pending'
                      ? 'En attente'
                      : report.status === 'investigating'
                      ? 'En cours'
                      : report.status === 'resolved'
                      ? 'Résolu'
                      : 'Rejeté'}
                  </span>
                </div>

                {report.resolution && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                    <p className="text-green-400 text-sm">
                      <strong>Résolution:</strong> {report.resolution}
                    </p>
                    <p className="text-green-400 text-sm mt-1">
                      <strong>Action prise:</strong>{' '}
                      {report.actionTaken === 'warning'
                        ? 'Avertissement'
                        : report.actionTaken === 'ban'
                        ? 'Bannissement'
                        : 'Aucune'}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Créé le: {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {report.evidence && report.evidence.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {report.evidence.map((ev, index) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}${ev.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded"
                          >
                            <FileText className="h-3 w-3" />
                            Preuve {index + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve(report._id)}
                        disabled={resolveMutation.isPending}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {resolveMutation.isPending ? 'En cours...' : 'Résoudre'}
                      </button>
                      <button
                        onClick={() => handleDismiss(report._id)}
                        disabled={dismissMutation.isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {dismissMutation.isPending ? 'En cours...' : 'Rejeter'}
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
