'use client'

import Link from 'next/link'
import { Check, X, Crown, Sparkles, Heart, Shield } from 'lucide-react'

export default function PremiumPage() {
  const malePricing = [
    {
      name: 'Essai Gratuit',
      price: '0€',
      period: 'Première semaine',
      features: [
        { text: '3 likes par jour', included: true },
        { text: 'Photos floutées uniquement', included: true },
        { text: 'Pas de messagerie', included: false },
        { text: 'Profils limités', included: true },
      ],
      cta: 'Essayer gratuitement',
      popular: false,
      plan: 'free',
    },
    {
      name: 'Premium',
      price: '19,99€',
      period: 'par mois',
      features: [
        { text: 'Likes illimités', included: true },
        { text: 'Photos défloutées (si autorisé)', included: true },
        { text: 'Messagerie illimitée', included: true },
        { text: 'Badge "Profil Sérieux"', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Voir qui vous a liké', included: true },
      ],
      cta: 'S\'abonner maintenant',
      popular: true,
      plan: 'premium',
    },
    {
      name: 'Premium 3 Mois',
      price: '49€',
      period: 'pour 3 mois',
      savings: 'Économisez 11€',
      features: [
        { text: 'Tous les avantages Premium', included: true },
        { text: '16,33€ par mois', included: true },
        { text: 'Engagement sur 3 mois', included: true },
        { text: 'Meilleur rapport qualité/prix', included: true },
      ],
      cta: 'Choisir 3 mois',
      popular: false,
      plan: 'premium-3months',
    },
  ]

  const femalePricing = [
    {
      name: 'Gratuit',
      price: '0€',
      period: 'À vie',
      features: [
        { text: 'Accès complet illimité', included: true },
        { text: 'Messagerie sans restriction', included: true },
        { text: 'Photos à votre contrôle', included: true },
        { text: 'Support Tuteur 24/7', included: true },
        { text: 'Profil certifié', included: true },
      ],
      cta: 'S\'inscrire gratuitement',
      popular: true,
      plan: 'free',
    },
    {
      name: 'Boost Visibilité',
      price: '5€',
      period: 'par mois',
      features: [
        { text: 'Profil mis en avant', included: true },
        { text: 'Apparaître en premier', included: true },
        { text: '3x plus de visibilité', included: true },
        { text: 'Badge "Profil Actif"', included: true },
      ],
      cta: 'Booster mon profil',
      popular: false,
      plan: 'boost',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative">
      {/* Background effects */}
      <div className="hero-aura top-0 left-0"></div>
      <div className="hero-aura bottom-0 right-0"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-card rounded-full px-8 py-4 flex justify-between items-center shadow-2xl">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#ff007f] rounded-lg flex items-center justify-center text-white font-black text-xl">Z</div>
            <span className="text-xl font-bold tracking-widest text-white">Nissfi</span>
          </Link>
          <Link href="/login" className="btn-pink px-6 py-2 rounded-full text-xs font-black uppercase">Connexion</Link>
        </div>
      </nav>

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#ff007f]/10 border border-[#ff007f]/30 rounded-full px-6 py-2 mb-6">
              <Crown className="h-5 w-5 text-[#ff007f]" />
              <span className="text-sm font-bold text-[#ff007f] uppercase tracking-wider">Tarifs Premium</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Choisissez Votre <span className="text-[#ff007f]">Formule</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des tarifs transparents pour un service de qualité. Femmes gratuites, hommes premium pour garantir le sérieux.
            </p>
          </div>

          {/* Male Pricing */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">Pour les Frères</h2>
              <p className="text-gray-400">Investissez dans votre recherche avec un profil sérieux</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {malePricing.map((plan, index) => (
                <div
                  key={index}
                  className={`glass-card rounded-3xl p-8 relative ${
                    plan.popular ? 'border-2 border-[#ff007f] scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-[#ff007f] text-white text-xs font-black uppercase px-4 py-1 rounded-full">
                        Le Plus Populaire
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-end justify-center mb-2">
                      <span className="text-5xl font-black text-[#ff007f]">{plan.price}</span>
                    </div>
                    <p className="text-sm text-gray-400">{plan.period}</p>
                    {plan.savings && (
                      <div className="mt-2 inline-block bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
                        <span className="text-xs font-bold text-red-400">{plan.savings}</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-[#ff007f] flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/subscribe?plan=${plan.plan}&gender=male`}
                    className={`block w-full py-4 rounded-2xl font-black text-center uppercase text-sm transition-all ${
                      plan.popular
                        ? 'btn-pink'
                        : 'border-2 border-[#ff007f] text-[#ff007f] hover:bg-[#ff007f]/10'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Female Pricing */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">Pour les Sœurs</h2>
              <p className="text-gray-400">Accès gratuit avec option de boost optionnelle</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {femalePricing.map((plan, index) => (
                <div
                  key={index}
                  className={`glass-card rounded-3xl p-8 relative ${
                    plan.popular ? 'border-2 border-[#ff007f]' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-[#ff007f] text-white text-xs font-black uppercase px-4 py-1 rounded-full flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>Recommandé</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-end justify-center mb-2">
                      <span className="text-5xl font-black text-[#ff007f]">{plan.price}</span>
                    </div>
                    <p className="text-sm text-gray-400">{plan.period}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-[#ff007f] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/subscribe?plan=${plan.plan}&gender=female`}
                    className={`block w-full py-4 rounded-2xl font-black text-center uppercase text-sm transition-all ${
                      plan.popular
                        ? 'btn-pink'
                        : 'border-2 border-[#ff007f] text-[#ff007f] hover:bg-[#ff007f]/10'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Features Comparison */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Pourquoi Premium ?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#ff007f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-[#ff007f]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sérieux Garanti</h3>
                <p className="text-gray-400 text-sm">
                  Le paiement filtre naturellement les profils non-sérieux et garantit des intentions claires.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#ff007f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-[#ff007f]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sécurité Maximale</h3>
                <p className="text-gray-400 text-sm">
                  Vos données sont protégées et la modération est stricte. Pas de spammeurs ni de profils fake.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#ff007f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-[#ff007f]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Match de Qualité</h3>
                <p className="text-gray-400 text-sm">
                  Des profils vérifiés et détaillés pour des connexions authentiques et respectueuses.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Questions Fréquentes</h2>
            
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Pourquoi les femmes sont gratuites ?</h3>
                <p className="text-gray-400 text-sm">
                  Pour encourager un équilibre des genres sur la plateforme et faciliter leur recherche d&apos;un époux.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-gray-400 text-sm">
                  Oui, vous pouvez annuler à tout moment depuis votre profil. Pas de renouvellement automatique sans votre accord.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Les paiements sont-ils sécurisés ?</h3>
                <p className="text-gray-400 text-sm">
                  Absolument. Nous utilisons Stripe, leader mondial des paiements en ligne, avec chiffrement SSL.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Combien de temps pour trouver un match ?</h3>
                <p className="text-gray-400 text-sm">
                  En moyenne, les utilisateurs Premium trouvent des matches sérieux dans les 2-4 semaines.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center mt-20">
            <h2 className="text-4xl font-bold text-white mb-6">Prêt à Commencer ?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-pink px-10 py-5 rounded-2xl text-sm font-black uppercase"
              >
                Créer un compte
              </Link>
              <Link
                href="/login"
                className="border-2 border-[#ff007f] text-[#ff007f] px-10 py-5 rounded-2xl text-sm font-black uppercase hover:bg-[#ff007f]/10 transition-all"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
