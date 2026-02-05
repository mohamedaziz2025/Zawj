import { User, IUser } from './user.model'
import { Tuteur } from '@/modules/admin/tuteur.model'
import { Subscription } from '@/modules/subscription/subscription.model'
import { UserSettings } from './user-settings.model'

export class UserService {
  /**
   * Récupérer le profil complet d'un utilisateur
   */
  static async getFullProfile(userId: string) {
    const user = await User.findById(userId).select('-password').lean()
    if (!user) throw new Error('Utilisateur non trouvé')

    // Récupérer les informations complémentaires
    const [subscription, settings, tuteur] = await Promise.all([
      Subscription.findOne({ userId }),
      UserSettings.findOne({ userId }),
      user.gender === 'female' 
        ? Tuteur.findOne({ userId, status: 'approved' })
        : null,
    ])

    return {
      ...user,
      subscription,
      settings,
      tuteur,
      isPremium: subscription?.status === 'active' && subscription?.plan !== 'free',
    }
  }

  /**
   * Mettre à jour le profil utilisateur avec validations
   */
  static async updateProfile(userId: string, updates: Partial<IUser>) {
    // Empêcher la modification de champs sensibles
    const allowedFields = [
      'bio', 'age', 'location', 'city', 'country', 'nationality',
      'profession', 'education', 'religiousInfo', 'marriageExpectations',
      'preferences', 'avatar', 'photos'
    ]

    const sanitizedUpdates: any = {}
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field] = (updates as any)[field]
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: sanitizedUpdates },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) throw new Error('Utilisateur non trouvé')

    return user
  }

  /**
   * Recherche avancée d'utilisateurs avec filtres
   */
  static async searchUsers(
    currentUserId: string,
    filters: any,
    page: number = 1,
    limit: number = 20
  ) {
    const currentUser = await User.findById(currentUserId)
    if (!currentUser) throw new Error('Utilisateur non trouvé')

    // Construire la requête
    const query: any = {
      _id: { $ne: currentUserId },
      isActive: true,
      isVerified: true,
      gender: currentUser.gender === 'male' ? 'female' : 'male',
    }

    // Filtres d'âge
    if (filters.minAge || filters.maxAge) {
      query.age = {}
      if (filters.minAge) query.age.$gte = parseInt(filters.minAge)
      if (filters.maxAge) query.age.$lte = parseInt(filters.maxAge)
    }

    // Filtres de localisation
    if (filters.city) query.city = { $regex: filters.city, $options: 'i' }
    if (filters.country) query.country = { $regex: filters.country, $options: 'i' }

    // Filtres religieux
    if (filters.madhab?.length) {
      query['religiousInfo.madhab'] = { $in: filters.madhab }
    }
    if (filters.prayerFrequency?.length) {
      query['religiousInfo.prayerFrequency'] = { $in: filters.prayerFrequency }
    }
    if (filters.practiceLevel?.length) {
      query['religiousInfo.practiceLevel'] = { $in: filters.practiceLevel }
    }
    if (filters.quranMemorization) {
      query['religiousInfo.quranMemorization'] = filters.quranMemorization
    }

    // Filtres d'attentes matrimoniales
    if (filters.acceptsPolygamy !== undefined) {
      query['marriageExpectations.acceptsPolygamy'] = filters.acceptsPolygamy === 'true'
    }
    if (filters.wantsChildren !== undefined) {
      query['marriageExpectations.wantsChildren'] = filters.wantsChildren === 'true'
    }
    if (filters.willingToRelocate !== undefined) {
      query['marriageExpectations.willingToRelocate'] = filters.willingToRelocate === 'true'
    }

    // Exécuter la recherche avec pagination
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      User.countDocuments(query),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Vérifier si un utilisateur peut voir les photos d'un autre
   */
  static async canViewPhotos(viewerId: string, targetId: string): Promise<boolean> {
    const [viewer, target] = await Promise.all([
      User.findById(viewerId),
      User.findById(targetId),
    ])

    if (!viewer || !target) return false

    // Les hommes doivent avoir un abonnement premium
    if (viewer.gender === 'male') {
      const subscription = await Subscription.findOne({ userId: viewerId })
      if (!subscription || subscription.status !== 'active' || subscription.plan === 'free') {
        return false
      }
    }

    // Vérifier si l'utilisateur a révélé ses photos au viewer
    const hasRevealed = target.photos?.some(photo => 
      photo.revealedTo?.includes(viewerId as any)
    )

    return hasRevealed || false
  }

  /**
   * Révéler les photos à un utilisateur spécifique
   */
  static async revealPhotosTo(userId: string, targetUserId: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    // Ajouter targetUserId à revealedTo pour toutes les photos
    const updates = user.photos.map((photo) => ({
      ...photo,
      revealedTo: [...(photo.revealedTo || []), targetUserId as any],
    }))

    await User.findByIdAndUpdate(userId, {
      $set: { photos: updates },
    })

    return true
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  static async getUserStats(userId: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    // Importer les modèles nécessaires
    const { Like } = await import('@/modules/likes/like.model')
    const { Conversation } = await import('@/modules/chat/chat.model')

    const [likesReceived, likesSent, conversations, mutualMatches] = await Promise.all([
      Like.countDocuments({ to: userId }),
      Like.countDocuments({ from: userId }),
      Conversation.countDocuments({ participants: userId }),
      Like.countDocuments({ to: userId, mutualMatch: true }),
    ])

    return {
      likesReceived,
      likesSent,
      conversations,
      mutualMatches,
      profileViews: 0, // À implémenter si nécessaire
      completionRate: this.calculateProfileCompletion(user),
    }
  }

  /**
   * Calculer le taux de complétion du profil
   */
  static calculateProfileCompletion(user: IUser): number {
    let completed = 0
    let total = 0

    // Champs basiques (30%)
    const basicFields = ['bio', 'age', 'location', 'profession', 'education']
    basicFields.forEach((field) => {
      total += 6
      if ((user as any)[field]) completed += 6
    })

    // Photos (20%)
    total += 20
    if (user.photos?.length) completed += 20

    // Informations religieuses (30%)
    if (user.religiousInfo) {
      total += 30
      const religiousFields = ['prayerFrequency', 'madhab', 'practiceLevel', 'quranMemorization']
      religiousFields.forEach((field) => {
        if ((user.religiousInfo as any)?.[field]) completed += 7.5
      })
    }

    // Attentes matrimoniales (20%)
    if (user.marriageExpectations) {
      total += 20
      const marriageFields = ['wantsChildren', 'willingToRelocate']
      marriageFields.forEach((field) => {
        if ((user.marriageExpectations as any)?.[field] !== undefined) completed += 10
      })
    }

    return Math.round((completed / total) * 100)
  }

  /**
   * Désactiver un compte utilisateur
   */
  static async deactivateAccount(userId: string, reason?: string) {
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      deactivatedAt: new Date(),
      deactivationReason: reason,
    })

    // Annuler l'abonnement si actif
    const subscription = await Subscription.findOne({ userId })
    if (subscription?.stripeSubscriptionId) {
      const { cancelSubscription } = await import('@/services/stripe.service')
      await cancelSubscription(userId, true)
    }

    return true
  }

  /**
   * Réactiver un compte utilisateur
   */
  static async reactivateAccount(userId: string) {
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      $unset: { deactivatedAt: 1, deactivationReason: 1 },
    })

    return true
  }
}
