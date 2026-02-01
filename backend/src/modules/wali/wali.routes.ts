import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '@/modules/users/user.model'
import { Conversation, Message } from '@/modules/chat/chat.model'
import { Like } from '@/modules/likes/like.model'

const router = Router()

interface WaliAuthRequest extends Request {
  waliEmail?: string
  protectedUserId?: string
}

// Middleware pour authentification Wali
const authenticateWali = async (req: WaliAuthRequest, res: Response, next: Function): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      waliEmail: string
      protectedUserId: string
    }

    req.waliEmail = decoded.waliEmail
    req.protectedUserId = decoded.protectedUserId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// POST /api/wali/login - Login for Wali (separate from user login)
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, accessCode } = req.body

    if (!email || !accessCode) {
      res.status(400).json({ message: 'Email and access code required' })
      return
    }

    // Find user where waliInfo.email matches
    const protectedUser = await User.findOne({
      'waliInfo.email': email,
      'waliInfo.hasAccessToDashboard': true,
    })

    if (!protectedUser) {
      res.status(404).json({ message: 'No Wali account found with this email or access disabled' })
      return
    }

    // Simple access code validation (in production, use proper password hashing)
    // For now, we'll use: "WALI-" + last 6 chars of protected user's ID
    const expectedCode = `WALI-${protectedUser._id.toString().slice(-6).toUpperCase()}`
    
    if (accessCode !== expectedCode) {
      res.status(401).json({ message: 'Invalid access code' })
      return
    }

    // Generate Wali-specific JWT token
    const token = jwt.sign(
      {
        waliEmail: email,
        protectedUserId: protectedUser._id.toString(),
        role: 'wali',
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      protectedUser: {
        id: protectedUser._id,
        firstName: protectedUser.firstName,
        lastName: protectedUser.lastName,
        avatar: protectedUser.avatar,
      },
      waliInfo: protectedUser.waliInfo,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/wali/dashboard - Get protected user's data
router.get('/dashboard', authenticateWali, async (req: WaliAuthRequest, res: Response): Promise<void> => {
  try {
    const protectedUser = await User.findById(req.protectedUserId)
      .select('-password')
      .populate('waliInfo')

    if (!protectedUser) {
      res.status(404).json({ message: 'Protected user not found' })
      return
    }

    // Get conversations
    const conversations = await Conversation.find({
      participants: protectedUser._id,
    })
      .populate('participants', 'firstName lastName avatar age city')
      .sort({ lastMessageAt: -1 })

    // Get received likes
    const receivedLikes = await Like.find({ to: protectedUser._id })
      .populate('from', 'firstName lastName avatar age city religiousInfo.madhab')
      .sort({ createdAt: -1 })
      .limit(20)

    // Get mutual matches
    const mutualMatches = await Like.find({
      to: protectedUser._id,
      mutualMatch: true,
    })
      .populate('from', 'firstName lastName avatar age city')
      .sort({ createdAt: -1 })

    res.json({
      protectedUser: {
        id: protectedUser._id,
        firstName: protectedUser.firstName,
        lastName: protectedUser.lastName,
        avatar: protectedUser.avatar,
        age: protectedUser.age,
        city: protectedUser.city,
        religiousInfo: protectedUser.religiousInfo,
      },
      conversations: conversations.map((conv) => ({
        id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
      })),
      receivedLikes: receivedLikes.map((like) => ({
        id: like._id,
        from: like.from,
        message: like.message,
        mutualMatch: like.mutualMatch,
        createdAt: like.createdAt,
      })),
      mutualMatches: mutualMatches.length,
      stats: {
        totalConversations: conversations.length,
        totalLikes: receivedLikes.length,
        mutualMatches: mutualMatches.length,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/wali/conversations/:conversationId/messages - View conversation messages
router.get(
  '/conversations/:conversationId/messages',
  authenticateWali,
  async (req: WaliAuthRequest, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params
      const { limit = '50' } = req.query

      // Verify protected user is part of this conversation
      const conversation = await Conversation.findById(conversationId)
      if (!conversation || !conversation.participants.includes(req.protectedUserId as any)) {
        res.status(403).json({ message: 'Access denied' })
        return
      }

      const messages = await Message.find({ conversationId })
        .populate('senderId', 'firstName lastName avatar')
        .sort({ createdAt: 1 })
        .limit(parseInt(limit as string))

      res.json({
        conversation,
        messages: messages.map((msg) => ({
          id: msg._id,
          sender: msg.senderId,
          text: msg.text,
          isBlocked: msg.isBlocked,
          blockReason: msg.blockReason,
          createdAt: msg.createdAt,
          isRead: msg.isRead,
        })),
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

// PATCH /api/wali/settings - Update Wali notification settings
router.patch('/settings', authenticateWali, async (req: WaliAuthRequest, res: Response): Promise<void> => {
  try {
    const { notifyOnNewMessage, hasAccessToDashboard } = req.body

    const protectedUser = await User.findById(req.protectedUserId)
    
    if (!protectedUser || !protectedUser.waliInfo) {
      res.status(404).json({ message: 'Protected user or Wali info not found' })
      return
    }

    // Update settings
    if (typeof notifyOnNewMessage === 'boolean') {
      protectedUser.waliInfo.notifyOnNewMessage = notifyOnNewMessage
    }
    
    if (typeof hasAccessToDashboard === 'boolean') {
      protectedUser.waliInfo.hasAccessToDashboard = hasAccessToDashboard
    }

    await protectedUser.save()

    res.json({
      message: 'Settings updated successfully',
      waliInfo: protectedUser.waliInfo,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/wali/access-code - Generate access code for new Wali
router.get('/access-code/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user || !user.waliInfo) {
      res.status(404).json({ message: 'User or Wali info not found' })
      return
    }

    const accessCode = `WALI-${userId.slice(-6).toUpperCase()}`

    res.json({
      accessCode,
      waliEmail: user.waliInfo.email,
      instructions: 'Share this access code with the Wali to allow dashboard login',
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
