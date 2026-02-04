import { Router, Request, Response } from 'express'
import { authenticateToken, isAdmin } from '../../middlewares/auth.middleware'
import { AdminService } from './admin.service'
import financialRoutes from './admin.financial.routes'
import { Mahram } from './mahram.model'
import { Report } from './report.model'
import { User } from '../users/user.model'
import { Conversation, Message } from '../chat/chat.model'

const router = Router()

// Middleware: Verify Admin
const adminOnly = [authenticateToken, isAdmin]

// Mount financial routes
router.use('/financial', financialRoutes)

// GET /api/admin/stats
router.get('/stats', adminOnly, async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AdminService.getStats()
    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ message: 'Error fetching stats' })
  }
})

// GET /api/admin/users
router.get('/users', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const skip = parseInt(req.query.skip as string) || 0
    const users = await AdminService.getAllUsers(limit, skip)
    res.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
})

// PATCH /api/admin/users/:userId/block
router.patch('/users/:userId/block', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const { blocked } = req.body

    await AdminService.blockUser(userId, blocked)
    res.json({ message: blocked ? 'User blocked' : 'User unblocked' })
  } catch (error) {
    console.error('Error blocking user:', error)
    res.status(500).json({ message: 'Error blocking user' })
  }
})

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    await AdminService.deleteUser(userId)
    res.json({ message: 'User deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Error deleting user' })
  }
})

// GET /api/admin/mahrams
router.get('/mahrams', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string
    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }
    
    const mahrams = await Mahram.find(query)
      .populate('userId', 'firstName lastName email age city')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean()

    const formatted = mahrams.map((m: any) => ({
      id: m._id.toString(),
      user: {
        id: m.userId?._id.toString(),
        name: `${m.userId?.firstName} ${m.userId?.lastName}`,
        email: m.userId?.email,
        age: m.userId?.age,
        location: m.userId?.city,
      },
      mahram: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        relationship: m.relationship,
      },
      status: m.status,
      documents: m.documents,
      createdAt: m.createdAt,
      approvedAt: m.approvedAt,
      rejectedAt: m.rejectedAt,
      rejectionReason: m.rejectionReason,
      verifiedBy: m.verifiedBy ? `${m.verifiedBy.firstName} ${m.verifiedBy.lastName}` : null,
    }))

    res.json({ mahrams: formatted })
  } catch (error) {
    console.error('Error fetching mahrams:', error)
    res.status(500).json({ message: 'Error fetching mahrams' })
  }
})

// PATCH /api/admin/mahrams/:mahramId/approve
router.patch('/mahrams/:mahramId/approve', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mahramId } = req.params
    const userId = (req as any).userId

    const mahram = await Mahram.findByIdAndUpdate(
      mahramId,
      {
        status: 'approved',
        approvedAt: new Date(),
        verifiedBy: userId,
      },
      { new: true }
    )

    if (!mahram) {
      res.status(404).json({ message: 'Mahram not found' })
      return
    }

    // Update user's waliInfo
    await User.findByIdAndUpdate(mahram.userId, {
      'waliInfo.verified': true,
    })

    res.json({ message: 'Mahram approved', mahram })
  } catch (error) {
    console.error('Error approving mahram:', error)
    res.status(500).json({ message: 'Error approving mahram' })
  }
})

// PATCH /api/admin/mahrams/:mahramId/reject
router.patch('/mahrams/:mahramId/reject', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mahramId } = req.params
    const { reason } = req.body
    const userId = (req as any).userId

    const mahram = await Mahram.findByIdAndUpdate(
      mahramId,
      {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
        verifiedBy: userId,
      },
      { new: true }
    )

    if (!mahram) {
      res.status(404).json({ message: 'Mahram not found' })
      return
    }

    res.json({ message: 'Mahram rejected', mahram })
  } catch (error) {
    console.error('Error rejecting mahram:', error)
    res.status(500).json({ message: 'Error rejecting mahram' })
  }
})

// GET /api/admin/reports
router.get('/reports', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string
    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ severity: -1, createdAt: -1 })
      .lean()

    const formatted = reports.map((r: any) => ({
      id: r._id.toString(),
      reporter: {
        id: r.reporterId?._id.toString(),
        name: `${r.reporterId?.firstName} ${r.reporterId?.lastName}`,
        email: r.reporterId?.email,
      },
      reportedUser: {
        id: r.reportedUserId?._id.toString(),
        name: `${r.reportedUserId?.firstName} ${r.reportedUserId?.lastName}`,
        email: r.reportedUserId?.email,
      },
      type: r.type,
      description: r.description,
      evidence: r.evidence,
      status: r.status,
      severity: r.severity,
      assignedTo: r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : null,
      resolution: r.resolution,
      actionTaken: r.actionTaken,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }))

    res.json({ reports: formatted })
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({ message: 'Error fetching reports' })
  }
})

// POST /api/admin/reports
router.post('/reports', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const reporterId = (req as any).userId
    const { reportedUserId, type, description, evidence } = req.body

    const report = new Report({
      reporterId,
      reportedUserId,
      type,
      description,
      evidence: evidence || [],
      status: 'pending',
      severity: 'medium',
    })

    await report.save()
    res.status(201).json({ message: 'Report created', report })
  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({ message: 'Error creating report' })
  }
})

// PATCH /api/admin/reports/:reportId/resolve
router.patch('/reports/:reportId/resolve', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params
    const { resolution, actionTaken } = req.body
    const userId = (req as any).userId

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status: 'resolved',
        resolution,
        actionTaken,
        resolvedAt: new Date(),
        assignedTo: userId,
      },
      { new: true }
    )

    if (!report) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    // Take action on reported user
    if (actionTaken === 'temporary_ban' || actionTaken === 'permanent_ban') {
      await User.findByIdAndUpdate(report.reportedUserId, {
        isActive: false,
        isBanned: true,
      })
    }

    res.json({ message: 'Report resolved', report })
  } catch (error) {
    console.error('Error resolving report:', error)
    res.status(500).json({ message: 'Error resolving report' })
  }
})

// PATCH /api/admin/reports/:reportId/dismiss
router.patch('/reports/:reportId/dismiss', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params
    const userId = (req as any).userId

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status: 'dismissed',
        assignedTo: userId,
      },
      { new: true }
    )

    if (!report) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    res.json({ message: 'Report dismissed', report })
  } catch (error) {
    console.error('Error dismissing report:', error)
    res.status(500).json({ message: 'Error dismissing report' })
  }
})

// GET /api/admin/conversations - Get all conversations
router.get('/conversations', adminOnly, async (_req: Request, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find()
      .populate('participants', 'firstName lastName email gender')
      .sort({ updatedAt: -1 })
      .lean()

    // Get last message and message count for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv: any) => {
        const messageCount = await Message.countDocuments({ conversationId: conv._id })
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .select('content sender createdAt')
          .lean()

        return {
          ...conv,
          messageCount,
          lastMessage,
        }
      })
    )

    res.json({ conversations: conversationsWithDetails })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ message: 'Error fetching conversations' })
  }
})

// GET /api/admin/conversations/:conversationId/messages - Get all messages in a conversation
router.get('/conversations/:conversationId/messages', adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params

    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 })
      .lean()

    res.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Error fetching messages' })
  }
})

export default router

