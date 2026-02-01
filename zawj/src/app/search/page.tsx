'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Calendar, Heart, MessageCircle, Lock, Crown, Save, Bell, X, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { usersApi, User } from '@/lib/api/users'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

interface SearchFilters {
  gender?: 'male' | 'female'
  minAge?: number
  maxAge?: number
  location?: string
  city?: string
  country?: string
  // Religious filters
  madhab?: string[]
  prayerFrequency?: string[]
  practiceLevel?: string[]
  wearsHijab?: boolean
  hasBeard?: boolean
  quranMemorization?: string
  // Marriage expectations
  acceptsPolygamy?: boolean
  willingToRelocate?: boolean
  wantsChildren?: boolean
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set())
  const [likeCount, setLikeCount] = useState(0)
  const { user, isAuthenticated } = useAuthStore()

  const searchGender = user?.gender === 'male' ? 'female' : 'male'
  const hasActiveSubscription = user?.subscription?.status === 'active' && user?.subscription?.plan !== 'free'
  const isMale = user?.gender === 'male'
  const maxFreeLikes = 3
  const canLike = !isMale || hasActiveSubscription || likeCount < maxFreeLikes

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', filters, searchGender],
    queryFn: () => usersApi.searchUsers({ ...filters, gender: searchGender }),
    enabled: isAuthenticated,
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const handleMultiSelectChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[]) || []
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: newValue.length > 0 ? newValue : undefined }
    })
  }

  const clearFilters = () => {
    setFilters({})
  }

  const handleLike = (userId: string) => {
    if (!canLike) return
    setLikedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
        setLikeCount(prev => prev - 1)
      } else {
        newSet.add(userId)
        setLikeCount(prev => prev + 1)
      }
      return newSet
    })
  }

  const handleSaveSearch = async () => {
    // TODO: Implement API call to save search
    console.log('Saving search:', { name: searchName, filters })
    setShowSaveModal(false)
    setSearchName('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">Z</div>
          <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
          <p className="text-gray-400 mb-6">Vous devez être connecté pour accéder à la recherche.</p>
          <Link href="/login" className="btn-pink px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest inline-block">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Trouver votre <span className="text-[#ff007f]">moitié</span>
        </h1>
        <p className="text-gray-400">Recherche avancée avec filtres religieux</p>

        {isMale && !hasActiveSubscription && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Essai gratuit</span>
              </div>
              <div className="text-sm text-gray-300">Likes restants: {maxFreeLikes - likeCount}</div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              <Link href="/premium" className="text-[#ff007f] underline">Abonnez-vous</Link> pour voir les profils complets
            </p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#ff007f]" />
              <input
                type="text"
                placeholder="Rechercher par ville, pays..."
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 border border-[#ff007f]/30 bg-[#1a1a1a] rounded-xl text-white hover:border-[#ff007f] hover:bg-[#ff007f]/10 transition-all"
          >
            <Filter className="h-5 w-5" />
            Filtres Avancés
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-6 py-3 btn-pink rounded-xl text-sm font-semibold"
          >
            <Save className="h-5 w-5" />
            Sauvegarder
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Filtres Basiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Âge minimum</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.minAge || ''}
                  onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Âge maximum</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.maxAge || ''}
                  onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays</label>
                <input
                  type="text"
                  value={filters.country || ''}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  placeholder="France, Maroc, etc."
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                />
              </div>
            </div>

            {/* Religious Filters */}
            <h3 className="text-lg font-semibold text-white mb-4 mt-6">Filtres Religieux</h3>
            
            {/* Madhab Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Madhab (École Juridique)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['hanafi', 'maliki', 'shafii', 'hanbali', 'other', 'none'].map(m => (
                  <label key={m} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(filters.madhab || []).includes(m)}
                      onChange={() => handleMultiSelectChange('madhab', m)}
                      className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prayer Frequency */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Fréquence de Prière</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'always', label: 'Toujours (5/jour)' },
                  { value: 'often', label: 'Souvent (3-4/jour)' },
                  { value: 'sometimes', label: 'Parfois (1-2/jour)' },
                  { value: 'rarely', label: 'Rarement' },
                ].map(p => (
                  <label key={p.value} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(filters.prayerFrequency || []).includes(p.value)}
                      onChange={() => handleMultiSelectChange('prayerFrequency', p.value)}
                      className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Practice Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Niveau de Pratique</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'strict', label: 'Strict' },
                  { value: 'moderate', label: 'Modéré' },
                  { value: 'flexible', label: 'Flexible' },
                ].map(p => (
                  <label key={p.value} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(filters.practiceLevel || []).includes(p.value)}
                      onChange={() => handleMultiSelectChange('practiceLevel', p.value)}
                      className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hijab/Beard */}
            {searchGender === 'female' && (
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.wearsHijab || false}
                    onChange={(e) => handleFilterChange('wearsHijab', e.target.checked || undefined)}
                    className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">Porte le Hijab</span>
                </label>
              </div>
            )}

            {searchGender === 'male' && (
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.hasBeard || false}
                    onChange={(e) => handleFilterChange('hasBeard', e.target.checked || undefined)}
                    className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">Porte la barbe</span>
                </label>
              </div>
            )}

            {/* Marriage Expectations */}
            <h3 className="text-lg font-semibold text-white mb-4 mt-6">Attentes Matrimoniales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchGender === 'female' && (
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.acceptsPolygamy || false}
                    onChange={(e) => handleFilterChange('acceptsPolygamy', e.target.checked || undefined)}
                    className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">Accepte la polygamie</span>
                </label>
              )}

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.willingToRelocate || false}
                  onChange={(e) => handleFilterChange('willingToRelocate', e.target.checked || undefined)}
                  className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                />
                <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">Prêt(e) à déménager</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.wantsChildren || false}
                  onChange={(e) => handleFilterChange('wantsChildren', e.target.checked || undefined)}
                  className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                />
                <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">Souhaite des enfants</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={clearFilters}
                className="px-6 py-2 text-sm text-gray-400 hover:text-[#ff007f] transition-colors"
              >
                Effacer tout
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 btn-pink rounded-xl text-sm font-semibold"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff007f] mx-auto"></div>
          <p className="mt-4 text-gray-400">Recherche en cours...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Une erreur est survenue lors de la recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <ProfileCard
              key={user.id}
              user={user}
              isLiked={likedUsers.has(user.id)}
              onLike={() => handleLike(user.id)}
              canLike={canLike}
              hasActiveSubscription={hasActiveSubscription}
              isMale={isMale}
            />
          ))}
        </div>
      )}

      {users?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun résultat trouvé. Essayez de modifier vos filtres.</p>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Sauvegarder la recherche</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la recherche</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Ex: Profils Hanafi à Paris"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-[#ff007f]/30 bg-[#1a1a1a] text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
                />
                <span className="text-sm text-gray-300 group-hover:text-[#ff007f] transition-colors">
                  <Bell className="h-4 w-4 inline mr-1" />
                  M&apos;alerter par email quand un nouveau profil correspond
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-[#ff007f] hover:text-[#ff007f] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
                className="flex-1 btn-pink px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileCard({
  user,
  isLiked,
  onLike,
  canLike,
  hasActiveSubscription,
  isMale
}: {
  user: User
  isLiked: boolean
  onLike: () => void
  canLike: boolean
  hasActiveSubscription: boolean
  isMale: boolean
}) {
  const showFullProfile = !isMale || hasActiveSubscription

  return (
    <div className="glass-card overflow-hidden hover:border-[#ff007f] transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#ff007f] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {showFullProfile ? `${user.firstName} ${user.lastName}` : 'Profil Premium'}
              </h3>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="h-4 w-4 mr-1 text-[#ff007f]" />
                {showFullProfile ? (user.location || 'Non spécifié') : '••••••••••'}
              </div>
            </div>
          </div>
          <button
            onClick={onLike}
            disabled={!canLike}
            className={`p-2 rounded-full transition-all ${
              isLiked
                ? 'bg-[#ff007f] text-white'
                : canLike
                  ? 'text-gray-400 hover:text-[#ff007f] hover:bg-[#ff007f]/10'
                  : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {user.age && showFullProfile && (
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-2 text-[#ff007f]" />
              {user.age} ans
            </div>
          )}
          {user.bio && showFullProfile && (
            <p className="text-sm text-gray-400 line-clamp-2">{user.bio}</p>
          )}
          {!showFullProfile && (
            <div className="text-center py-4">
              <Lock className="h-8 w-8 text-[#ff007f] mx-auto mb-2" />
              <p className="text-sm text-gray-400">Abonnez-vous pour voir ce profil</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {showFullProfile ? (
            <>
              <button className="flex-1 btn-pink px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" />
                Contacter
              </button>
              <button className="p-3 text-gray-400 hover:text-[#ff007f] transition-colors border border-gray-600 rounded-xl hover:border-[#ff007f]">
                <MessageCircle className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link href="/premium" className="w-full btn-pink px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              S&apos;abonner
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
