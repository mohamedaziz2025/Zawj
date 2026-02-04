"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Heart, X, Shield, Check, Star, 
  MessageCircle, Lock, Unlock, Crown, Sparkles,
  Bell, Camera, User, Settings
} from "lucide-react";

// ===========================
// FAKE DATA
// ===========================

const FAKE_PROFILES = [
  {
    id: 1,
    name: "Amira",
    age: 26,
    city: "Paris",
    profession: "Architecte",
    bio: "Recherche une personne pieuse et ambitieuse pour construire un foyer halal.",
    religion: "Pratiquante",
    education: "Master",
    imageBlurred: true,
    compatibility: 95
  },
  {
    id: 2,
    name: "Yasmine",
    age: 24,
    city: "Lyon",
    profession: "Médecin",
    bio: "Passionnée par mon Deen et mon travail. Cherche quelqu'un de sérieux.",
    religion: "Pratiquante",
    education: "Doctorat",
    imageBlurred: true,
    compatibility: 92
  },
  {
    id: 3,
    name: "Leila",
    age: 28,
    city: "Marseille",
    profession: "Enseignante",
    bio: "Simple et authentique, je cherche une union basée sur les valeurs islamiques.",
    religion: "Pratiquante",
    education: "Licence",
    imageBlurred: true,
    compatibility: 88
  },
  {
    id: 4,
    name: "Sofia",
    age: 25,
    city: "Bruxelles",
    profession: "Entrepreneure",
    bio: "Ambitieuse et pieuse, je souhaite fonder une famille équilibrée.",
    religion: "Très pratiquante",
    education: "Master",
    imageBlurred: true,
    compatibility: 97
  }
];

const FAKE_MESSAGES = [
  {
    id: 1,
    from: "Amira",
    content: "Salam alaykoum, j'ai apprécié votre profil",
    time: "Il y a 5 min",
    status: "pending"
  },
  {
    id: 2,
    from: "Yasmine",
    content: "Wa alaykoum salam, votre parcours est inspirant",
    time: "Il y a 1h",
    status: "approved"
  }
];

