'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, User, MapPin, Calendar, FileText, Camera, Shield, Plus, X } from 'lucide-react'
import { usersApi, UpdateProfileData } from '@/lib/api/users'
import { useAuthStore } from '@/store/auth'
import { tuteurApi } from '@/lib/api/tuteur'

export default function ProfilePage() {
  const [formData, setFormData] = useState<UpdateProfileData>({
    bio: '',
    age: undefined,
    location: '',
    preferences: {}
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showTuteurModal, setShowTuteurModal] = useState(false)
  const [tuteurForm, setTuteurForm] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'father' as string,
    hasAccessToDashboard: false,
    notifyOnNewMessage: true
  })

  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
    enabled: isAuthenticated,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditing(false)
    },
  })

  const createTuteurMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Non authentifié')
      return tuteurApi.requestTuteur(token, data)
    },
    onSuccess: () => {
      setShowTuteurModal(false)
      setTuteurForm({
        name: '',
        email: '',
        phone: '',
        relationship: 'father',
        hasAccessToDashboard: false,
        notifyOnNewMessage: true
      })
      alert('Votre demande de tuteur a été envoyée avec succès. Elle sera examinée par un administrateur.')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande')
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        age: profile.age,
        location: profile.location || '',
        preferences: profile.preferences || {}
      })
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }))
  }

  const handleTuteurSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTuteurMutation.mutate({
      ...tuteurForm,
      type: 'family'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        {/* Aura d'arrière-plan */}
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            Z
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
          <p className="text-gray-400 mb-6">Vous devez être connecté pour accéder à votre profil.</p>
          <a
            href="/login"
            className="btn-pink px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest inline-block"
          >
            Se connecter
          </a>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-[#ff007f] px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-2xl font-bold text-[#ff007f]">
                {profile?.firstName[0]}{profile?.lastName[0]}
              </span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-pink-100">{profile?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-1" />
                  {profile?.gender === 'male' ? 'Homme' : 'Femme'}
                </span>
                {profile?.age && (
                  <span className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {profile.age} ans
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-[#ff007f] hover:text-[#ff85c1] transition-colors"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="18"
                    max="100"
                    value={formData.age || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                    Localisation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-[#ff007f]" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ville, Pays"
                      className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Biographie
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-[#ff007f]" />
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Parlez de vous, de vos valeurs, de votre parcours..."
                    className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all resize-none"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  {formData.bio?.length || 0}/500 caractères
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-300 bg-[#1a1a1a] border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-3 text-sm font-black uppercase tracking-widest text-white bg-[#ff007f] rounded-xl hover:bg-[#ff85c1] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)] flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-[#ff007f]" />
                    Âge
                  </div>
                  <p className="text-lg font-medium text-white">
                    {profile?.age ? `${profile.age} ans` : 'Non spécifié'}
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-[#ff007f]" />
                    Localisation
                  </div>
                  <p className="text-lg font-medium text-white">
                    {profile?.location || 'Non spécifiée'}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4">
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <FileText className="h-4 w-4 mr-2 text-[#ff007f]" />
                  Biographie
                </div>
                <p className="text-white whitespace-pre-wrap">
                  {profile?.bio || 'Aucune biographie ajoutée.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tuteur Section - Only for women */}
      {profile?.gender === 'female' && (
        <div className="glass-card mt-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Mon Tuteur (Wali)</h3>
                  <p className="text-sm text-gray-400">Gérez votre tuteur familial</p>
                </div>
              </div>
              <button
                onClick={() => setShowTuteurModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
              >
                <Plus className="h-5 w-5" />
                Ajouter un Tuteur
              </button>
            </div>

            <div className="bg-[#1a1a1a] border border-red-600/30 rounded-xl p-6">
              <p className="text-gray-300 mb-4">
                Conformément aux principes islamiques, votre tuteur (père, frère, oncle, etc.) 
                doit approuver vos échanges. Ajoutez les informations de votre tuteur pour 
                soumettre une demande à l'administration.
              </p>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  <span>Le tuteur sera notifié de vos demandes de contact</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  <span>Validation nécessaire pour les échanges</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  <span>Protection et conformité islamique garanties</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tuteur Service Section - Only for women without valid Tuteur */}
      {profile?.gender === 'female' && !profile?.waliId && !profile?.waliInfo?.platformServicePaid && (
        <div className="glass-card mt-6">
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff007f]/10 rounded-full flex items-center justify-center text-[#ff007f] text-2xl mb-4 mx-auto">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Service Tuteur Requis</h3>
              <p className="text-gray-400 mb-6">
                Pour communiquer sur Nissfi, vous devez avoir un Tuteur (tuteur légal) validé.
                Notre service Tuteur plateforme vous permet de bénéficier de ce service de manière sécurisée.
              </p>

              <div className="bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Service Tuteur Plateforme</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#ff007f] rounded-full mr-3"></div>
                    <span>Supervision et validation de vos communications</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#ff007f] rounded-full mr-3"></div>
                    <span>Protection de votre pudeur et sécurité</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#ff007f] rounded-full mr-3"></div>
                    <span>Accès complet à toutes les fonctionnalités</span>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <div className="text-2xl font-bold text-[#ff007f] mb-2">49.99€<span className="text-sm text-gray-400">/mois</span></div>
                  <p className="text-sm text-gray-400">Paiement unique pour activation</p>
                </div>
              </div>

              <button
                onClick={() => {
                  // TODO: Implement payment flow
                  alert('Fonctionnalité de paiement à implémenter')
                }}
                className="w-full bg-[#ff007f] hover:bg-[#ff85c1] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)]"
              >
                Demander le Service Tuteur
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Tuteur */}
      {showTuteurModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Ajouter un Tuteur</h3>
              <button
                onClick={() => setShowTuteurModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleTuteurSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet du tuteur *
                </label>
                <input
                  type="text"
                  value={tuteurForm.name}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                  placeholder="Ahmed Ben Ali"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email du tuteur *
                </label>
                <input
                  type="email"
                  value={tuteurForm.email}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                  placeholder="ahmed@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={tuteurForm.phone}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                  placeholder="+33612345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relation avec vous *
                </label>
                <select
                  value={tuteurForm.relationship}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, relationship: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                >
                  <option value="father">Père</option>
                  <option value="brother">Frère</option>
                  <option value="uncle">Oncle</option>
                  <option value="grandfather">Grand-père</option>
                  <option value="imam">Imam</option>
                  <option value="trusted-community-member">Membre de confiance de la communauté</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={tuteurForm.hasAccessToDashboard}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, hasAccessToDashboard: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-gray-300">
                  Donner accès au tableau de bord
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={tuteurForm.notifyOnNewMessage}
                  onChange={(e) => setTuteurForm({ ...tuteurForm, notifyOnNewMessage: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label className="text-sm text-gray-300">
                  Recevoir des notifications par email
                </label>
              </div>

              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-red-400">Important :</strong> Votre demande sera examinée par un administrateur. 
                  Vous serez notifiée une fois votre tuteur approuvé ou si des informations supplémentaires sont nécessaires.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTuteurModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTuteurMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50"
                >
                  {createTuteurMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
