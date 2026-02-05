'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import {
  Bell,
  Lock,
  Eye,
  Shield,
  Globe,
  Moon,
  Save,
  Trash2,
  AlertTriangle,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('notifications')
  const [settings, setSettings] = useState({
    notifications: {
      newMessages: true,
      newLikes: true,
      matches: true,
      waliUpdates: true,
      emailNotifications: false,
    },
    privacy: {
      showOnline: true,
      showAge: true,
      showLocation: true,
      allowMessages: 'everyone', // everyone, matches, none
      profileVisibility: 'public', // public, members, private
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    },
  })

  const handleToggle = (category: string, key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }))
  }

  const handleSelect = (category: string, key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const handleSave = () => {
    // TODO: Save settings to API
    console.log('Saving settings:', settings)
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

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Eye },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'account', label: 'Compte', icon: Lock },
  ]

  // Ajouter l'onglet Tuteurs uniquement pour les femmes
  const availableTabs = user?.gender === 'female' 
    ? [
        ...tabs.slice(0, 3), // Notifications, Confidentialité, Sécurité
        { id: 'tuteurs', label: 'Tuteurs', icon: Users },
        tabs[3] // Compte
      ]
    : tabs

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-gray-400">Gérez vos préférences et votre compte</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-4 space-y-2">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'tuteurs') {
                      router.push('/settings/tuteurs')
                    } else {
                      setActiveTab(tab.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-6">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Notifications
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Choisissez les notifications que vous souhaitez recevoir
                    </p>
                  </div>

                  <div className="space-y-4">
                    <ToggleItem
                      label="Nouveaux messages"
                      description="Recevez une notification pour chaque nouveau message"
                      checked={settings.notifications.newMessages}
                      onChange={() => handleToggle('notifications', 'newMessages')}
                    />
                    <ToggleItem
                      label="Nouveaux likes"
                      description="Soyez notifié quand quelqu'un aime votre profil"
                      checked={settings.notifications.newLikes}
                      onChange={() => handleToggle('notifications', 'newLikes')}
                    />
                    <ToggleItem
                      label="Nouveaux matchs"
                      description="Recevez une notification pour chaque nouveau match"
                      checked={settings.notifications.matches}
                      onChange={() => handleToggle('notifications', 'matches')}
                    />
                    <ToggleItem
                      label="Mises à jour du Tuteur"
                      description="Notifications des actions de votre Tuteur (femmes uniquement)"
                      checked={settings.notifications.waliUpdates}
                      onChange={() => handleToggle('notifications', 'waliUpdates')}
                    />
                    <ToggleItem
                      label="Notifications par email"
                      description="Recevez également les notifications par email"
                      checked={settings.notifications.emailNotifications}
                      onChange={() =>
                        handleToggle('notifications', 'emailNotifications')
                      }
                    />
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Confidentialité
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Contrôlez qui peut voir vos informations
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-3">
                        Visibilité du profil
                      </label>
                      <div className="space-y-2">
                        <RadioOption
                          name="profileVisibility"
                          value="public"
                          label="Public"
                          description="Visible par tous les membres"
                          checked={settings.privacy.profileVisibility === 'public'}
                          onChange={() =>
                            handleSelect('privacy', 'profileVisibility', 'public')
                          }
                        />
                        <RadioOption
                          name="profileVisibility"
                          value="members"
                          label="Membres uniquement"
                          description="Visible uniquement par les membres inscrits"
                          checked={settings.privacy.profileVisibility === 'members'}
                          onChange={() =>
                            handleSelect('privacy', 'profileVisibility', 'members')
                          }
                        />
                        <RadioOption
                          name="profileVisibility"
                          value="private"
                          label="Privé"
                          description="Visible uniquement par vos matchs"
                          checked={settings.privacy.profileVisibility === 'private'}
                          onChange={() =>
                            handleSelect('privacy', 'profileVisibility', 'private')
                          }
                        />
                      </div>
                    </div>

                    <ToggleItem
                      label="Afficher le statut en ligne"
                      description="Les autres peuvent voir quand vous êtes en ligne"
                      checked={settings.privacy.showOnline}
                      onChange={() => handleToggle('privacy', 'showOnline')}
                    />
                    <ToggleItem
                      label="Afficher l'âge"
                      description="Votre âge sera visible sur votre profil"
                      checked={settings.privacy.showAge}
                      onChange={() => handleToggle('privacy', 'showAge')}
                    />
                    <ToggleItem
                      label="Afficher la localisation"
                      description="Votre ville sera visible sur votre profil"
                      checked={settings.privacy.showLocation}
                      onChange={() => handleToggle('privacy', 'showLocation')}
                    />
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Sécurité</h2>
                    <p className="text-gray-400 mb-6">
                      Protégez votre compte avec des mesures de sécurité avancées
                    </p>
                  </div>

                  <div className="space-y-4">
                    <ToggleItem
                      label="Authentification à deux facteurs"
                      description="Ajoutez une couche de sécurité supplémentaire"
                      checked={settings.security.twoFactorAuth}
                      onChange={() => handleToggle('security', 'twoFactorAuth')}
                    />
                    <ToggleItem
                      label="Alertes de connexion"
                      description="Recevez une notification pour chaque nouvelle connexion"
                      checked={settings.security.loginAlerts}
                      onChange={() => handleToggle('security', 'loginAlerts')}
                    />

                    <div className="pt-4 border-t border-white/10">
                      <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all">
                        <Lock className="h-5 w-5" />
                        Changer le mot de passe
                      </button>
                    </div>
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
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h3 className="text-white font-semibold mb-1">
                            Zone dangereuse
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
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
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white font-semibold rounded-xl shadow-lg shadow-[#ff007f]/30 hover:shadow-[#ff007f]/50 hover:scale-105 transition-all"
                >
                  <Save className="h-5 w-5" />
                  Enregistrer les modifications
                </button>
              </div>
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

// Composant Radio réutilisable
function RadioOption({
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: {
  name: string
  value: string
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-[#ff007f] focus:ring-[#ff007f] focus:ring-offset-0 bg-gray-700 border-gray-600"
      />
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">{label}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </label>
  )
}
