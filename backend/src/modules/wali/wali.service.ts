import { User } from '@/modules/users/user.model'
import { Tuteur } from '@/modules/admin/tuteur.model'
import { Conversation, Message } from '@/modules/chat/chat.model'
import { Like } from '@/modules/likes/like.model'
import jwt from 'jsonwebtoken'

export class WaliService {
  /**
   * Authentification du wali/tuteur
   */
  static async login(email: string, accessCode: string) {
    // Trouver l'utilisateur protégée par ce wali
    const tuteur = await Tuteur.findOne({
      email,
      hasAccessToDashboard: true,
      status: 'approved',
    }).populate('userId')

    if (!tuteur) {
      throw new Error('Aucun compte Wali trouvé avec cet email ou accès désactivé')
    }

    const protectedUser = tuteur.userId as any

    // Validation du code d'accès
    const expectedCode = `WALI-${protectedUser._id.toString().slice(-6).toUpperCase()}`
    
    if (accessCode !== expectedCode) {
      throw new Error('Code d\'accès invalide')
    }

    // Générer un token JWT spécifique pour le wali
    const token = jwt.sign(
      {
        waliEmail: email,
        protectedUserId: protectedUser._id.toString(),
        tuteurId: tuteur._id.toString(),
        role: 'wali',
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return {
      token,
      protectedUser: {
        id: protectedUser._id,
        firstName: protectedUser.firstName,
        lastName: protectedUser.lastName,
        avatar: protectedUser.avatar,
        email: protectedUser.email,
      },
      tuteurInfo: {
        name: tuteur.name,
        relationship: tuteur.relationship,
        hasAccessToDashboard: tuteur.hasAccessToDashboard,
      },
    }
  }

  /**
   * Obtenir le dashboard complet pour le wali
   */
  static async getDashboard(protectedUserId: string) {
    const protectedUser = await User.findById(protectedUserId)
      .select('-password')
      .lean()

    if (!protectedUser) {
      throw new Error('Utilisatrice non trouvée')
    }

    // Récupérer toutes les données pertinentes
    const [conversations, receivedLikes, sentLikes, mutualMatches, tuteurInfo] = await Promise.all([
      this.getConversations(protectedUserId),
      this.getReceivedLikes(protectedUserId),
      this.getSentLikes(protectedUserId),
      this.getMutualMatches(protectedUserId),
      Tuteur.findOne({ userId: protectedUserId, status: 'approved' }),
    ])

    return {
      protectedUser: {
        id: protectedUser._id,
        firstName: protectedUser.firstName,
        lastName: protectedUser.lastName,
        avatar: protectedUser.avatar,
        age: protectedUser.age,
        city: protectedUser.city,
        bio: protectedUser.bio,
        religiousInfo: protectedUser.religiousInfo,
        marriageExpectations: protectedUser.marriageExpectations,
      },
      conversations,
      receivedLikes,
      sentLikes,
      mutualMatches,
      tuteurInfo,
      stats: {
        totalConversations: conversations.length,
        totalLikesReceived: receivedLikes.length,
        totalLikesSent: sentLikes.length,
        totalMatches: mutualMatches.length,
        activeConversations: conversations.filter((c: any) => 
          c.lastMessageAt && new Date(c.lastMessageAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
      },
    }
  }

  /**
   * Récupérer les conversations de l'utilisatrice
   */
  static async getConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName lastName avatar age city religiousInfo.madhab')
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean()

    return conversations.map((conv: any) => {
      const otherUser = conv.participants.find((p: any) => p._id.toString() !== userId)
      return {
        id: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        isApprovedByWali: conv.isApprovedByWali,
      }
    })
  }

  /**
   * Récupérer les likes reçus
   */
  static async getReceivedLikes(userId: string) {
    const likes = await Like.find({ to: userId })
      .populate('from', 'firstName lastName avatar age city religiousInfo.madhab profession')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return likes.map((like: any) => ({
      id: like._id,
      from: like.from,
      message: like.message,
      mutualMatch: like.mutualMatch,
      createdAt: like.createdAt,
    }))
  }

  /**
   * Récupérer les likes envoyés
   */
  static async getSentLikes(userId: string) {
    const likes = await Like.find({ from: userId })
      .populate('to', 'firstName lastName avatar age city')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return likes
  }

  /**
   * Récupérer les matchs mutuels
   */
  static async getMutualMatches(userId: string) {
    const matches = await Like.find({
      to: userId,
      mutualMatch: true,
    })
      .populate('from', 'firstName lastName avatar age city religiousInfo profession')
      .sort({ createdAt: -1 })
      .lean()

    return matches
  }

  /**
   * Récupérer les messages d'une conversation spécifique
   */
  static async getConversationMessages(conversationId: string, protectedUserId: string) {
    // Vérifier que la conversation appartient bien à l'utilisatrice protégée
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: protectedUserId,
    })

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé')
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()

    return messages
  }

  /**
   * Approuver ou rejeter une conversation
   */
  static async manageConversation(
    conversationId: string,
    protectedUserId: string,
    action: 'approve' | 'reject'
  ) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: protectedUserId,
    })

    if (!conversation) {
      throw new Error('Conversation non trouvée')
    }

    if (action === 'approve') {
      await Conversation.findByIdAndUpdate(conversationId, {
        isApprovedByWali: true,
      })
      return { message: 'Conversation approuvée' }
    } else {
      // Bloquer ou supprimer la conversation
      await Conversation.findByIdAndDelete(conversationId)
      await Message.deleteMany({ conversationId })
      return { message: 'Conversation rejetée et supprimée' }
    }
  }

  /**
   * Approuver ou rejeter un like reçu
   */
  static async manageLike(
    likeId: string,
    protectedUserId: string,
    action: 'approve' | 'reject'
  ) {
    const like = await Like.findOne({
      _id: likeId,
      to: protectedUserId,
    })

    if (!like) {
      throw new Error('Like non trouvé')
    }

    if (action === 'reject') {
      await Like.findByIdAndDelete(likeId)
      return { message: 'Like rejeté' }
    }

    // L'approbation pourrait automatiquement créer un like en retour
    const existingReverseLike = await Like.findOne({
      from: protectedUserId,
      to: like.from,
    })

    if (!existingReverseLike) {
      await Like.create({
        from: protectedUserId,
        to: like.from,
        mutualMatch: true,
        approvedByWali: true,
      })

      await Like.findByIdAndUpdate(likeId, {
        mutualMatch: true,
        approvedByWali: true,
      })
    }

    return { message: 'Like approuvé et match créé' }
  }

  /**
   * Mettre à jour les préférences du wali
   */
  static async updatePreferences(
    tuteurId: string,
    preferences: {
      hasAccessToDashboard?: boolean
      notifyOnNewMessage?: boolean
      notifyOnNewLike?: boolean
    }
  ) {
    const tuteur = await Tuteur.findByIdAndUpdate(
      tuteurId,
      { $set: preferences },
      { new: true }
    )

    if (!tuteur) {
      throw new Error('Tuteur non trouvé')
    }

    return tuteur
  }

  /**
   * Obtenir le code d'accès pour un wali (admin uniquement)
   */
  static getAccessCode(protectedUserId: string): string {
    return `WALI-${protectedUserId.slice(-6).toUpperCase()}`
  }
}
