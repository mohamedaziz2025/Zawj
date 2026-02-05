'use client'

import Link from 'next/link'
import { Check, Crown, Star } from 'lucide-react'

export default function SubscribePage() {
  const plans = [
    {
      name: 'Basic',
      price: '9.99€',
      period: '/mois',
      features: [
        'Voir les photos des profils',
        'Messages illimités',
        'Filtres avancés',
        'Support prioritaire'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '19.99€',
      period: '/mois',
      features: [
        'Tout du Basic',
        'Badge Premium',
        'Super likes illimités',
        'Voir qui vous a liké',
        'Mode invisible'
      ],
      popular: true
    },
    {
      name: 'VIP',
      price: '39.99€',
      period: '/mois',
      features: [
        'Tout du Premium',
        'Matching prioritaire',
        'Conseils personnalisés',
        'Accès aux événements',
        'Service Tuteur premium'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Rejoignez l'<span className="text-[#ff007f]">élite</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Débloquez tout le potentiel de Nissfi avec nos abonnements premium
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-b from-[#1a1a1a] to-[#151515] rounded-2xl shadow-2xl border-2 ${
                plan.popular
                  ? 'border-[#ff007f] shadow-[#ff007f]/20'
                  : 'border-white/10'
              } p-8 hover:scale-105 transition-transform duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg shadow-[#ff007f]/30">
                    <Crown className="h-4 w-4 mr-1" />
                    Plus populaire
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#ff4d94] hover:shadow-lg hover:shadow-[#ff007f]/30 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.popular ? 'Commencer maintenant' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Questions sur nos abonnements ?
          </p>
          <Link
            href="/contact"
            className="text-[#ff007f] hover:text-[#ff4d94] font-semibold"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
