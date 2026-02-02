'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'

interface FinancialMetrics {
  overview: {
    mrr: number
    totalUsers: number
    maleUsers: number
    femaleUsers: number
    premiumSubscribers: number
    boostSubscribers: number
    conversionRate: number
    churnRate: number
  }
  mrrBreakdown: {
    premium_monthly: number
    premium_quarterly: number
    boost_monthly: number
  }
  metrics: {
    upcomingRenewals: number
    failedPayments: number
    activeSubscriptions: number
  }
  revenueTrends: Array<{
    month: string
    revenue: number
  }>
}

interface Subscription {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    gender: string
  }
  plan: string
  status: string
  amount: number
  currency: string
  startDate: string
  endDate: string
  stripeSubscriptionId?: string
}

export default function AdminFinancialPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  useEffect(() => {
    fetchMetrics()
    fetchSubscriptions()
  }, [page, statusFilter, planFilter])

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/admin/financial/dashboard')
      setMetrics(response.data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.append('status', statusFilter)
      if (planFilter) params.append('plan', planFilter)

      const response = await api.get(`/admin/financial/subscriptions?${params}`)
      setSubscriptions(response.data.subscriptions)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (subscriptionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rembourser cet abonnement ?')) return

    try {
      await api.post(`/admin/financial/refund/${subscriptionId}`)
      alert('Remboursement effectué avec succès')
      fetchSubscriptions()
      fetchMetrics()
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || 'Erreur lors du remboursement'}`)
    }
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données financières...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financier</h1>
          <p className="mt-2 text-gray-600">Vue d'ensemble des revenus et abonnements</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.overview.mrr.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abonnés Premium</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.overview.premiumSubscribers}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.overview.conversionRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Churn</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.overview.churnRate}%</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* MRR Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition du MRR</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Premium Mensuel (19,99€)</p>
              <p className="text-xl font-bold text-indigo-600">{metrics.mrrBreakdown.premium_monthly.toFixed(2)}€</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Premium Trimestriel (49€)</p>
              <p className="text-xl font-bold text-purple-600">{metrics.mrrBreakdown.premium_quarterly.toFixed(2)}€</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Boost Femmes (5€)</p>
              <p className="text-xl font-bold text-pink-600">{metrics.mrrBreakdown.boost_monthly.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Revenu (6 derniers mois)</h2>
          <div className="flex items-end justify-between h-64 gap-4">
            {metrics.revenueTrends.map((trend, index) => {
              const maxRevenue = Math.max(...metrics.revenueTrends.map((t) => t.revenue))
              const height = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700" style={{ height: `${height}%` }}></div>
                  <p className="text-xs text-gray-600 mt-2 text-center">{trend.month}</p>
                  <p className="text-sm font-semibold text-gray-900">{trend.revenue.toFixed(0)}€</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Renouvellements à venir</p>
                <p className="text-2xl font-bold text-yellow-900">{metrics.metrics.upcomingRenewals}</p>
                <p className="text-xs text-yellow-600">dans les 7 prochains jours</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Paiements échoués</p>
                <p className="text-2xl font-bold text-red-900">{metrics.metrics.failedPayments}</p>
                <p className="text-xs text-red-600">30 derniers jours</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Abonnements actifs</p>
                <p className="text-2xl font-bold text-green-900">{metrics.metrics.activeSubscriptions}</p>
                <p className="text-xs text-green-600">Total en cours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Abonnements</h2>
              <div className="flex gap-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="cancelled">Annulé</option>
                  <option value="expired">Expiré</option>
                  <option value="payment_failed">Paiement échoué</option>
                </select>
                <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Tous les plans</option>
                  <option value="premium">Premium</option>
                  <option value="boost">Boost</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sub.userId.firstName} {sub.userId.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{sub.userId.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${sub.plan === 'premium' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'}`}>{sub.plan.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sub.status === 'active' ? 'bg-green-100 text-green-800' : sub.status === 'payment_failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(sub.amount / 100).toFixed(2)}€</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(sub.startDate).toLocaleDateString('fr-FR')} → {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {sub.stripeSubscriptionId && sub.status === 'active' && (
                        <button onClick={() => handleRefund(sub._id)} className="text-red-600 hover:text-red-900 font-medium">
                          Rembourser
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {page} sur {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
