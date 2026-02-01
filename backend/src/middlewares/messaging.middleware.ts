import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { Message } from '@/modules/chat/chat.model'

/**
 * Anti-spam middleware for ethical messaging
 * Blocks external links (Instagram, WhatsApp, phone numbers) in first 3 messages
 */
export async function antiSpamMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId, text } = req.body

    if (!conversationId || !text) {
      next()
      return
    }

    // Count messages in this conversation from this user
    const messageCount = await Message.countDocuments({
      conversationId,
      senderId: req.userId,
    })

    // Only apply spam filter to first 3 messages
    if (messageCount < 3) {
      // Regex patterns for common external contact methods
      const patterns = {
        instagram: /(?:instagram|insta|ig)[\s:@]*([\w.]+)|@([\w.]+)/gi,
        whatsapp: /(?:whatsapp|wa|whats\s*app)[\s:]*([\d\s+()-]+)?/gi,
        phone: /(?:^|[\s\D])((?:\+|00)?[\d\s()-]{8,})/g,
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        telegram: /(?:telegram|tg)[\s:@]*([\w.]+)|t\.me\/([\w.]+)/gi,
        snapchat: /(?:snapchat|snap)[\s:@]*([\w.]+)/gi,
        facebook: /(?:facebook|fb)[\s:/]*([\w.]+)|fb\.com\/([\w.]+)/gi,
        tiktok: /(?:tiktok|tt)[\s:@]*([\w.]+)|tiktok\.com\/@([\w.]+)/gi,
      }

      const blockedContent = []
      
      for (const [platform, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
          blockedContent.push(platform)
        }
      }

      if (blockedContent.length > 0) {
        res.status(403).json({
          message: `Pour votre sécurité, les liens externes (${blockedContent.join(', ')}) sont bloqués dans les 3 premiers messages. Prenez le temps de vous connaître ici d'abord.`,
          blockedContent,
          isSpam: true,
          messagesRemaining: 3 - messageCount,
        })
        return
      }
    }

    next()
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Check if user has access to see unblurred photos
 * Premium users can see photos if they have mutual match
 */
export function canSeePhotos(
  userSubscription: any,
  hasMutualMatch: boolean
): boolean {
  // Free users can never see photos
  if (userSubscription?.plan === 'free' || !userSubscription) {
    return false
  }

  // Premium users can see photos only if mutual match
  if (userSubscription.plan === 'premium' || userSubscription.plan === 'vip') {
    return hasMutualMatch
  }

  return false
}