// ===========================
// MAIN COMPONENT
// ===========================

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<"brother" | "sister" | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  
  // Step 2: Profile Discovery
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likesUsedToday, setLikesUsedToday] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPhotoRequest, setShowPhotoRequest] = useState(false);
  
  // Step 3: Tuteur System
  const [waliType, setWaliType] = useState<"family" | "platform" | null>(null);
  const [showWaliNotification, setShowWaliNotification] = useState(false);
  const [waliDecision, setWaliDecision] = useState<"pending" | "approved" | "rejected">("pending");
  
  // Step 4: Chat
  const [messages, setMessages] = useState(FAKE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [showWaliWarning, setShowWaliWarning] = useState(false);
  
  // Step 5: Premium
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);

  const DAILY_LIKE_LIMIT = 3;
  const currentProfile = FAKE_PROFILES[currentProfileIndex];

  // ===========================
  // HANDLERS
  // ===========================

  const handleLike = () => {
    if (!isPremium && likesUsedToday >= DAILY_LIKE_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setLikedProfiles([...likedProfiles, currentProfile.id]);
    if (!isPremium) {
      setLikesUsedToday(likesUsedToday + 1);
    }

    // Simulate Tuteur notification
    if (userType === "sister") {
      setShowWaliNotification(true);
      setTimeout(() => setShowWaliNotification(false), 3000);
    }

    // Move to next profile
    if (currentProfileIndex < FAKE_PROFILES.length - 1) {
      setTimeout(() => setCurrentProfileIndex(currentProfileIndex + 1), 500);
    } else {
      setTimeout(() => setCurrentStep(3), 1000);
    }
  };

  const handleSkip = () => {
    if (currentProfileIndex < FAKE_PROFILES.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0);
    }
  };

  const handlePhotoRequest = () => {
    setShowPhotoRequest(true);
    if (userType === "sister") {
      setTimeout(() => {
        setShowWaliNotification(true);
        setTimeout(() => setShowWaliNotification(false), 3000);
      }, 1000);
    }
  };

  const handleWaliApprove = () => {
    setWaliDecision("approved");
    setTimeout(() => setCurrentStep(4), 1500);
  };

  const handleWaliReject = () => {
    setWaliDecision("rejected");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      from: "Vous",
      content: newMessage,
      time: "À l'instant",
      status: userType === "sister" ? "pending" : "approved"
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    if (userType === "sister") {
      setShowWaliWarning(true);
      setTimeout(() => setShowWaliWarning(false), 3000);
    }
  };

  const handleUpgradeToPremium = () => {
    setIsPremium(true);
    setLikesUsedToday(0);
    setShowLimitModal(false);
    setShowPremiumFeatures(true);
    setTimeout(() => setShowPremiumFeatures(false), 4000);
  };

  // ===========================
  // RENDER STEPS
  // ===========================

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-block bg-purple-100 border border-purple-300 px-4 sm:px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-700 mb-6">
          Étape 1/5 - Commencer
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-gray-900">
          Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">ZAWJ</span>
        </h1>
        <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12">
          Découvrez comment fonctionne notre plateforme matrimoniale halal avec protection Tuteur intégrée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Frère */}
        <button
          onClick={() => {
            setUserType("brother");
            setCurrentStep(2);
          }}
          className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all group text-left"
        >
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-pink-600 transition-all">
            <User className="h-8 sm:h-10 w-8 sm:w-10 text-pink-600 group-hover:text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Je suis un Frère</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Découvrez les profils et initiez des conversations avec l'approbation du Tuteur
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-pink-600" />
              Accès premium requis
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-pink-600" />
              Profils vérifiés
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-pink-600" />
              Respect du processus Tuteur
            </li>
          </ul>
          <div className="text-pink-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
            Continuer en tant que Frère
            <span>→</span>
          </div>
        </button>

        {/* Sœur */}
        <button
          onClick={() => {
            setUserType("sister");
            setCurrentStep(2);
          }}
          className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all group text-left"
        >
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-purple-500 transition-all">
            <User className="h-8 sm:h-10 w-8 sm:w-10 text-purple-600 group-hover:text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Je suis une Sœur</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Recevez des demandes protégées par votre Tuteur et gardez le contrôle total
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-purple-600" />
              100% Gratuit
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-purple-600" />
              Protection Tuteur automatique
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-purple-600" />
              Photos floutées par défaut
            </li>
          </ul>
          <div className="text-purple-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
            Continuer en tant que Sœur
            <span>→</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    // Expérience différente pour les sœurs : elles reçoivent des demandes
    if (userType === "sister") {
      return (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 mb-6">
              Étape 2/5 - Demandes reçues
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Vos demandes <span className="text-purple-600">protégées</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              En tant que sœur, vous recevez des demandes qui seront filtrées par votre Tuteur. 
              Vos photos restent floutées jusqu'à ce que vous donniez votre accord explicite.
            </p>
          </div>

          {/* Received Requests */}
          <div className="max-w-3xl mx-auto space-y-6 mb-12">
            {/* Request 1 */}
            <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-6 rounded-3xl border-2 border-gray-300/50 hover:border-purple-500/50 transition-all">
              <div className="flex items-start gap-6">
                {/* Profile Picture (blurred) */}
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 overflow-hidden">
                  <div className="absolute inset-0 backdrop-blur-xl bg-gray-100 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Mohammed, 32</h3>
                      <p className="text-purple-600 font-semibold mb-2">Ingénieur • Paris</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                          Pratiquant
                        </span>
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                          Master
                        </span>
                        <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-lg">
                          <Star className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-bold">94% Compatible</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-bold">
                      Nouvelle
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    Salam alaykoum, j'ai été impressionné par votre profil et vos valeurs. 
                    Je serais honoré de faire connaissance avec l'accord de votre Tuteur.
                  </p>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-300">Protection Tuteur Active</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      Cette demande sera transmise à votre Tuteur pour validation avant tout échange
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-[#ff007f] text-gray-900 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Transmettre au Tuteur
                    </button>
                    <button className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-red-500 transition-all">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Request 2 */}
            <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-6 rounded-3xl border-2 border-gray-300/50 hover:border-purple-500/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex-shrink-0 overflow-hidden">
                  <div className="absolute inset-0 backdrop-blur-xl bg-gray-100 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Karim, 29</h3>
                      <p className="text-purple-600 font-semibold mb-2">Médecin • Lyon</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                          Très pratiquant
                        </span>
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                          Doctorat
                        </span>
                        <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-lg">
                          <Star className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-bold">91% Compatible</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-bold">
                      Il y a 2h
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    Wa alaykoum salam, votre parcours et vos valeurs résonnent avec ce que je recherche. 
                    Serait-il possible d'échanger avec la supervision de votre tuteur ?
                  </p>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-300">Protection Tuteur Active</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      Votre Tuteur validera cette demande avant tout contact
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-[#ff007f] text-gray-900 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Transmettre au Tuteur
                    </button>
                    <button className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-red-500 transition-all">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-6 rounded-2xl border border-purple-500/30">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Comment ça fonctionne pour vous
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong className="text-gray-900">100% gratuit</strong> - Accès illimité sans frais
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong className="text-gray-900">Photos protégées</strong> - Vos photos restent floutées par défaut
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong className="text-gray-900">Tuteur obligatoire</strong> - Chaque demande passe par votre tuteur
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong className="text-gray-900">Contrôle total</strong> - Vous décidez qui peut vous voir et vous contacter
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-pink-600 transition-all"
            >
              ← Retour
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
            >
              Étape suivante →
            </button>
          </div>
        </div>
      );
    }

    // Expérience pour les frères : découverte active de profils
    return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 mb-6">
          Étape 2/5 - Découverte
        </div>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Découvrez les profils compatibles
        </h2>
        <p className="text-gray-700">
          Respectez la pudeur en demandant l'autorisation pour voir les photos
        </p>
      </div>

      {/* Premium Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsPremium(!isPremium)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
            isPremium
              ? "bg-gradient-to-r from-[#ff007f] to-pink-600 text-white"
              : "bg-gray-100 border border-gray-300 text-gray-700 hover:border-pink-600"
          }`}
        >
          <Crown className="h-5 w-5" />
          {isPremium ? "Mode Premium Actif" : "Activer Premium (Démo)"}
        </button>
      </div>

      {/* Like Counter */}
      {!isPremium && (
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Likes quotidiens</span>
              <span className="text-lg font-bold text-pink-600">
                {likesUsedToday} / {DAILY_LIKE_LIMIT}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff007f] to-pink-600 transition-all duration-500"
                style={{ width: `${(likesUsedToday / DAILY_LIKE_LIMIT) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-pink-600/30 relative overflow-hidden">
          {/* Compatibility Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-[#ff007f] px-4 py-2 rounded-full text-gray-900 text-xs font-bold flex items-center gap-2 z-10">
            <Star className="h-4 w-4" />
            {currentProfile.compatibility}% Compatible
          </div>

          {/* Profile Image */}
          <div className="relative h-96 bg-gradient-to-br from-purple-500 to-[#ff007f] rounded-2xl mb-6 overflow-hidden">
            {currentProfile.imageBlurred && (
              <div className="absolute inset-0 backdrop-blur-3xl bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-16 w-16 text-gray-900 mx-auto mb-4" />
                  <button
                    onClick={handlePhotoRequest}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl text-gray-900 font-bold transition-all"
                  >
                    Demander l'accès
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProfile.name}, {currentProfile.age}
            </h3>
            <p className="text-pink-600 font-bold mb-4">
              {currentProfile.city} • {currentProfile.profession}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              {currentProfile.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                {currentProfile.religion}
              </span>
              <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
                {currentProfile.education}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              className="flex-1 py-4 bg-gray-100 border border-gray-300 hover:border-red-500 text-gray-900 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Passer
            </button>
            <button
              onClick={handleLike}
              className="flex-1 py-4 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="h-5 w-5" />
              J'aime
            </button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {FAKE_PROFILES.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentProfileIndex
                  ? "bg-pink-600 w-8"
                  : index < currentProfileIndex
                  ? "bg-green-500"
                  : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tuteur Notification */}
      {showWaliNotification && (
        <div className="fixed top-24 right-8 bg-white border-2 border-gray-200 hover:shadow-xl p-6 rounded-2xl border-2 border-purple-500 shadow-2xl z-50 animate-in slide-in-from-right max-w-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Tuteur Notifié</h4>
              <p className="text-sm text-gray-700">
                Votre tuteur a été informé de cette action
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-gray-200 hover:shadow-xl max-w-lg w-full p-8 rounded-3xl border-2 border-pink-600">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-pink-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-10 w-10 text-pink-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Limite quotidienne atteinte
              </h3>
              <p className="text-gray-700">
                Vous avez utilisé vos {DAILY_LIKE_LIMIT} likes gratuits d'aujourd'hui. 
                Passez Premium pour des likes illimités !
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-300/50">
                <Check className="h-5 w-5 text-pink-600" />
                <span className="text-gray-700">Likes illimités</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-300/50">
                <Check className="h-5 w-5 text-pink-600" />
                <span className="text-gray-700">Voir qui vous a liké</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-300/50">
                <Check className="h-5 w-5 text-pink-600" />
                <span className="text-gray-700">Badge vérifié</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-300/50">
                <Check className="h-5 w-5 text-pink-600" />
                <span className="text-gray-700">Filtres avancés</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 py-4 bg-gray-100 border border-gray-300 text-gray-900 rounded-2xl font-bold hover:border-pink-600 transition-all"
              >
                Plus tard
              </button>
              <button
                onClick={handleUpgradeToPremium}
                className="flex-1 py-4 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
              >
                Passer Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Features Unlocked */}
      {showPremiumFeatures && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-gray-200 hover:shadow-xl max-w-lg w-full p-8 rounded-3xl border-2 border-pink-600 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-[#ff007f] to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-gray-900">
              Bienvenue Premium !
            </h3>
            <p className="text-gray-700">
              Vous avez maintenant accès à toutes les fonctionnalités premium
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-12">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-pink-600 transition-all"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
        >
          Étape suivante →
        </button>
      </div>
    </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 mb-6">
          Étape 3/5 - Système Tuteur
        </div>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Protection par le <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#ff007f]">Tuteur</span>
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          {userType === "sister" 
            ? "Votre Tuteur supervise et valide chaque interaction pour votre protection"
            : "Le Tuteur de la sœur doit approuver votre demande avant tout échange"}
        </p>
      </div>

      {/* Tuteur Type Selection */}
      {userType === "sister" && !waliType && (
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => setWaliType("family")}
            className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-gray-300/50 hover:border-purple-500 transition-all group text-left"
          >
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-all">
              <span className="text-3xl">👨‍👩‍👧</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Tuteur Familial</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Invitez votre père, frère ou oncle à superviser vos échanges
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-purple-600" />
                100% Gratuit
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-purple-600" />
                Notifications en temps réel
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-purple-600" />
                Contrôle total
              </li>
            </ul>
          </button>

          <button
            onClick={() => setWaliType("platform")}
            className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-gray-300/50 hover:border-pink-600 transition-all group text-left"
          >
            <div className="w-16 h-16 bg-pink-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 transition-all">
              <span className="text-3xl">🛡️</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Tuteur Plateforme</h3>
              <span className="px-2 py-1 bg-pink-600/20 text-pink-600 text-[8px] font-black rounded uppercase">Premium</span>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Un Tuteur certifié ZAWJ supervise vos échanges en toute discrétion
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-pink-600" />
                Confidentialité familiale
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-pink-600" />
                Professionnel certifié
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-pink-600" />
                Disponible 24/7
              </li>
            </ul>
          </button>
        </div>
      )}

      {/* Tuteur Approval Simulation */}
      {(waliType || userType === "brother") && (
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-purple-500/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-[#ff007f] rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {waliType === "platform" ? "Tuteur ZAWJ" : "Tuteur - Ahmed"}
                </h4>
                <p className="text-sm text-purple-600">
                  {waliType === "platform" ? "Tuteur certifié" : "Tuteur familial"}
                </p>
              </div>
            </div>

            {/* Request Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-300/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-900">
                  {userType === "sister" ? "Demande reçue" : "Votre demande"}
                </span>
                <span className="text-xs text-gray-700">Il y a 2 min</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {userType === "sister" ? "Mohammed, 32" : "Amira, 26"}
                  </p>
                  <p className="text-sm text-gray-700">
                    {userType === "sister" ? "Ingénieur • Paris" : "Architecte • Paris"}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  waliDecision === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : waliDecision === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {waliDecision === "pending" && "En attente"}
                  {waliDecision === "approved" && "Approuvé"}
                  {waliDecision === "rejected" && "Refusé"}
                </div>
              </div>

              {waliDecision === "pending" && userType === "sister" && (
                <>
                  <div className="flex items-center justify-center my-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleWaliApprove}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Approuver
                    </button>
                    <button
                      onClick={handleWaliReject}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      Refuser
                    </button>
                  </div>
                </>
              )}

              {waliDecision === "approved" && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="h-5 w-5" />
                    <span className="font-bold">Demande approuvée - Vous pouvez maintenant échanger</span>
                  </div>
                </div>
              )}

              {waliDecision === "rejected" && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400">
                    <X className="h-5 w-5" />
                    <span className="font-bold">Demande refusée - Aucun échange possible</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-purple-300 mb-1">Protection active</h5>
                  <p className="text-sm text-gray-700">
                    {userType === "sister" 
                      ? "Votre Tuteur reçoit une notification pour chaque action importante"
                      : "Le Tuteur peut refuser la demande si le profil ne convient pas"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-pink-600 transition-all"
        >
          ← Retour
        </button>
        <button
          onClick={() => waliDecision === "approved" ? setCurrentStep(4) : setCurrentStep(4)}
          className="px-6 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 mb-6">
          Étape 4/5 - Messagerie
        </div>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Échangez en toute <span className="text-pink-600">sécurité</span>
        </h2>
        <p className="text-gray-700">
          Tous les messages sont supervisés par le Tuteur pour garantir un environnement respectueux
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Chat Container */}
        <div className="bg-white border-2 border-gray-200 hover:shadow-xl rounded-3xl border-2 border-pink-600/30 overflow-hidden mb-6">
          {/* Chat Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-300/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-[#ff007f] flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">
                  {userType === "sister" ? "Mohammed" : "Amira"}
                </h4>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  En ligne
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-purple-500/20 text-purple-600 text-xs rounded-full font-bold flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Tuteur Actif
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "Vous" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.from === "Vous"
                      ? "bg-gradient-to-r from-[#ff007f] to-pink-600 text-white"
                      : "bg-gray-100 border border-gray-300/50 text-gray-700"
                  }`}
                >
                  <p className="mb-1">{msg.content}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs opacity-70">{msg.time}</span>
                    {msg.status === "pending" && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        En attente Tuteur
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-300/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-600 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-xl font-bold hover:shadow-xl hover:shadow-[#ff007f]/50 transition-all"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Tuteur Warning */}
        {showWaliWarning && (
          <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-4 rounded-2xl border border-purple-500/30 mb-6 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-gray-700">
                <span className="font-bold text-purple-600">Tuteur notifié</span> - Votre tuteur a reçu une copie de ce message
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-300/50 rounded-2xl p-6">
          <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-pink-600" />
            Règles de la messagerie
          </h5>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">
                Tous les messages sont modérés et supervisés par le Tuteur
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">
                Restez respectueux et évitez les sujets inappropriés
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">
                Les photos personnelles ne peuvent être partagées qu'avec autorisation
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-12">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-pink-600 transition-all"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="px-6 py-3 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 mb-6">
          Étape 5/5 - Premium
        </div>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Débloquez tout le <span className="pink-glow-text">potentiel</span>
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Passez Premium pour accéder à des fonctionnalités exclusives et maximiser vos chances de trouver votre moitié
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-gray-300/50">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
            <p className="text-gray-700 text-sm">
              {userType === "sister" ? "Pour toutes les sœurs" : "Essayez la plateforme"}
            </p>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-8">
            0€<span className="text-lg text-gray-500">/mois</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">{userType === "sister" ? "Accès illimité" : "3 likes par jour"}</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Protection Tuteur</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Photos floutées</span>
            </li>
            <li className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-gray-500">Filtres avancés</span>
            </li>
            <li className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-gray-500">Badge vérifié</span>
            </li>
          </ul>
          {userType === "sister" ? (
            <div className="py-4 px-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <span className="text-green-400 font-bold">✓ Déjà inclus</span>
            </div>
          ) : (
            <button className="w-full py-4 border border-gray-300 text-gray-700 rounded-xl font-bold">
              Plan actuel
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-[#ff007f] to-pink-600 p-8 rounded-3xl text-gray-900 shadow-2xl shadow-[#ff007f]/50 transform scale-105">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">Premium</h3>
              <Crown className="h-6 w-6" />
            </div>
            <p className="text-gray-900/80 text-sm">
              Maximisez vos chances
            </p>
          </div>
          <div className="text-4xl font-black mb-8">
            29€<span className="text-lg text-gray-900/70">/mois</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Likes illimités</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Voir qui vous a liké</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Badge vérifié</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Filtres avancés</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Tuteur plateforme (optionnel)</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white" />
              <span className="font-medium">Priorité dans les suggestions</span>
            </li>
          </ul>
          <button className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl">
            Passer Premium
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-white border-2 border-gray-200 hover:shadow-xl p-8 rounded-3xl border-2 border-green-500/30 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-gray-900">
          Démo terminée !
        </h3>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
          Vous avez découvert le parcours complet de ZAWJ : découverte de profils, 
          protection Tuteur, messagerie sécurisée et options Premium. Prêt à commencer votre vraie recherche ?
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="px-10 py-5 bg-gradient-to-r from-[#ff007f] to-pink-600 text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-[#ff007f]/50 transition-all"
          >
            Créer mon compte
          </Link>
          <button
            onClick={() => {
              setCurrentStep(1);
              setUserType(null);
              setIsPremium(false);
              setCurrentProfileIndex(0);
              setLikesUsedToday(0);
              setLikedProfiles([]);
              setWaliType(null);
              setWaliDecision("pending");
              setMessages(FAKE_MESSAGES);
            }}
            className="px-10 py-5 bg-gray-100 border border-gray-300 text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:border-pink-600 transition-all"
          >
            Recommencer la démo
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-12">
        <button
          onClick={() => setCurrentStep(4)}
          className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-bold hover:border-pink-600 transition-all"
        >
          ← Retour
        </button>
      </div>
    </div>
  );

  // ===========================
  // MAIN RENDER
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 py-12 sm:py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Step Progress */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm sm:text-base ${
                  currentStep === step
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-gray-900 scale-110 shadow-lg"
                    : currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              {step < 5 && (
                <div
                  className={`w-16 md:w-32 h-1 mx-2 transition-all ${
                    currentStep > step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  );
}
