import Link from "next/link";
import { Shield, Camera, Gem, Check, Star, Bell, Lock } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Aura d'arrière-plan */}
      <div className="hero-aura top-[-200px] left-[-100px]"></div>
      <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full px-4 md:px-8 py-4 flex justify-between items-center shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-red-600 rounded-lg flex items-center justify-center text-white font-black text-xl">Z</div>
            <span className="text-lg md:text-xl font-bold tracking-widest text-gray-900">Nissfi</span>
          </div>
          <div className="hidden lg:flex space-x-8 font-bold text-[10px] uppercase tracking-[0.2em] text-gray-600">
            <a href="#concept" className="hover:text-pink-600 transition-colors">Concept</a>
            <a href="#how-to-use" className="hover:text-pink-600 transition-colors">Comment utiliser</a>
            <a href="#Tuteur" className="hover:text-pink-600 transition-colors">Tuteur</a>
            
          </div>
          <Link href="/login" className="bg-gradient-to-r from-pink-600 to-red-600 hover:opacity-90 text-white px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase transition-all">Connexion</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div data-aos="fade-right" data-aos-duration="1000">
            <div className="inline-block border border-[#ff007f] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#ff007f] mb-6">
              Mariage Halal • Premium • Sécurisé
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-none mb-8 text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">L&apos;union</span> <br />
              <span className="pink-glow-text">D&apos;excellence</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mb-10 leading-relaxed max-w-md">
              Oubliez les standards. Vivez une expérience matrimoniale où la <strong>pudeur</strong> est magnifiée par la <strong>modernité</strong>.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link href="/register" className="btn-pink px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest">
                Rejoindre l&apos;élite
              </Link>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-800"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-700"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-600"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Rejoint par 15k+ membres</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center" data-aos="zoom-in" data-aos-duration="1200">
            <div className="relative z-10 floating">
              <div className="bg-[#1a1a1a] p-2 sm:p-3 rounded-[3rem] shadow-[0_0_50px_rgba(255,0,127,0.3)] border border-[#ff007f]/30">
                <div className="bg-black rounded-[2.5rem] w-[240px] sm:w-[280px] h-[500px] sm:h-[580px] overflow-hidden relative">
                  {/* App Header */}
                  <div className="p-6 pt-10 flex justify-between items-center">
                    <div className="text-white font-bold text-sm">Découvrir</div>
                    <Bell className="h-5 w-5 text-[#ff007f]" />
                  </div>
                  {/* Mock Profil */}
                  <div className="px-4">
                    <div className="h-80 bg-gray-900 rounded-3xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white font-bold text-lg">Yassine, 31</p>
                        <p className="text-[#ff007f] text-xs font-bold">Bruxelles • Entrepreneur</p>
                      </div>
                      {/* Photo Floutée Concept */}
                      <div className="absolute inset-0 backdrop-blur-xl bg-black/40 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-[#ff007f]" />
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="h-2 bg-gray-800 rounded-full w-full"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-2/3"></div>
                      <button className="w-full py-4 btn-pink rounded-2xl text-[10px] font-black uppercase mt-6">Envoyer un Salam</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Elements Neon */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff007f]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#ff007f]/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </header>

      {/* Comment Utiliser - Section Ultra Moderne */}
      <section id="how-to-use" className="py-16 sm:py-32 relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-100/50 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-20" data-aos="fade-up">
            <div className="inline-block border border-pink-300 bg-pink-50 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-pink-600 mb-6">
              Guide Complet
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Comment utiliser <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Nissfi</span> en 4 étapes
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-600 to-transparent mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Un parcours simplifié et sécurisé pour trouver votre moitié en respectant vos valeurs
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 via-pink-600 to-pink-200 -translate-x-1/2"></div>
            
            {/* Step 1 - Left */}
            <div className="grid lg:grid-cols-2 gap-12 mb-24" data-aos="fade-right" data-aos-duration="1000">
              <div className="lg:text-right lg:pr-16 flex flex-col justify-center">
                <div className="inline-block lg:ml-auto bg-pink-100 border border-pink-300 px-4 py-1 rounded-full text-xs font-black text-pink-700 mb-4 w-fit">
                  ÉTAPE 01
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">
                  Inscription & Profil
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Créez votre compte en quelques minutes. Renseignez vos informations de base, vos valeurs et vos critères de recherche. Pour les sœurs, l&apos;inscription est 100% gratuite.
                </p>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 shadow-sm">✨ Gratuit pour les femmes</span>
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 shadow-sm">🔒 Données sécurisées</span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white p-8 rounded-3xl border-2 border-pink-300 relative overflow-hidden group hover:border-pink-500 hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-pink-500/30">
                      1
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-pink-600" />
                        </div>
                        <span className="text-sm text-gray-800">Informations personnelles</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-pink-600" />
                        </div>
                        <span className="text-sm text-gray-800">Valeurs & Religion</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-pink-600" />
                        </div>
                        <span className="text-sm text-gray-800">Photos (floutées par défaut)</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Center Dot */}
                <div className="hidden lg:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-pink-600 rounded-full border-4 border-white shadow-lg shadow-pink-600/30"></div>
              </div>
            </div>

            {/* Step 2 - Right */}
            <div className="grid lg:grid-cols-2 gap-12 mb-24" data-aos="fade-left" data-aos-duration="1000">
              <div className="lg:order-2 flex flex-col justify-center">
                <div className="inline-block bg-pink-100 border border-pink-300 px-4 py-1 rounded-full text-xs font-black text-pink-700 mb-4 w-fit">
                  ÉTAPE 02
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">
                  Recherche & Découverte
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Parcourez les profils qui correspondent à vos critères. Utilisez nos filtres avancés pour affiner votre recherche : âge, ville, niveau d&apos;éducation, pratique religieuse...
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 shadow-sm">🎯 Filtres précis</span>
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 shadow-sm">👁️ Respect de la pudeur</span>
                </div>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-white p-8 rounded-3xl border-2 border-pink-300 relative overflow-hidden group hover:border-pink-500 hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-pink-500/30">
                      2
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-600">PROFILS SUGGÉRÉS</span>
                        <span className="text-xs text-pink-600 font-bold">99% Compatible</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-black/30 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-[#ff007f] flex items-center justify-center">
                              <Lock className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="h-2 bg-slate-700 rounded w-24 mb-2"></div>
                              <div className="h-2 bg-slate-800 rounded w-16"></div>
                            </div>
                            <Star className="h-5 w-5 text-[#ff007f]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Center Dot */}
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#ff007f] rounded-full border-4 border-black shadow-lg shadow-[#ff007f]/50"></div>
              </div>
            </div>

            {/* Step 3 - Left */}
            <div className="grid lg:grid-cols-2 gap-12 mb-24" data-aos="fade-right" data-aos-duration="1000">
              <div className="lg:text-right lg:pr-16 flex flex-col justify-center">
                <div className="inline-block lg:ml-auto bg-[#ff007f]/10 border border-[#ff007f]/30 px-4 py-1 rounded-full text-xs font-black text-[#ff007f] mb-4 w-fit">
                  ÉTAPE 03
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  Connexion avec Tuteur
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Pour les sœurs, chaque échange implique automatiquement votre Tuteur. Vous pouvez choisir un tuteur familial ou bénéficier de notre service Tuteur plateforme pour plus de confidentialité.
                </p>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-gray-300">👨‍👩‍👧 Tuteur familial</span>
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-gray-300">🛡️ Tuteur plateforme</span>
                </div>
              </div>
              <div className="relative">
                <div className="glass-card p-8 rounded-3xl border-2 border-[#ff007f]/30 relative overflow-hidden group hover:border-[#ff007f] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff007f]/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#ff007f] to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-[#ff007f]/50">
                      3
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-6 w-6 text-[#ff007f]" />
                        <span className="text-sm font-bold text-white">Protection Active</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-300">Tuteur notifié de chaque message</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-300">Validation des demandes</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-300">Modération en temps réel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Center Dot */}
                <div className="hidden lg:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#ff007f] rounded-full border-4 border-black shadow-lg shadow-[#ff007f]/50"></div>
              </div>
            </div>

            {/* Step 4 - Right */}
            <div className="grid lg:grid-cols-2 gap-12" data-aos="fade-left" data-aos-duration="1000">
              <div className="lg:order-2 flex flex-col justify-center">
                <div className="inline-block bg-[#ff007f]/10 border border-[#ff007f]/30 px-4 py-1 rounded-full text-xs font-black text-[#ff007f] mb-4 w-fit">
                  ÉTAPE 04
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  Échange & Mariage
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Une fois la connexion établie, échangez dans un environnement sécurisé et respectueux. Passez aux étapes suivantes : rencontre en famille, accord des Walis, et préparation du mariage halal.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-gray-300">💬 Chat modéré</span>
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-gray-300">🤝 Rencontre organisée</span>
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-gray-300">💍 Mariage halal</span>
                </div>
              </div>
              <div className="lg:order-1 relative">
                <div className="glass-card p-8 rounded-3xl border-2 border-[#ff007f]/30 relative overflow-hidden group hover:border-[#ff007f] transition-all duration-500">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-[#ff007f]/10 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#ff007f] to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-[#ff007f]/50">
                      4
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Bell className="h-5 w-5 text-[#ff007f]" />
                          <span className="text-sm font-bold text-white">Étapes du processus</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                            <span className="text-xs text-gray-400">Échanges initiaux</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                            <span className="text-xs text-gray-400">Accord mutuel</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#ff007f]/20 border-2 border-[#ff007f] flex items-center justify-center animate-pulse">
                              <div className="w-2 h-2 bg-[#ff007f] rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-300 font-bold">Rencontre en famille</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700/50 border-2 border-slate-600"></div>
                            <span className="text-xs text-gray-500">Préparation mariage</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center py-4 px-6 bg-gradient-to-r from-[#ff007f] to-pink-600 rounded-xl">
                        <span className="text-sm font-black text-white">💝 Votre histoire commence ici</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Center Dot */}
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#ff007f] rounded-full border-4 border-black shadow-lg shadow-[#ff007f]/50"></div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-20" data-aos="zoom-in" data-aos-delay="200">
            <Link 
              href="/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff007f] to-pink-600 px-12 py-6 rounded-2xl text-white font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all duration-300 group"
            >
              <span>Commencer maintenant</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <p className="text-gray-500 text-sm mt-4">Rejoignez 15,000+ membres en quête d&apos;une union halal</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="concept" className="py-16 sm:py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">L&apos;ADN <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Nissfi</span></h2>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-600 to-purple-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all group" data-aos="fade-up">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 text-2xl mb-8 group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Protection Tuteur</h3>
              <p className="text-gray-700 leading-relaxed">Le premier système au monde d&apos;intégration native du tuteur dans vos échanges.</p>
            </div>
            <div className="bg-white p-10 rounded-[2rem] border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all group" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 text-2xl mb-8 group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Pudeur Visuelle</h3>
              <p className="text-gray-700 leading-relaxed">Vos photos ne sont révélées qu&apos;avec votre consentement explicite.</p>
            </div>
            <div className="bg-white p-10 rounded-[2rem] border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all group" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 text-2xl mb-8 group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Gem className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Qualité Élite</h3>
              <p className="text-gray-700 leading-relaxed">Une communauté de profils vérifiés, éduqués et engagés dans leur Deen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tuteur - Innovation Unique */}
      <section id="Tuteur" className="py-16 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Background Effect */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-100/50 rounded-full blur-[150px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-20" data-aos="fade-up">
            <div className="inline-block border border-purple-300 bg-purple-50 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-purple-700 mb-6">
              Innovation Mondiale
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Le système <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500">Tuteur</span>
              <br />révolutionnaire
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
              Nissfi est la première plateforme au monde à intégrer nativement le rôle du tuteur (Tuteur) 
              dans le processus matrimonial, garantissant respect, pudeur et conformité islamique.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left - Explanation */}
            <div data-aos="fade-right" data-aos-duration="1000">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                Pourquoi le Tuteur est essentiel ?
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Dans l&apos;Islam, le Tuteur (tuteur) joue un rôle fondamental dans le mariage d&apos;une femme. 
                Il assure sa protection, valide les prétendants et garantit que le processus respecte 
                les principes islamiques.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-all">
                      <Shield className="h-6 w-6 text-purple-600 group-hover:text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Protection spirituelle</h4>
                    <p className="text-sm text-gray-700">Le Tuteur veille à ce que le mariage soit conforme aux enseignements islamiques</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-all">
                      <Check className="h-6 w-6 text-purple-600 group-hover:text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Validation des prétendants</h4>
                    <p className="text-sm text-gray-700">Chaque demande est approuvée par le Tuteur avant tout échange</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-all">
                      <Bell className="h-6 w-6 text-purple-600 group-hover:text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Supervision continue</h4>
                    <p className="text-sm text-gray-700">Le Tuteur reçoit des notifications et peut intervenir à tout moment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual Demo */}
            <div data-aos="fade-left" data-aos-duration="1000">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white p-8 rounded-3xl border-2 border-purple-300 relative overflow-hidden hover:shadow-xl transition-all">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">Système Tuteur Actif</h4>
                        <p className="text-sm text-purple-600">Protection en temps réel</p>
                      </div>
                    </div>

                    {/* Workflow Visualization */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-900">Demande reçue</span>
                          <span className="text-xs text-gray-600">Il y a 2 min</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-300 rounded w-32 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                            En attente
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-300 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-purple-900">Tuteur - Ahmed</div>
                            <div className="text-xs text-purple-700">Tuteur familial</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                            Approuver
                          </button>
                          <button className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                            Refuser
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="h-4 w-4" />
                        <span className="text-xs font-bold">Sécurité maximale garantie</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-500/20 rounded-2xl rotate-12 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#ff007f]/20 rounded-2xl -rotate-12 animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>

          {/* Two Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-16" data-aos="fade-up">
            {/* Tuteur Familial */}
            <div className="glass-card p-8 rounded-3xl border-2 border-slate-700/50 hover:border-purple-500/50 transition-all group">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-all">
                <span className="text-3xl group-hover:scale-110 transition-transform">👨‍👩‍👧</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Tuteur Familial</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Invitez votre père, frère ou oncle à superviser vos échanges. Il recevra toutes les 
                notifications et pourra approuver ou refuser les demandes.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="h-4 w-4 text-purple-400" />
                  Contrôle familial total
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="h-4 w-4 text-purple-400" />
                  Notifications en temps réel
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="h-4 w-4 text-purple-400" />
                  100% gratuit
                </li>
              </ul>
              <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
                <span className="text-purple-400 font-bold text-sm">Recommandé par défaut</span>
              </div>
            </div>

            {/* Tuteur Plateforme */}
            <div className="glass-card p-8 rounded-3xl border-2 border-[#ff007f]/30 hover:border-[#ff007f] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff007f]/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#ff007f]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#ff007f] transition-all">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🛡️</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold text-white">Tuteur Plateforme</h3>
                  <span className="px-2 py-1 bg-[#ff007f]/20 text-[#ff007f] text-[8px] font-black rounded uppercase">Premium</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Pour plus de confidentialité, Nissfi met à disposition un Tuteur certifié qui supervisera 
                  vos échanges de manière professionnelle et discrète.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-[#ff007f]" />
                    Tuteur professionnel certifié
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-[#ff007f]" />
                    Confidentialité familiale
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-[#ff007f]" />
                    Disponibilité 24/7
                  </li>
                </ul>
                <div className="px-4 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 rounded-xl text-center">
                  <span className="text-white font-bold text-sm">Service premium disponible</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center" data-aos="zoom-in">
            <Link 
              href="/demo"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-[#ff007f] to-pink-600 px-12 py-6 rounded-2xl text-white font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group"
            >
              <span>Découvrir en démo interactive</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <p className="text-gray-500 text-sm mt-4">Testez le système Tuteur en conditions réelles</p>
          </div>
        </div>
      </section>

      {/* Pricing Noir & Rose */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Sœurs */}
            <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden group" data-aos="fade-right">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff007f]/5 rounded-full -translate-y-16 translate-x-16"></div>
              <h3 className="text-3xl font-bold mb-2">SŒURS</h3>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-8">Gratuité Totale</p>
              <div className="text-5xl font-black mb-10">0€<span className="text-sm text-gray-600">/mois</span></div>
              <ul className="space-y-6 mb-12 text-gray-400">
                <li><Check className="h-4 w-4 text-[#ff007f] mr-3" /> Accès illimité</li>
                <li><Check className="h-4 w-4 text-[#ff007f] mr-3" /> Support Tuteur 24/7</li>
                <li><Check className="h-4 w-4 text-[#ff007f] mr-3" /> Profil certifié</li>
              </ul>
              <Link href="/register" className="w-full py-5 border border-[#ff007f] text-[#ff007f] rounded-2xl font-black uppercase tracking-widest hover:bg-[#ff007f] hover:text-white transition-all block text-center">S&apos;inscrire</Link>
            </div>

            {/* Frères */}
            <div className="bg-[#ff007f] p-12 rounded-[3rem] text-white shadow-[0_20px_60px_rgba(255,0,127,0.4)] transform lg:scale-105" data-aos="fade-left">
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-bold mb-2">FRÈRES</h3>
                <span className="bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Sérieux</span>
              </div>
              <p className="text-white/70 uppercase tracking-widest text-[10px] font-black mb-8">Engagement Premium</p>
              <div className="text-5xl font-black mb-10">Premium</div>
              <ul className="space-y-6 mb-12 text-white/90">
                <li><Star className="h-4 w-4 text-black mr-3" /> Badge de Vérification</li>
                <li><Star className="h-4 w-4 text-black mr-3" /> Messagerie illimitée</li>
                <li><Star className="h-4 w-4 text-black mr-3" /> Filtres avancés</li>
              </ul>
              <button className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Découvrir les offres</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card rounded-[4rem] p-16 text-center border-t-4 border-[#ff007f]">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 italic">Votre moitié vous <span className="text-[#ff007f]">attend.</span></h2>
            <p className="text-gray-500 mb-12 max-w-xl mx-auto">Rejoignez une communauté qui partage vos valeurs et vos ambitions de vie.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/register" className="btn-pink px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest">
                Rejoindre Maintenant 
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#ff007f] rounded flex items-center justify-center text-white font-black text-sm">Z</div>
            <span className="text-lg font-bold tracking-tighter">Nissfi</span>
          </div>
          <div className="flex space-x-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Tuteur Guide</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[10px] text-gray-800 font-bold uppercase tracking-[0.4em]">
            &copy; 2024 Nissfi . TOUS DROITS RÉSERVÉS.
          </div>
        </div>
      </footer>
    </div>
  );
}
