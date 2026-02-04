'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'

interface FormData {
  // Step 1: État Civil
  firstName: string
  lastName: string
  email: string
  password: string
  age: number
  dateOfBirth: string
  city: string
  country: string
  nationality: string
  profession: string
  education: string
  gender: 'male' | 'female'
  
  // Step 2: Religieux
  religiousInfo: {
    prayerFrequency: 'always' | 'often' | 'sometimes' | 'rarely' | 'never' | ''
    madhab: 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'other' | 'none' | ''
    practiceLevel: 'strict' | 'moderate' | 'flexible' | ''
    wearsHijab?: boolean
    hasBeard?: boolean
    quranMemorization: 'none' | 'few-surahs' | 'juz' | 'multiple-juz' | 'hafiz' | ''
    islamicEducation?: string
  }
  
  // Step 3: Attentes
  marriageExpectations: {
    acceptsPolygamy?: boolean
    wantsPolygamy?: boolean
    willingToRelocate?: boolean
    preferredCountries?: string[]
    wantsChildren?: boolean
    numberOfChildrenDesired?: number
  }
  
  // Tuteur pour femmes
  waliInfo?: {
    fullName: string
    relationship: 'father' | 'brother' | 'uncle' | 'grandfather' | 'imam' | 'trusted-community-member' | ''
    email: string
    phone?: string
    hasAccessToDashboard: boolean
    notifyOnNewMessage: boolean
  }
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useAuthStore()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: 18,
    dateOfBirth: '',
    city: '',
    country: '',
    nationality: '',
    profession: '',
    education: '',
    gender: 'male',
    religiousInfo: {
      prayerFrequency: '',
      madhab: '',
      practiceLevel: '',
      quranMemorization: '',
    },
    marriageExpectations: {},
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name.startsWith('religiousInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        religiousInfo: { ...prev.religiousInfo, [field]: type === 'checkbox' ? checked : value }
      }))
    } else if (name.startsWith('marriageExpectations.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        marriageExpectations: { ...prev.marriageExpectations, [field]: type === 'checkbox' ? checked : value }
      }))
    } else if (name.startsWith('waliInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        waliInfo: { ...prev.waliInfo!, [field]: type === 'checkbox' ? checked : value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authApi.register(formData as any)
      setUser(response.user)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: État Civil
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">État Civil</h3>
        <p className="text-sm text-gray-700">Vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe *</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-4 py-3 pr-12 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-700 hover:text-[#ff007f]"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          >
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Âge *</label>
          <input
            name="age"
            type="number"
            min="18"
            max="100"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ville *</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pays *</label>
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nationalité *</label>
          <input
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Profession *</label>
          <input
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Niveau d&apos;études</label>
        <select
          name="education"
          value={formData.education}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        >
          <option value="">Sélectionnez...</option>
          <option value="high-school">Baccalauréat</option>
          <option value="bachelor">Licence / Bachelor</option>
          <option value="master">Master</option>
          <option value="phd">Doctorat</option>
          <option value="other">Autre</option>
        </select>
      </div>
    </div>
  )

  // Step 2: Religieux
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pratique Religieuse</h3>
        <p className="text-sm text-gray-700">Votre relation avec l&apos;Islam</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence de Prière *</label>
        <select
          name="religiousInfo.prayerFrequency"
          value={formData.religiousInfo.prayerFrequency}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        >
          <option value="">Sélectionnez...</option>
          <option value="always">Toujours (5 prières/jour)</option>
          <option value="often">Souvent (3-4 prières/jour)</option>
          <option value="sometimes">Parfois (1-2 prières/jour)</option>
          <option value="rarely">Rarement</option>
          <option value="never">Jamais</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Madhab (École Juridique) *</label>
        <select
          name="religiousInfo.madhab"
          value={formData.religiousInfo.madhab}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        >
          <option value="">Sélectionnez...</option>
          <option value="hanafi">Hanafi</option>
          <option value="maliki">Maliki</option>
          <option value="shafii">Shafi&apos;i</option>
          <option value="hanbali">Hanbali</option>
          <option value="other">Autre</option>
          <option value="none">Aucun en particulier</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Niveau de Pratique *</label>
        <select
          name="religiousInfo.practiceLevel"
          value={formData.religiousInfo.practiceLevel}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        >
          <option value="">Sélectionnez...</option>
          <option value="strict">Strict (applique tous les piliers)</option>
          <option value="moderate">Modéré (pratique régulière)</option>
          <option value="flexible">Flexible (en apprentissage)</option>
        </select>
      </div>

      {formData.gender === 'female' && (
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="religiousInfo.wearsHijab"
              checked={formData.religiousInfo.wearsHijab || false}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#ff007f]/30 bg-white text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
            />
            <span className="text-sm text-gray-300">Je porte le Hijab</span>
          </label>
        </div>
      )}

      {formData.gender === 'male' && (
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="religiousInfo.hasBeard"
              checked={formData.religiousInfo.hasBeard || false}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#ff007f]/30 bg-white text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
            />
            <span className="text-sm text-gray-300">Je porte la barbe</span>
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Mémorisation du Coran</label>
        <select
          name="religiousInfo.quranMemorization"
          value={formData.religiousInfo.quranMemorization}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        >
          <option value="none">Aucune</option>
          <option value="few-surahs">Quelques sourates</option>
          <option value="juz">Un Juz (1/30)</option>
          <option value="multiple-juz">Plusieurs Juz</option>
          <option value="hafiz">Hafiz (tout le Coran)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Formation Islamique</label>
        <textarea
          name="religiousInfo.islamicEducation"
          value={formData.religiousInfo.islamicEducation || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Ex: Diplômé de l'institut Al-Azhar, cours du soir à la mosquée..."
          className="w-full px-4 py-3 bg-white border border-[#ff007f]/30 rounded-xl text-gray-900 placeholder-gray-500 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
        />
      </div>
    </div>
  )

  // Step 3: Attentes matrimoniales
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Attentes Matrimoniales</h3>
        <p className="text-sm text-gray-700">Vos critères pour le mariage</p>
      </div>

      <div className="bg-white border border-[#ff007f]/30 rounded-xl p-6 space-y-4">
        {formData.gender === 'female' ? (
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="marriageExpectations.acceptsPolygamy"
                checked={formData.marriageExpectations.acceptsPolygamy || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
              />
              <span className="text-sm text-gray-300">J&apos;accepte la polygamie</span>
            </label>
          </div>
        ) : (
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="marriageExpectations.wantsPolygamy"
                checked={formData.marriageExpectations.wantsPolygamy || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
              />
              <span className="text-sm text-gray-300">Je souhaite la polygamie</span>
            </label>
          </div>
        )}

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="marriageExpectations.willingToRelocate"
              checked={formData.marriageExpectations.willingToRelocate || false}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
            />
            <span className="text-sm text-gray-300">Prêt(e) à déménager</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="marriageExpectations.wantsChildren"
              checked={formData.marriageExpectations.wantsChildren || false}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
            />
            <span className="text-sm text-gray-300">Je souhaite avoir des enfants</span>
          </label>
        </div>

        {formData.marriageExpectations.wantsChildren && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d&apos;enfants souhaités</label>
            <input
              type="number"
              name="marriageExpectations.numberOfChildrenDesired"
              min="1"
              max="10"
              value={formData.marriageExpectations.numberOfChildrenDesired || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
            />
          </div>
        )}
      </div>

      {/* Tuteur Information for Women */}
      {formData.gender === 'female' && (
        <div className="bg-white border border-[#ff007f]/30 rounded-xl p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations du Tuteur (Tuteur)</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet du Tuteur *</label>
            <input
              name="waliInfo.fullName"
              value={formData.waliInfo?.fullName || ''}
              onChange={handleChange}
              required={formData.gender === 'female'}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Relation *</label>
            <select
              name="waliInfo.relationship"
              value={formData.waliInfo?.relationship || ''}
              onChange={handleChange}
              required={formData.gender === 'female'}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
            >
              <option value="">Sélectionnez...</option>
              <option value="father">Père</option>
              <option value="brother">Frère</option>
              <option value="uncle">Oncle</option>
              <option value="grandfather">Grand-père</option>
              <option value="imam">Imam</option>
              <option value="trusted-community-member">Membre de confiance de la communauté</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email du Tuteur *</label>
            <input
              name="waliInfo.email"
              type="email"
              value={formData.waliInfo?.email || ''}
              onChange={handleChange}
              required={formData.gender === 'female'}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone du Tuteur</label>
            <input
              name="waliInfo.phone"
              type="tel"
              value={formData.waliInfo?.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-[#ff007f]/30 rounded-xl text-gray-900 focus:border-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20 transition-all"
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-[#ff007f]/20">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="waliInfo.hasAccessToDashboard"
                checked={formData.waliInfo?.hasAccessToDashboard || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
              />
              <span className="text-sm text-gray-300">Donner accès au dashboard (le Tuteur peut voir mes conversations)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="waliInfo.notifyOnNewMessage"
                checked={formData.waliInfo?.notifyOnNewMessage ?? true}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[#ff007f]/30 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-[#ff007f] focus:ring-2 focus:ring-[#ff007f]/20"
              />
              <span className="text-sm text-gray-300">Notifier par email à chaque nouveau message</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Background effects */}
      <div className="hero-aura top-0 left-0"></div>
      <div className="hero-aura bottom-0 right-0"></div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 bg-[#ff007f] rounded-lg flex items-center justify-center text-gray-900 font-black text-2xl">Z</div>
                <span className="text-2xl font-bold tracking-widest text-gray-900">Nissfi</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-700">Rejoignez la plateforme matrimoniale halal</p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step >= s ? 'bg-[#ff007f] border-[#ff007f] text-gray-900' : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                      step > s ? 'bg-[#ff007f]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>État Civil</span>
              <span>Religieux</span>
              <span>Attentes</span>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card rounded-2xl p-8 mb-6">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-6 py-3 border border-[#ff007f] text-[#ff007f] rounded-xl font-semibold hover:bg-[#ff007f]/10 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Précédent</span>
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="submit"
                    className="ml-auto flex items-center space-x-2 px-8 py-3 btn-pink rounded-xl font-semibold"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-8 py-3 btn-pink rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Inscription...' : 'Créer mon compte'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-700">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-[#ff007f] hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
