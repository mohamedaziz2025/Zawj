'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { settingsApi, UserSettings } from '@/lib/api/settings'
import {
  Bell,
  Lock,
  Eye,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('notifications')
  const [settings, setSettings] = useState<Partial<UserSettings> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings()
    }
  }, [isAuthenticated])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await settingsApi.get(token)
      setSettings(data)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (category: string, subcategory: string, key: string) => {
    if (!settings) return
    
    if (subcategory) {
      setSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev?.[category],
          [subcategory]: {
            ...prev?.[category]?.[subcategory],
            [key]: !prev?.[category]?.[subcategory]?.[key],
          },
        },
      }))
    } else {
      setSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev?.[category],
          [key]: !prev?.[category]?.[key],
        },
      }))
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    setIsSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('Non authentifié')
        return
      }

      await settingsApi.update(token, settings)
      setMessage('Paramètres sauvegardés avec succès!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            Z
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
          <p className="text-gray-400 mb-6">
            Vous devez être connecté pour accéder aux paramètres.
          </p>
          <Link
            href="/login"
            className="btn-pink px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest inline-block"
          >
            Se connecter
          </Link>
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

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Eye },
    { id: 'account', label: 'Compte', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Paramètres du <span className="text-[#ff007f]">compte</span>
          </h1>
          <p className="text-gray-400">Gérez vos préférences et votre confidentialité</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('succès') 
              ? 'bg-green-500/20 border border-green-500 text-green-300'
              : 'bg-red-500/20 border border-red-500 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-white/10">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#ff007f] border-b-2 border-[#ff007f]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
                  <p className="text-gray-400 mb-6">
                    Choisissez les notifications que vous souhaitez recevoir
                  </p>
                </div>

                <div className="space-y-4">
                  <ToggleItem
                    label="Nouveaux messages"
                    description="Recevez une notification pour chaque nouveau message"
                    checked={settings?.notifications?.email?.newMessages || false}
                    onChange={() => handleToggle('notifications', 'email', 'newMessages')}
                  />
                  <ToggleItem
                    label="Nouveaux likes"
                    description="Soyez notifié quand quelqu'un aime votre profil"
                    checked={settings?.notifications?.email?.likes || false}
                    onChange={() => handleToggle('notifications', 'email', 'likes')}
                  />
                  <ToggleItem
                    label="Nouveaux matchs"
                    description="Recevez une notification pour chaque nouveau match"
                    checked={settings?.notifications?.email?.newMatches || false}
                    onChange={() => handleToggle('notifications', 'email', 'newMatches')}
                  />
                  <ToggleItem
                    label="Vues de profil"
                    description="Soyez notifié quand quelqu'un visite votre profil"
                    checked={settings?.notifications?.email?.profileViews || false}
                    onChange={() => handleToggle('notifications', 'email', 'profileViews')}
                  />
                  <ToggleItem
                    label="Newsletter"
                    description="Recevez nos actualités et conseils par email"
                    checked={settings?.notifications?.email?.newsletter || false}
                    onChange={() => handleToggle('notifications', 'email', 'newsletter')}
                  />
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Confidentialité</h2>
                  <p className="text-gray-400 mb-6">
                    Contrôlez qui peut voir vos informations
                  </p>
                </div>

                <div className="space-y-4">
                  <ToggleItem
                    label="Afficher le statut en ligne"
                    description="Les autres utilisateurs peuvent voir quand vous êtes connecté"
                    checked={settings?.privacy?.showOnlineStatus || false}
                    onChange={() => handleToggle('privacy', '', 'showOnlineStatus')}
                  />
                  <ToggleItem
                    label="Afficher la dernière connexion"
                    description="Afficher quand vous vous êtes connecté pour la dernière fois"
                    checked={settings?.privacy?.showLastSeen || false}
                    onChange={() => handleToggle('privacy', '', 'showLastSeen')}
                  />
                  <ToggleItem
                    label="Afficher les vues de profil"
                    description="Autoriser les autres à voir quand vous avez visité leur profil"
                    checked={settings?.privacy?.showProfileViews || false}
                    onChange={() => handleToggle('privacy', '', 'showProfileViews')}
                  />
                  <ToggleItem
                    label="Cacher mon profil des recherches"
                    description="Votre profil ne sera pas visible dans les résultats de recherche"
                    checked={settings?.privacy?.hideProfileFromSearch || false}
                    onChange={() => handleToggle('privacy', '', 'hideProfileFromSearch')}
                  />
                  <ToggleItem
                    label="Autoriser les messages des non-matchs"
                    description="Recevoir des messages d'utilisateurs avec qui vous n'avez pas matché"
                    checked={settings?.privacy?.allowMessagesFromNonMatches || false}
                    onChange={() => handleToggle('privacy', '', 'allowMessagesFromNonMatches')}
                  />
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Compte</h2>
                  <p className="text-gray-400 mb-6">
                    Gérez votre compte et vos données
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Informations du compte</h3>
                    <p className="text-gray-400 text-sm mb-1">Email: {user?.email}</p>
                    <p className="text-gray-400 text-sm">Rôle: {user?.role}</p>
                  </div>

                  <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all">
                    <Lock className="h-5 w-5" />
                    Changer le mot de passe
                  </button>

                  <div className="pt-4 border-t border-white/10">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h3 className="text-white font-semibold mb-1">Zone dangereuse</h3>
                          <p className="text-gray-400 text-sm">
                            Les actions suivantes sont irréversibles
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all">
                      <Trash2 className="h-5 w-5" />
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white font-semibold rounded-xl shadow-lg shadow-[#ff007f]/30 hover:shadow-[#ff007f]/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant Toggle réutilisable
function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">{label}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-[#ff007f]' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
