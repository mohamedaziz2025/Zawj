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
      const response = await authApi.login(formData)
      setUser(response.user)
      
      // Rediriger selon le rôle de l'utilisateur
      const userRole = response.user.role
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        // Pour les utilisateurs normaux (seekers)
        router.push('/search')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    } finally {
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 relative">
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              Z
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-black">
            Connexion à <span className="text-[#ff007f]">Nissfi</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/register" className="font-medium text-[#ff007f] hover:text-[#ff85c1] transition-colors">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  className="block w-full px-4 py-3 pl-12 bg-white border border-[#ff007f]/30 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                  placeholder="votre@email.com"
                />
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[#ff007f]" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className="block w-full px-4 py-3 pl-12 pr-12 bg-white border border-[#ff007f]/30 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#ff007f]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-[#ff007f] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-4">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-white bg-[#ff007f] hover:bg-[#ff85c1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff007f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.5)]"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-[#ff007f] transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
