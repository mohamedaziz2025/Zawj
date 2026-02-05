'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Tentative de connexion avec:', formData.email)
      const response = await authApi.login(formData)
      console.log('Réponse login:', response)
      
      // Store token explicitly
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken)
        console.log('Token stocké:', response.accessToken.substring(0, 20) + '...')
      } else {
        console.warn('Aucun accessToken dans la réponse')
      }
      
      // Set user in store
      setUser(response.user)
      console.log('Utilisateur connecté:', response.user)
      
      // Rediriger selon le rôle de l'utilisateur
      const userRole = response.user.role
      console.log('Rôle utilisateur:', userRole)
      
      // Use window.location for hard navigation to ensure proper page load
      if (userRole === 'admin') {
        console.log('Redirection vers /admin')
        window.location.href = '/admin'
      } else {
        console.log('Redirection vers /search')
        window.location.href = '/search'
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      console.error('Détails erreur:', err.response?.data)
      setError(err.response?.data?.message || 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 relative">
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black">
              N
            </div>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-black">
            Connexion à <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">Nissfi</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Ou{' '}
            <Link href="/register" className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-colors">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-white border border-red-600/30 rounded-xl text-sm sm:text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                  placeholder="votre@email.com"
                />
                <Mail className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white border border-red-600/30 rounded-xl text-sm sm:text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-2.5 sm:top-3.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-400">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-3 sm:px-4 border border-transparent text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/forgot-password" className="text-xs sm:text-sm text-gray-600 hover:text-red-600 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
