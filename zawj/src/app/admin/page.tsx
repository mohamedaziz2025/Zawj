'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, Heart, MessageCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { adminApi } from '@/lib/api/admin'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore()

  // Fetch real stats from API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        {/* Aura d'arrière-plan */}
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Accès refusé</h2>
          <p className="text-gray-400">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff007f]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Tableau de bord administrateur</h1>
          <p className="text-gray-400 mt-2">Gérez la plateforme ZAWJ et surveillez les activités</p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Utilisateurs totaux"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          trend={`+${stats?.growthRate || 0}%`}
        />
        <StatCard
          title="Utilisateurs actifs aujourd'hui"
          value={stats?.activeToday || 0}
          icon={TrendingUp}
          color="green"
          trend="Aujourd'hui"
        />
        <StatCard
          title="Mahrams total"
          value={stats?.totalWalis || 0}
          icon={Heart}
          color="pink"
          trend="Total"
        />
        <StatCard
          title="Mahrams en attente"
          value={stats?.pendingMahrams || 0}
          icon={AlertTriangle}
          color="yellow"
          trend="À approuver"
        />
        <StatCard
          title="Rapports"
          value={stats?.totalReports || 0}
          icon={Shield}
          color="purple"
          trend="Total"
        />
        <StatCard
          title="Signalements"
          value={stats?.reports || 0}
          icon={Shield}
          color="red"
          trend="À traiter"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Approuver mahrams"
            description={`${stats?.pendingMahrams || 0} en attente`}
            href="/admin/mahrams"
            color="pink"
          />
          <QuickAction
            title="Gérer utilisateurs"
            description="Voir tous les comptes"
            href="/admin/users"
            color="blue"
          />
          <QuickAction
            title="Modérer rapports"
            description={`${stats?.reports || 0} signalements`}
            href="/admin/reports"
            color="red"
          />
          <QuickAction
            title="Voir statistiques"
            description="Analyses détaillées"
            href="/admin/stats"
            color="green"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Activité récente</h2>
        <div className="space-y-4">
          <ActivityItem
            type="user"
            message="Nouveau compte créé: Marie Dupont"
            time="Il y a 5 minutes"
          />
          <ActivityItem
            type="mahram"
            message="Demande de mahram approuvée pour Sophie Martin"
            time="Il y a 12 minutes"
          />
          <ActivityItem
            type="report"
            message="Nouveau signalement concernant le profil #1234"
            time="Il y a 18 minutes"
          />
          <ActivityItem
            type="message"
            message="Pic d'activité messaging détecté"
            time="Il y a 25 minutes"
          />
        </div>
      </div>
    </div>
  </div>
)
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend
}: {
  title: string,
  value: number,
  icon: any,
  color: string,
  trend: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-[#ff007f]',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  color
}: {
  title: string,
  description: string,
  href: string,
  color: string
}) {
  const colorClasses = {
    pink: 'hover:bg-[#ff007f]/10 border-[#ff007f]/30 hover:border-[#ff007f]',
    blue: 'hover:bg-blue-500/10 border-blue-500/30 hover:border-blue-500',
    red: 'hover:bg-red-500/10 border-red-500/30 hover:border-red-500',
    green: 'hover:bg-green-500/10 border-green-500/30 hover:border-green-500'
  }

  return (
    <a
      href={href}
      className={`block p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer bg-[#1a1a1a] ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <h3 className="font-medium text-white">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </a>
  )
}

function ActivityItem({
  type,
  message,
  time
}: {
  type: string,
  message: string,
  time: string
}) {
  const typeColors = {
    user: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    mahram: 'bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/30',
    report: 'bg-red-500/20 text-red-400 border border-red-500/30',
    message: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
  }

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
        {type}
      </div>
      <p className="text-sm text-white flex-1">{message}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  )
}