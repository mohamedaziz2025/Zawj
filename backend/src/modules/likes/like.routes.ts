import { Router } from 'express'
import { AuthRequest } from '@/middlewares/auth.middleware'
import { Like } from './like.model'
import { User } from '@/modules/users/user.model'
import { Subscription } from '@/modules/subscription/subscription.model'
import { sendWaliNewMatchNotification } from '@/services/email.service'

const router = Router()

// POST /api/likes/send - Send a like/interest
router.post('/send', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { to, type = 'like', message } = req.body
    const from = req.userId!

    // Check if user is liking themselves
    if (from === to) {
      res.status(400).json({ message: 'Cannot like yourself' })
      return
    }

    // Check if target user exists
    const targetUser = await User.findById(to)
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Get sender's subscription
    const subscription = await Subscription.findOne({ userId: from })
    
    // Check daily limit for free users (3 likes per day)
    const sender = await User.findById(from)
    if (!sender) {
      res.status(404).json({ message: 'Sender not found' })
      return
    }

    const isPremium = subscription?.plan !== 'free' && subscription?.status === 'active'
    
    if (!isPremium) {
      // Reset counter if last reset was more than 24h ago
      const now = new Date()
      const lastReset = sender.dailyLikes?.lastReset || new Date(0)
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceReset >= 24) {
        sender.dailyLikes = { count: 0, lastReset: now }
        await sender.save()
      }
      
      // Check if user has reached daily limit
      if (sender.dailyLikes && sender.dailyLikes.count >= 3) {
        res.status(403).json({ 
          message: 'Daily like limit reached (3/day). Upgrade to Premium for unlimited likes.',
          upgradeRequired: true 
        })
        return
      }
    }

    // Check if already liked
    const existingLike = await Like.findOne({ from, to })
    if (existingLike) {
      res.status(400).json({ message: 'Already sent interest to this user' })
      return
    }

    // Create like
    const like = new Like({
      from,
      to,
      type,
      message,
    })

    // Check for mutual match
    const reverseLike = await Like.findOne({ from: to, to: from })
    if (reverseLike) {
      like.mutualMatch = true
      reverseLike.mutualMatch = true
      await reverseLike.save()

      // 🔔 NOTIFICATION WALI: Si le destinataire est une femme avec un Wali configuré
      if (targetUser.gender === 'female' && targetUser.waliInfo?.notifyOnNewMessage && targetUser.waliInfo?.email) {
        sendWaliNewMatchNotification(
          targetUser.waliInfo.email,
          targetUser.waliInfo.fullName,
          targetUser.firstName,
          sender.firstName + ' ' + sender.lastName,
          sender.age || 0,
          sender.city || 'Non spécifié'
        ).catch((err) => console.error('Failed to send Wali match notification:', err))
      }
    }

    await like.save()

    // Increment daily like count for free users
    if (!isPremium && sender.dailyLikes) {
      sender.dailyLikes.count += 1
      await sender.save()
    }

    res.status(201).json({ 
      message: 'Interest sent successfully',
      mutualMatch: like.mutualMatch,
      dailyLikesRemaining: isPremium ? null : (3 - (sender.dailyLikes?.count || 0))
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/likes/received - Get likes received by current user
router.get('/received', async (req: AuthRequest, res): Promise<void> => {
  try {
    const likes = await Like.find({ to: req.userId })
      .populate('from', 'firstName lastName age city photos gender religiousInfo')
      .sort({ createdAt: -1 })

    res.json(likes)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/likes/sent - Get likes sent by current user
router.get('/sent', async (req: AuthRequest, res): Promise<void> => {
  try {
    const likes = await Like.find({ from: req.userId })
      .populate('to', 'firstName lastName age city photos gender religiousInfo')
      .sort({ createdAt: -1 })

    res.json(likes)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/likes/matches - Get mutual matches
router.get('/matches', async (req: AuthRequest, res): Promise<void> => {
  try {
    const matches = await Like.find({ 
      from: req.userId,
      mutualMatch: true 
    })
      .populate('to', 'firstName lastName age city photos gender religiousInfo')
      .sort({ createdAt: -1 })

    res.json(matches)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/likes/remaining - Get remaining daily likes for free users
router.get('/remaining', async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    const subscription = await Subscription.findOne({ userId: req.userId })
    
    const isPremium = subscription?.plan !== 'free' && subscription?.status === 'active'
    
    if (isPremium) {
      res.json({ remaining: 'unlimited', isPremium: true })
      return
    }

    // Check if counter needs reset
    const now = new Date()
    const lastReset = user?.dailyLikes?.lastReset || new Date(0)
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceReset >= 24 && user) {
      user.dailyLikes = { count: 0, lastReset: now }
      await user.save()
    }

    const remaining = 3 - (user?.dailyLikes?.count || 0)
    
    res.json({ 
      remaining: Math.max(0, remaining),
      total: 3,
      isPremium: false,
      resetsIn: 24 - hoursSinceReset
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/likes/:likeId - Delete a like
router.delete('/:likeId', async (req: AuthRequest, res): Promise<void> => {
  try {
    const like = await Like.findOneAndDelete({
      _id: req.params.likeId,
      from: req.userId
    })

    if (!like) {
      res.status(404).json({ message: 'Like not found' })
      return
    }

    res.json({ message: 'Like removed' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
