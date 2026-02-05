import { Router } from 'express'
import { ModeratorService } from './moderator.service'
import { authMiddleware } from '@/middlewares/auth.middleware'

const router = Router()

// Middleware pour vérifier que l'utilisateur est modérateur ou admin
const moderatorAuthMiddleware = (req: any, res: any, next: any) => {
  if (!['moderator', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Accès réservé aux modérateurs' })
  }
  next()
}

/**
 * @route   GET /api/moderation/dashboard
 * @desc    Récupérer le dashboard du modérateur
 * @access  Private (Moderator/Admin)
 */
router.get('/dashboard', authMiddleware, moderatorAuthMiddleware, async (_req, res) => {
  try {
    const dashboard = await ModeratorService.getDashboard()
    res.json(dashboard)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   GET /api/moderation/reports
 * @desc    Récupérer tous les signalements avec filtres
 * @access  Private (Moderator/Admin)
 */
router.get('/reports', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query

    const result = await ModeratorService.getReports(
      status as string,
      type as string,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   PATCH /api/moderation/reports/:reportId
 * @desc    Traiter un signalement
 * @access  Private (Moderator/Admin)
 */
router.patch('/reports/:reportId', authMiddleware, moderatorAuthMiddleware, async (req: any, res) => {
  try {
    const { reportId } = req.params
    const { action, notes } = req.body

    if (!['approve', 'reject', 'suspend-user', 'warn-user'].includes(action)) {
      return res.status(400).json({ message: 'Action invalide' })
    }

    const result = await ModeratorService.handleReport(
      reportId,
      req.user.userId,
      action,
      notes
    )

    return res.json(result)
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
})

/**
 * @route   POST /api/moderation/users/:userId/suspend
 * @desc    Suspendre un utilisateur
 * @access  Private (Moderator/Admin)
 */
router.post('/users/:userId/suspend', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const { reason, durationDays = 7 } = req.body

    await ModeratorService.suspendUser(userId, reason, durationDays)
    res.json({ message: 'Utilisateur suspendu avec succès' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   POST /api/moderation/users/:userId/warn
 * @desc    Envoyer un avertissement à un utilisateur
 * @access  Private (Moderator/Admin)
 */
router.post('/users/:userId/warn', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body

    await ModeratorService.warnUser(userId, reason)
    res.json({ message: 'Avertissement envoyé avec succès' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   POST /api/moderation/users/:userId/ban
 * @desc    Bannir définitivement un utilisateur
 * @access  Private (Admin)
 */
router.post('/users/:userId/ban', authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent bannir' })
    }

    const { userId } = req.params
    const { reason } = req.body

    await ModeratorService.banUser(userId, reason)
    return res.json({ message: 'Utilisateur banni définitivement' })
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
})

/**
 * @route   POST /api/moderation/users/:userId/unblock
 * @desc    Débloquer un utilisateur suspendu
 * @access  Private (Moderator/Admin)
 */
router.post('/users/:userId/unblock', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    await ModeratorService.unblockUser(userId)
    res.json({ message: 'Utilisateur débloqué avec succès' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   GET /api/moderation/messages/flagged
 * @desc    Récupérer les messages signalés
 * @access  Private (Moderator/Admin)
 */
router.get('/messages/flagged', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query

    const result = await ModeratorService.getFlaggedMessages(
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   PATCH /api/moderation/messages/:messageId
 * @desc    Modérer un message
 * @access  Private (Moderator/Admin)
 */
router.patch('/messages/:messageId', authMiddleware, moderatorAuthMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params
    const { shouldBlock, reason } = req.body

    const message = await ModeratorService.moderateMessage(messageId, shouldBlock, reason)
    res.json(message)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   POST /api/moderation/users/:userId/verify
 * @desc    Vérifier un utilisateur manuellement
 * @access  Private (Moderator/Admin)
 */
router.post('/users/:userId/verify', authMiddleware, moderatorAuthMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.params

    const user = await ModeratorService.verifyUser(userId, req.user.userId)
    res.json(user)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   GET /api/moderation/stats
 * @desc    Récupérer les statistiques globales
 * @access  Private (Admin)
 */
router.get('/stats', authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
    }

    const stats = await ModeratorService.getGlobalStats()
    return res.json(stats)
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
