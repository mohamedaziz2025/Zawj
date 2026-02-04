'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Eye, EyeOff, Mail, Key } from 'lucide-react'
import Link from 'next/link'

export default function WaliLoginPage() {
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tuteur/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Échec de connexion')
      }

      // Store Tuteur token separately
      localStorage.setItem('waliToken', data.token)
      localStorage.setItem('protectedUser', JSON.stringify(data.protectedUser))
      
      router.push('/Tuteur-dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative flex items-center justify-center px-4">
      <div className="hero-aura top-0 left-0"></div>
      <div className="hero-aura bottom-0 right-0"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-[#ff007f] rounded-lg flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-widest text-white">ZAWJ</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Espace Tuteur</h1>
          <p className="text-gray-400">Accédez au tableau de bord de votre protégée</p>
        </div>

        {/* Info Box */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-[#ff007f]/30">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-[#ff007f] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Connexion Sécurisée Tuteur</h3>
              <p className="text-sm text-gray-400">
                Utilisez l&apos;email que vous avez fourni lors de l&apos;inscription de votre protégée 
                et le code d&apos;accès qui vous a été communiqué.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email du Tuteur</span>
                </div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@example.com"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Code d&apos;accès</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  placeholder="Tuteur-XXXXXX"
                  className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all uppercase"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-[#ff007f] transition-colors"
                >
                  {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Format: Tuteur- suivi de 6 caractères (fourni par votre protégée)
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 btn-pink rounded-xl font-bold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Connexion...' : 'Accéder au Dashboard'}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Vous n&apos;avez pas reçu votre code d&apos;accès ?{' '}
            <a href="mailto:support@zawj.com" className="text-[#ff007f] hover:underline">
              Contactez le support
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <Link href="/" className="hover:text-[#ff007f] transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
