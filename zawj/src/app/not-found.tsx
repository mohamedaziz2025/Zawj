'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative px-4">
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

      <div className="text-center relative z-10 max-w-2xl">
        {/* Logo animé */}
        <div className="mb-8 inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-[#ff007f] to-[#ff4d94] rounded-3xl flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-[#ff007f]/50 animate-pulse">
            Z
          </div>
        </div>

        {/* Titre 404 */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff007f] via-[#ff4d94] to-[#ff007f] mb-4 animate-pulse">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
          Peut-être cherchez-vous votre âme sœur ? 💕
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white font-semibold rounded-xl shadow-lg shadow-[#ff007f]/30 hover:shadow-[#ff007f]/50 hover:scale-105 transition-all"
          >
            <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Retour à l'accueil
          </Link>

          <Link
            href="/search"
            className="group flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
          >
            <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Rechercher un profil
          </Link>
        </div>

        {/* Lien retour */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-[#ff007f] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la page précédente
        </button>
      </div>
    </div>
  )
}
