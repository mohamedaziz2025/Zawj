'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Heart, MessageCircle, AlertTriangle, TrendingUp, Shield, DollarSign, Activity, ChevronRight, Bell, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { adminApi } from '@/lib/api/admin'
import { authApi } from '@/lib/api/auth'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, isAuthenticated, setUser, isLoading: authLoading, setLoading } = useAuthStore()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      console.log('Token trouvé:', token ? 'Oui' : 'Non')
      
      if (token && !user) {
        try {
          console.log('Récupération des données utilisateur...')
          const userData = await authApi.getCurrentUser()
          console.log('Données utilisateur:', userData)
          setUser(userData)
          setLoading(false)
        } catch (error) {
          console.error('Erreur récupération utilisateur:', error)
          localStorage.removeItem('accessToken')
          setLoading(false)
          window.location.href = '/login'
        }
      } else if (!token) {
        console.log('Pas de token, redirection vers login')
        setLoading(false)
        window.location.href = '/login'
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [user, setUser, setLoading])

  // Fetch real stats from API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isAuthenticated && user?.role === 'admin',
  })

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Accès refusé</h2>
          <p className="text-gray-600 text-lg">Vous n'avez pas les permissions pour accéder à cette page.</p>
          <Link href="/" className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Espace Administration
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Gestion et supervision de la plateforme Nissfi</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors relative">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                  {user?.firstName?.[0] || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <StatCard
            title="Utilisateurs totaux"
            value={stats?.totalUsers || 0}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            trend={`+${stats?.growthRate || 0}%`}
            trendPositive={true}
          />
          <StatCard
            title="Actifs aujourd'hui"
            value={stats?.activeToday || 0}
            icon={Activity}
            gradient="from-green-500 to-emerald-500"
            trend="Aujourd'hui"
            trendPositive={true}
          />
          <StatCard
            title="Tuteurs vérifiés"
            value={stats?.totalWalis || 0}
            icon={Heart}
            gradient="from-pink-500 to-rose-500"
            trend="Total"
            trendPositive={true}
          />
          <StatCard
            title="En attente d'approbation"
            value={stats?.pendingTuteurs || stats?.pendingMahrams || 0}
            icon={AlertTriangle}
            gradient="from-orange-500 to-amber-500"
            trend="À traiter"
            trendPositive={false}
          />
          <StatCard
            title="Signalements actifs"
            value={stats?.reports || 0}
            icon={Shield}
            gradient="from-red-500 to-pink-600"
            trend="À examiner"
            trendPositive={false}
          />
          <StatCard
            title="Revenus mensuels"
            value={0}
            icon={DollarSign}
            gradient="from-purple-500 to-indigo-600"
            trend="+12.5%"
            trendPositive={true}
            prefix="€"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Actions rapides</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Accès rapide aux fonctionnalités principales</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <QuickAction
              title="Gérer utilisateurs"
              description="Voir tous les profils"
              href="/admin/users"
              icon={Users}
              gradient="from-blue-500 to-cyan-500"
              badge={`${stats?.totalUsers || 0}`}
            />
            <QuickAction
              title="Gérer Modérateurs"
              description="Supervision utilisatrices"
              href="/admin/moderators"
              icon={Shield}
              gradient="from-purple-500 to-indigo-600"
              badge="Admin"
            />
            <QuickAction
              title="Approuver Tuteurs"
              description="Validations en attente"
              href="/admin/mahrams"
              icon={Heart}
              gradient="from-pink-500 to-rose-500"
              badge={`${stats?.pendingTuteurs || 0}`}
            />
            <QuickAction
              title="Voir messagerie"
              description="Superviser les conversations"
              href="/admin/messages"
              icon={MessageCircle}
              gradient="from-indigo-500 to-purple-600"
              badge="Admin"
            />
            <QuickAction
              title="Modérer signalements"
              description="Traiter les rapports"
              href="/admin/reports"
              icon={Shield}
              gradient="from-red-500 to-pink-600"
              badge={`${stats?.reports || 0}`}
            />
          </div>
        </div>

        {/* Activity Feed & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activité récente</h2>
              <button className="text-xs sm:text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                type="user"
                icon={Users}
                message="Nouveau compte créé"
                detail="Marie Dupont s'est inscrite"
                time="Il y a 5 min"
                color="blue"
              />
              <ActivityItem
                type="Tuteur"
                icon={Heart}
                message="Tuteur approuvé"
                detail="Validation pour Sophie Martin"
                time="Il y a 12 min"
                color="pink"
              />
              <ActivityItem
                type="report"
                icon={Shield}
                message="Nouveau signalement"
                detail="Profil #1234 signalé pour spam"
                time="Il y a 18 min"
                color="red"
              />
              <ActivityItem
                type="activity"
                icon={TrendingUp}
                message="Pic d'activité"
                detail="143 utilisateurs actifs en ce moment"
                time="Il y a 25 min"
                color="green"
              />
              <ActivityItem
                type="message"
                icon={MessageCircle}
                message="Conversations actives"
                detail="89 messages échangés dans l'heure"
                time="Il y a 35 min"
                color="purple"
              />
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-bold text-base sm:text-lg">Croissance</h3>
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-2">+{stats?.growthRate || 0}%</p>
              <p className="text-pink-100 text-xs sm:text-sm">Cette semaine vs semaine dernière</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Actions requises</h3>
              <div className="space-y-3">
                <TaskItem
                  label="Tuteurs à approuver"
                  count={stats?.pendingTuteurs || 0}
                  color="pink"
                />
                <TaskItem
                  label="Signalements à traiter"
                  count={stats?.reports || 0}
                  color="red"
                />
                <TaskItem
                  label="Support en attente"
                  count={0}
                  color="blue"
                />
              </div>
            </div>
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
  gradient,
  trend,
  trendPositive,
  prefix = ''
}: {
  title: string
  value: number
  icon: any
  gradient: string
  trend: string
  trendPositive: boolean
  prefix?: string
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            {prefix}{value.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs sm:text-sm font-medium ${trendPositive ? 'text-green-600' : 'text-gray-500'}`}>
              {trend}
            </span>
          </div>
        </div>
        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  badge
}: {
  title: string
  description: string
  href: string
  icon: any
  gradient: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-5 md:p-6 hover:border-gray-300 hover:shadow-lg transition-all"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-md group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base pr-12">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
      {badge && (
        <span className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute bottom-4 sm:bottom-6 right-4 sm:right-6 group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}

function ActivityItem({
  type,
  icon: Icon,
  message,
  detail,
  time,
  color
}: {
  type: string
  icon: any
  message: string
  detail: string
  time: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    pink: 'bg-pink-100 text-pink-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`p-2 sm:p-2.5 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex-shrink-0`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-xs sm:text-sm">{message}</p>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">{detail}</p>
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">{time}</span>
    </div>
  )
}

function TaskItem({
  label,
  count,
  color
}: {
  label: string
  count: number
  color: string
}) {
  const colorClasses = {
    pink: 'bg-pink-100 text-pink-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">{label}</span>
      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold ${colorClasses[color as keyof typeof colorClasses]} flex-shrink-0`}>
        {count}
      </span>
    </div>
  )
}
