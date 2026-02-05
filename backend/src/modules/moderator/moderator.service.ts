import { User } from '@/modules/users/user.model'
import { Report } from '@/modules/admin/report.model'
import { Message } from '@/modules/chat/chat.model'
import { Like } from '@/modules/likes/like.model'
import { sendEmail, getAccountSuspendedEmailHTML } from '@/services/email.service'

export class ModeratorService {
  /**
   * Obtenir le dashboard du modérateur avec toutes les statistiques
   */
  static async getDashboard() {
    const [
      totalReports,
      pendingReports,
      totalUsers,
      suspendedUsers,
      flaggedMessages,
      recentActivity,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      User.countDocuments({ isActive: false }),
      Message.countDocuments({ isBlocked: true }),
      this.getRecentActivity(),
    ])

    return {
      stats: {
        totalReports,
        pendingReports,
        totalUsers,
        suspendedUsers,
        flaggedMessages,
      },
      recentActivity,
    }
  }

  /**
   * Récupérer l'activité récente pour le dashboard
   */
  static async getRecentActivity() {
    const recentReports = await Report.find()
      .populate('reportedBy', 'firstName lastName')
      .populate('reportedUser', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .select('firstName lastName email createdAt isVerified')
      .limit(10)
      .lean()

    return {
      recentReports,
      recentUsers,
    }
  }

  /**
   * Récupérer tous les signalements avec filtres et pagination
   */
  static async getReports(
    status?: string,
    type?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const query: any = {}
    if (status) query.status = status
    if (type) query.type = type

    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reportedBy', 'firstName lastName email avatar')
        .populate('reportedUser', 'firstName lastName email avatar isActive')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Report.countDocuments(query),
    ])

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Traiter un signalement
   */
  static async handleReport(
    reportId: string,
    _moderatorId: string,
    action: 'approve' | 'reject' | 'suspend-user' | 'warn-user',
    _notes?: string
  ) {
    const report = await Report.findById(reportId)
    if (!report) throw new Error('Signalement non trouvé')

    let actionTaken = ''

    switch (action) {
      case 'approve':
        // Valider le signalement et prendre des mesures
        report.status = 'resolved'
        actionTaken = 'Signalement validé - Mesures prises'
        
        // Suspendre l'utilisateur signalé si grave
        if (report.severity === 'high') {
          await this.suspendUser(report.reportedUserId.toString(), 'Signalement validé par modération', 7)
        }
        break

      case 'reject':
        report.status = 'dismissed'
        actionTaken = 'Signalement rejeté - Aucune violation constatée'
        break

      case 'suspend-user':
        await this.suspendUser(report.reportedUserId.toString(), 'Signalement validé - Suspension', 30)
        report.status = 'resolved'
        actionTaken = 'Utilisateur suspendu pour 30 jours'
        break

      case 'warn-user':
        await this.warnUser(report.reportedUserId.toString(), 'Signalement - Avertissement')
        report.status = 'resolved'
        actionTaken = 'Avertissement envoyé à l\'utilisateur'
        break
    }

    // Note: Les champs handledBy, handledAt, moderatorNotes doivent être ajoutés au modèle Report si nécessaire
    report.status = report.status

    await report.save()

    return {
      message: actionTaken,
      report,
    }
  }

  /**
   * Suspendre un utilisateur temporairement
   */
  static async suspendUser(userId: string, reason: string, durationDays: number = 7) {
    const user = await User.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    const suspendUntil = new Date()
    suspendUntil.setDate(suspendUntil.getDate() + durationDays)

    await User.findByIdAndUpdate(userId, {
      isActive: false,
      suspendUntil,
      suspensionReason: reason,
    })

    // Envoyer un email de notification
    try {
      await sendEmail({
        to: user.email,
        subject: 'Suspension temporaire de votre compte - ZAWJ',
        html: getAccountSuspendedEmailHTML(
          `${user.firstName} ${user.lastName}`,
          reason,
          suspendUntil.toLocaleDateString('fr-FR')
        ),
      })
    } catch (error) {
      console.error('Erreur envoi email suspension:', error)
    }

    return true
  }

  /**
   * Envoyer un avertissement à un utilisateur
   */
  static async warnUser(userId: string, reason: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    // Enregistrer l'avertissement
    await User.findByIdAndUpdate(userId, {
      $push: {
        warnings: {
          reason,
          date: new Date(),
        },
      },
    })

    // Envoyer un email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Avertissement concernant votre compte - ZAWJ',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #b91c1c;">Avertissement</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Nous vous informons que votre compte a reçu un avertissement pour la raison suivante :</p>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>${reason}</strong>
            </div>
            <p>Nous vous rappelons l'importance de respecter nos conditions d'utilisation et notre code de conduite.</p>
            <p>En cas de récidive, votre compte pourrait être suspendu ou supprimé.</p>
            <p>Cordialement,<br>L'équipe ZAWJ</p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Erreur envoi email avertissement:', error)
    }

    return true
  }

  /**
   * Bannir définitivement un utilisateur
   */
  static async banUser(userId: string, reason: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    await User.findByIdAndUpdate(userId, {
      isActive: false,
      isBanned: true,
      banReason: reason,
      bannedAt: new Date(),
    })

    // Supprimer toutes ses conversations et likes
    const { Conversation } = await import('@/modules/chat/chat.model')
    await Promise.all([
      Conversation.deleteMany({ participants: userId }),
      Message.deleteMany({ senderId: userId }),
      Like.deleteMany({ $or: [{ from: userId }, { to: userId }] }),
    ])

    return true
  }

  /**
   * Débloquer un utilisateur suspendu
   */
  static async unblockUser(userId: string) {
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      $unset: { suspendedUntil: 1, suspensionReason: 1, isBanned: 1, banReason: 1 },
    })

    return true
  }

  /**
   * Modérer un message (bloquer/débloquer)
   */
  static async moderateMessage(messageId: string, shouldBlock: boolean, reason?: string) {
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        isBlocked: shouldBlock,
        blockReason: reason || 'Modéré par équipe',
      },
      { new: true }
    )

    if (!message) throw new Error('Message non trouvé')

    return message
  }

  /**
   * Récupérer les messages signalés ou suspects
   */
  static async getFlaggedMessages(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit

    const messages = await Message.find({
      $or: [
        { isBlocked: true },
        // Ajouter d'autres critères de messages suspects
      ],
    })
      .populate('senderId', 'firstName lastName email avatar')
      .populate('conversationId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await Message.countDocuments({ isBlocked: true })

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Vérifier un utilisateur manuellement
   */
  static async verifyUser(userId: string, moderatorId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: moderatorId,
      },
      { new: true }
    )

    if (!user) throw new Error('Utilisateur non trouvé')

    // Envoyer email de félicitations
    try {
      await sendEmail({
        to: user.email,
        subject: '✅ Votre profil est vérifié - ZAWJ',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">✅ Profil Vérifié !</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Bonne nouvelle ! Votre profil a été vérifié par notre équipe.</p>
            <p>Vous bénéficiez maintenant d'une meilleure visibilité et d'une plus grande confiance auprès des autres membres.</p>
            <p>Continuez à utiliser la plateforme de manière respectueuse et conforme à nos valeurs.</p>
            <p>Qu'Allah vous facilite dans votre recherche.</p>
            <p>L'équipe ZAWJ</p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Erreur envoi email vérification:', error)
    }

    return user
  }

  /**
   * Obtenir les statistiques globales pour les admins
   */
  static async getGlobalStats() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      newUsersLast30Days,
      activeUsers,
      maleUsers,
      femaleUsers,
      premiumUsers,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ gender: 'male' }),
      User.countDocuments({ gender: 'female' }),
      User.countDocuments({ isPremium: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ])

    return {
      users: {
        total: totalUsers,
        new30Days: newUsersLast30Days,
        active: activeUsers,
        male: maleUsers,
        female: femaleUsers,
        premium: premiumUsers,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
    }
  }
}
