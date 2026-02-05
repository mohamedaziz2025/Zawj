'use client'

import { useState } from 'react'
import { Send, Mail, MessageSquare, MapPin, Phone } from 'lucide-react'
import { contactApi } from '@/lib/api/contact'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await contactApi.submit(formData)
      setIsSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ff007f] to-[#ff4d94] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#ff007f]/30">
              Z
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Contactez-<span className="text-[#ff007f]">nous</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider
          </p>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-xl text-green-300 text-center">
            ✅ Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300 text-center">
            ❌ {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-[#ff007f]/20 rounded-xl flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-[#ff007f]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-gray-400 text-sm mb-2">
                Envoyez-nous un email et nous vous répondrons sous 24h
              </p>
              <a
                href="mailto:support@Nissfi.com"
                className="text-[#ff007f] hover:text-[#ff4d94] font-medium text-sm"
              >
                support@Nissfi.com
              </a>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-[#ff007f]/20 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-[#ff007f]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Chat en direct</h3>
              <p className="text-gray-400 text-sm mb-2">
                Discutez avec notre équipe de support en temps réel
              </p>
              <button className="text-[#ff007f] hover:text-[#ff4d94] font-medium text-sm">
                Démarrer une conversation
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-[#ff007f]/20 rounded-xl flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-[#ff007f]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Téléphone</h3>
              <p className="text-gray-400 text-sm mb-2">
                Appelez-nous du lundi au vendredi de 9h à 18h
              </p>
              <a
                href="tel:+33123456789"
                className="text-[#ff007f] hover:text-[#ff4d94] font-medium text-sm"
              >
                +33 1 23 45 67 89
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Envoyez-nous un message
              </h2>

              {isSuccess && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-medium">
                    ✓ Message envoyé avec succès ! Nous vous répondrons bientôt.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="Tuteur">Questions sur le Tuteur</option>
                    <option value="account">Problème de compte</option>
                    <option value="feature">Suggestion de fonctionnalité</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white font-semibold rounded-xl shadow-lg shadow-[#ff007f]/30 hover:shadow-[#ff007f]/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 text-center">
                  En envoyant ce formulaire, vous acceptez que nous utilisions vos
                  données pour vous répondre.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">
                Comment fonctionne le service Tuteur plateforme ?
              </h3>
              <p className="text-gray-400 text-sm">
                Notre service Tuteur plateforme est disponible pour les femmes sans tuteur
                familial disponible. Pour 5€/mois, nous assurons la supervision de vos
                conversations conformément aux principes islamiques.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">
                Les abonnements sont-ils sans engagement ?
              </h3>
              <p className="text-gray-400 text-sm">
                Oui, tous nos abonnements sont sans engagement. Vous pouvez annuler à
                tout moment depuis votre espace paramètres.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">
                Comment vérifiez-vous les profils ?
              </h3>
              <p className="text-gray-400 text-sm">
                Nous vérifions l'identité de chaque utilisateur via une pièce d'identité
                et un selfie. Les profils vérifiés reçoivent un badge bleu.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">
                Mes données sont-elles sécurisées ?
              </h3>
              <p className="text-gray-400 text-sm">
                Absolument. Nous utilisons un chiffrement de bout en bout et respectons
                le RGPD. Vos données personnelles ne sont jamais partagées avec des tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
