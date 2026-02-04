'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  User,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  Settings
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Accueil', href: '/', icon: Heart },
  { name: 'Rechercher', href: '/search', icon: Search },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const femaleNavigation = [
  { name: 'Accueil', href: '/', icon: Heart },
  { name: 'Rechercher', href: '/search', icon: Search },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const malePaidNavigation = [
  { name: 'Accueil', href: '/', icon: Heart },
  { name: 'Rechercher', href: '/search', icon: Search },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Premium', href: '/premium', icon: Shield },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const maleFreeNavigation = [
  { name: 'Accueil', href: '/', icon: Heart },
  { name: 'Rechercher', href: '/search', icon: Search },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'S\'abonner', href: '/subscribe', icon: Shield },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Shield },
  { name: 'Utilisateurs', href: '/admin/users', icon: User },
  { name: 'Modérateurs', href: '/admin/moderators', icon: Shield },
  { name: 'Tuteurs', href: '/admin/mahrams', icon: Heart },
  { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
  { name: 'Rapports', href: '/admin/reports', icon: Shield },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  // Initialize auth check
  useAuth()

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('accessToken')
    // Reset auth state
    logout()
    // Redirect to home page
    window.location.href = '/'
  }

  const isAdmin = user?.role === 'admin'
  const isFemale = user?.gender === 'female'
  const hasPaidSubscription = user?.subscription?.status === 'active' && user?.subscription?.plan !== 'free'

  let navItems
  if (isAdmin) {
    navItems = adminNavigation
  } else if (isFemale) {
    navItems = femaleNavigation
  } else if (hasPaidSubscription) {
    navItems = malePaidNavigation
  } else {
    navItems = maleFreeNavigation
  }

  // Don't show sidebar when not authenticated or on specific pages
  const hideSidebarPages = ['/'] // Add more pages here if needed
  const shouldHideSidebar = !isAuthenticated || hideSidebarPages.includes(pathname)

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed left-0 top-0 bottom-0 w-64 sm:w-72 bg-gradient-to-b from-[#1a1a1a] via-[#151515] to-[#0f0f0f] border-r border-white/10 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff007f] to-[#ff4d94] rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-[#ff007f]/30">
                N
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider text-white">Nissfi</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff4d94] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-base truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white shadow-lg shadow-[#ff007f]/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 transition-transform group-hover:scale-110 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                      <span className="font-medium text-sm sm:text-base truncate">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          {isAuthenticated && (
            <div className="p-3 sm:p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm sm:text-base">Déconnexion</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:block">
        <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] via-[#151515] to-[#0f0f0f] border-r border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff007f] to-[#ff4d94] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#ff007f]/30 transform hover:scale-105 transition-transform">
                N
              </div>
              <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Nissfi
              </h1>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff4d94] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#ff007f]/20">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white shadow-lg shadow-[#ff007f]/30 scale-105'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white hover:scale-105'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          {isAuthenticated && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
              >
                <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar (mobile) */}
        <div className="sticky top-0 z-40 bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-white/10 lg:hidden">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#ff007f] to-[#ff4d94] rounded-lg flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-[#ff007f]/30">
                N
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white">
                Nissfi
              </h1>
            </div>
            <div className="w-8 sm:w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-[#0a0a0a] p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}