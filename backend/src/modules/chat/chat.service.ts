import { Types } from 'mongoose'
import { Conversation, Message } from './chat.model'
import { User } from '@/modules/users/user.model'
import { Tuteur } from '@/modules/admin/tuteur.model'
import { sendEmail, getWaliNewMessageEmailHTML } from '@/services/email.service'

export class ChatService {
  /**
   * Créer ou récupérer une conversation entre deux utilisateurs
   */
  static async getOrCreateConversation(userId1: string, userId2: string) {
    // Vérifier si conversation existe
    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    })

    if (!conversation) {
      // Créer nouvelle conversation
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        isApprovedByWali: false,
      })
    }

    return conversation.populate('participants', 'firstName lastName avatar gender')
  }

  /**
   * Envoyer un message avec vérifications de sécurité
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    isBlocked: boolean = false,
    blockReason?: string
  ) {
    // Vérifier que la conversation existe et que l'utilisateur est participant
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.participants.includes(new Types.ObjectId(senderId))) {
      throw new Error('Conversation non trouvée ou accès non autorisé')
    }

    // Créer le message
    const message = await Message.create({
      conversationId,
      senderId,
      text,
      isBlocked,
      blockReason,
    })

    // Mettre à jour la conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: isBlocked ? '[Message bloqué]' : text,
      lastMessageAt: new Date(),
      $push: { messages: message._id },
    })

    // Peupler le message
    await message.populate('senderId', 'firstName lastName avatar')

    // Notifier le wali si nécessaire
    await this.notifyWaliIfNeeded(conversation, senderId, text)

    return message
  }

  /**
   * Notifier le wali/tuteur d'une femme si elle reçoit un message
   */
  static async notifyWaliIfNeeded(
    conversation: any,
    senderId: string,
    messageText: string
  ) {
    // Trouver le destinataire (celui qui n'est pas l'expéditeur)
    const receiverId = conversation.participants.find(
      (p: Types.ObjectId) => p.toString() !== senderId
    )

    if (!receiverId) return

    // Récupérer l'utilisateur destinataire
    const receiver = await User.findById(receiverId)
    if (!receiver || receiver.gender !== 'female') return

    // Vérifier si elle a un tuteur avec notifications activées
    const tuteur = await Tuteur.findOne({
      userId: receiverId,
      status: 'approved',
      notifyOnNewMessage: true,
    })

    if (!tuteur || !tuteur.email) return

    // Récupérer info de l'expéditeur
    const sender = await User.findById(senderId)
    if (!sender) return

    // Envoyer l'email au tuteur
    try {
      await sendEmail({
        to: tuteur.email,
        subject: `Nouveau message pour ${receiver.firstName} - Plateforme ZAWJ`,
        html: getWaliNewMessageEmailHTML(
          tuteur.name,
          receiver.firstName,
          `${sender.firstName} ${sender.lastName}`,
          messageText.substring(0, 100)
        ),
      })
    } catch (error) {
      console.error('Erreur notification wali:', error)
    }
  }

  /**
   * Récupérer toutes les conversations d'un utilisateur
   */
  static async getUserConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName lastName avatar age city gender')
      .sort({ lastMessageAt: -1 })
      .lean()

    return conversations.map((conv) => ({
      ...conv,
      unreadCount: 0, // À calculer si nécessaire
      otherUser: conv.participants.find((p: any) => p._id.toString() !== userId),
    }))
  }

  /**
   * Récupérer les messages d'une conversation avec pagination
   */
  static async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    skip: number = 0
  ) {
    // Vérifier l'accès
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé')
    }

    // Récupérer les messages
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    // Marquer comme lu
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    )

    return messages.reverse()
  }

  /**
   * Compter les messages non lus pour un utilisateur
   */
  static async getUnreadCount(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    }).select('_id')

    const conversationIds = conversations.map((c) => c._id)

    const count = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      isRead: false,
    })

    return count
  }

  /**
   * Supprimer un message (soft delete)
   */
  static async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
    })

    if (!message) {
      throw new Error('Message non trouvé ou vous n\'êtes pas l\'auteur')
    }

    await Message.findByIdAndUpdate(messageId, {
      isBlocked: true,
      blockReason: 'Supprimé par l\'utilisateur',
      text: '[Message supprimé]',
    })

    return true
  }

  /**
   * Vérifier si un utilisateur peut envoyer un message (anti-spam)
   */
  static async canSendMessage(userId: string): Promise<boolean> {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

    const recentMessages = await Message.countDocuments({
      senderId: userId,
      createdAt: { $gte: oneMinuteAgo },
    })

    // Limite : 10 messages par minute
    return recentMessages < 10
  }

  /**
   * Bloquer/débloquer une conversation
   */
  static async toggleConversationBlock(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })

    if (!conversation) {
      throw new Error('Conversation non trouvée')
    }

    // Implémenter la logique de blocage
    // Pour l'instant, on peut ajouter un champ 'blockedBy' dans le modèle
    return conversation
  }
}
