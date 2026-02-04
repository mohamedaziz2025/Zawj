'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, Calendar, MapPin, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import { authApi, RegisterData } from '@/lib/api/auth'
import { adminApi } from '@/lib/api/admin'

export default function CreateUserPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedModeratorId, setSelectedModeratorId] = useState('')
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'male',
    waliInfo: {
      type: 'platform',
      platformServicePaid: false
    }
  })

  // Fetch moderators for female users with platform wali
  const { data: moderators = [] } = useQuery({
    queryKey: ['moderators'],
    queryFn: adminApi.getModerators,
    enabled: formData.gender === 'female' && formData.waliInfo?.type === 'platform'
  })

  const createUserMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Create user first
      const response = await authApi.register(data)
      
      // If it's a female with platform wali and a moderator is selected, assign the moderator
      if (data.gender === 'female' && 
          data.waliInfo?.type === 'platform' && 
          selectedModeratorId && 
          response.user) {
        try {
          const userId = response.user.id || response.user._id
          await adminApi.assignUserToModerator(selectedModeratorId, userId)
        } catch (error) {
          console.error('Failed to assign moderator:', error)
          // Continue anyway, user is created
        }
      }
      
      return response
    },
    onSuccess: () => {
      router.push('/admin/users')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: if female with platform wali, moderator must be selected
    if (formData.gender === 'female' && 
        formData.waliInfo?.type === 'platform' && 
        !selectedModeratorId) {
      alert('Veuillez sélectionner un modérateur pour cette utilisatrice')
      return
    }
    
    createUserMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/admin/users" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Créer un nouvel utilisateur
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Remplissez les informations ci-dessous pour créer un compte utilisateur
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-pink-600" />
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm sm:text-base"
                  placeholder="Entrez le prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm sm:text-base"
                  placeholder="Entrez le nom"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-pink-600" />
              Informations du compte
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-all text-sm sm:text-base"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-all text-sm sm:text-base"
                    placeholder="Mot de passe sécurisé"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm sm:text-base"
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wali Information (for female users) */}
          {formData.gender === 'female' && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Informations Tuteur (Wali)
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Tuteur *
                  </label>
                  <select
                    name="waliType"
                    value={formData.waliInfo?.type || 'platform'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      waliInfo: {
                        ...prev.waliInfo,
                        type: e.target.value as 'platform' | 'external'
                      }
                    }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                  >
                    <option value="platform">Tuteur Plateforme</option>
                    <option value="external">Tuteur Familial</option>
                  </select>
                </div>

                {formData.waliInfo?.type === 'platform' && (
                  <>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="platformServicePaid"
                        checked={formData.waliInfo?.platformServicePaid || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          waliInfo: {
                            type: prev.waliInfo?.type || 'platform',
                            platformServicePaid: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <label htmlFor="platformServicePaid" className="text-sm text-gray-700">
                        Service Tuteur plateforme payé
                      </label>
                    </div>

                    {/* Moderator Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigner un Modérateur *
                      </label>
                      <select
                        value={selectedModeratorId}
                        onChange={(e) => setSelectedModeratorId(e.target.value)}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                      >
                        <option value="">Sélectionner un modérateur</option>
                        {moderators.map((moderator: any) => (
                          <option key={moderator._id} value={moderator._id}>
                            {moderator.userId?.firstName} {moderator.userId?.lastName} - {moderator.assignedUsers?.length || 0} utilisatrices
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Le modérateur supervisera les échanges de cette utilisatrice
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {createUserMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">
                {(createUserMutation.error as any)?.response?.data?.message || 'Une erreur est survenue'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {createUserMutation.isPending ? 'Création en cours...' : 'Créer l\'utilisateur'}
            </button>
            <Link
              href="/admin/users"
              className="flex-1 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-center text-sm sm:text-base"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
