'use client'

import { useEffect, useState } from 'react'
import { moderationApi, ModeratorDashboard } from '@/lib/api/moderation'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'

export default function ModerationPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [token, setToken] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<ModeratorDashboard | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'messages' | 'stats'>(
    'dashboard'
  )
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
    
    if (!user || !['admin', 'moderator'].includes(user.role || '')) {
      router.push('/admin-login')
      return
    }
    if (storedToken) {
      loadDashboard(storedToken)
      loadReports(storedToken)
    }
  }, [user, router])

  const loadDashboard = async (authToken: string) => {
    try {
      const data = await moderationApi.getDashboard(authToken)
      setDashboard(data)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async (authToken: string) => {
    try {
      const data = await moderationApi.getReports(authToken, { status: 'pending' })
      setReports(data.reports || [])
    } catch (error) {
      console.error('Erreur chargement signalements:', error)
    }
  }

  const handleReportAction = async (
    reportId: string,
    action: 'approve' | 'reject' | 'suspend-user' | 'warn-user'
  ) => {
    try {
      if (!token) return

      await moderationApi.handleReport(token, reportId, action, actionNotes)
      alert('Action effectuée avec succès')
      setSelectedReport(null)
      setActionNotes('')
      if (token) {
        loadReports(token)
        loadDashboard(token)
      }
    } catch (error) {
      console.error('Erreur traitement signalement:', error)
      alert('Erreur lors du traitement du signalement')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modération - ZAWJ</h1>
              <p className="mt-1 text-gray-600">Gestion des signalements et surveillance de la plateforme</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Retour Admin
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-red-600">{dashboard.stats.totalReports}</div>
            <div className="text-gray-600 mt-1">Total Signalements</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">{dashboard.stats.pendingReports}</div>
            <div className="text-gray-600 mt-1">En Attente</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{dashboard.stats.totalUsers}</div>
            <div className="text-gray-600 mt-1">Utilisateurs</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-orange-600">
              {dashboard.stats.suspendedUsers}
            </div>
            <div className="text-gray-600 mt-1">Suspendus</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {dashboard.stats.flaggedMessages}
            </div>
            <div className="text-gray-600 mt-1">Messages Bloqués</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b px-6">
            <nav className="flex space-x-8">
              {(['dashboard', 'reports', 'messages', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'dashboard'
                    ? 'Tableau de bord'
                    : tab === 'reports'
                    ? 'Signalements'
                    : tab === 'messages'
                    ? 'Messages'
                    : 'Statistiques'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Activité Récente</h3>

                {dashboard.recentActivity.recentReports.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3">Derniers Signalements</h4>
                    <div className="space-y-2">
                      {dashboard.recentActivity.recentReports.slice(0, 5).map((report: any) => (
                        <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{report.type}</p>
                            <p className="text-sm text-gray-600">{report.description || 'Aucune description'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Par {report.reportedBy?.firstName} - {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            report.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : report.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {report.status === 'pending' ? 'En attente' : report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboard.recentActivity.recentUsers.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3">Nouveaux Utilisateurs</h4>
                    <div className="space-y-2">
                      {dashboard.recentActivity.recentUsers.slice(0, 5).map((u: any) => (
                        <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-gray-600">{u.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {u.isVerified && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Vérifié
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun signalement en attente</p>
                ) : (
                  reports.map((report: any) => (
                    <div
                      key={report._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                              {report.type}
                            </span>
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              report.severity === 'high'
                                ? 'bg-red-100 text-red-800'
                                : report.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              Gravité: {report.severity}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">{report.description || 'Aucune description'}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Signalé par: {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                            </span>
                            <span>•</span>
                            <span>
                              Utilisateur signalé: {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                            </span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Traiter
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="text-center py-8 text-gray-500">
                Section des messages signalés - À implémenter
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="text-center py-8 text-gray-500">
                Statistiques détaillées - À implémenter
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Traiter le Signalement</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Type de signalement</p>
                <p className="font-medium">{selectedReport.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{selectedReport.description || 'Aucune description'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows={3}
                  placeholder="Ajouter des notes sur votre décision..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleReportAction(selectedReport._id, 'approve')}
                  className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Valider le signalement
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport._id, 'reject')}
                  className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport._id, 'suspend-user')}
                  className="py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Suspendre utilisateur
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport._id, 'warn-user')}
                  className="py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                >
                  Avertir utilisateur
                </button>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null)
                  setActionNotes('')
                }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
