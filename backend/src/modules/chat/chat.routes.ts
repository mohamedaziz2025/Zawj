import { Router } from 'express'
import { Types } from 'mongoose'
import { Conversation, Message } from './chat.model'
import { contentFilterMiddleware } from '@/middlewares/security.middleware'
import { AuthRequest, hasValidMahram } from '@/middlewares/auth.middleware'
import { antiSpamMiddleware } from '@/middlewares/messaging.middleware'
import { User } from '@/modules/users/user.model'
import { sendWaliNewMessageNotification } from '@/services/email.service'

const router = Router()

// GET /api/chat/conversations
router.get('/conversations', async (req: AuthRequest, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate('participants', 'firstName lastName avatar')
      .sort({ lastMessageAt: -1 })

    res.json(conversations)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/chat/:id/messages
router.get('/:conversationId/messages', async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const { limit = '50', skip = '0' } = req.query

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string))

    // Mark as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.userId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    )

    res.json(messages.reverse())
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/chat/send
router.post('/send', hasValidMahram, antiSpamMiddleware, contentFilterMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { conversationId, text } = req.body
    const { isBlocked, blockReason } = req.body

    if (!conversationId || !text) {
      res.status(400).json({ message: 'Missing required fields' })
      return
    }

    // Check conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId)
    if (
      !conversation ||
      !conversation.participants.includes(new Types.ObjectId(req.userId!))
    ) {
      res.status(403).json({ message: 'Unauthorized' })
      return
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: req.userId,
      text,
      isBlocked,
      blockReason,
    })

    await message.save()

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
      $push: { messages: message._id },
    })

    await message.populate('senderId', 'firstName lastName avatar')

    // 🔔 NOTIFICATION WALI: Si le destinataire est une femme avec un Wali configuré
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.userId
    )
    
    if (receiverId) {
      const recipient = await User.findById(receiverId).select('+waliInfo')
      
      if (
        recipient &&
        recipient.gender === 'female' &&
        recipient.waliInfo &&
        recipient.waliInfo.notifyOnNewMessage &&
        recipient.waliInfo.email
      ) {
        // Récupérer les infos de l'expéditeur
        const sender = await User.findById(req.userId)
        
        if (sender) {
          const messagePreview = text.length > 100 ? text.substring(0, 100) + '...' : text
          
          // Envoyer l'email de notification au Wali (async, ne pas bloquer)
          sendWaliNewMessageNotification(
            recipient.waliInfo.email,
            recipient.waliInfo.fullName,
            recipient.firstName,
            sender.firstName + ' ' + sender.lastName,
            messagePreview
          ).catch((err) => console.error('Failed to send Wali notification:', err))
        }
      }
    }

    res.status(201).json(message)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/chat/start
router.post('/start', hasValidMahram, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { otherUserId } = req.body

    if (!otherUserId) {
      res.status(400).json({ message: 'otherUserId is required' })
      return
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, otherUserId] },
    })

    if (conversation) {
      res.json(conversation)
      return
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.userId, otherUserId],
      messages: [],
    })

    await conversation.save()
    await conversation.populate('participants', 'firstName lastName avatar')

    res.status(201).json(conversation)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
